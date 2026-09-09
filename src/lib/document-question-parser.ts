// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");
import mammoth from "mammoth";
import {
  ParsedQuestionCandidate,
  QuestionType,
  QuestionDifficulty,
  QuestionCategory,
  AssessmentQuestion,
} from "@/types";

export interface DocumentParseResult {
  success: boolean;
  fileName: string;
  fileType: "PDF" | "DOCX" | "DOC";
  rawTextLength: number;
  isScannedPdf?: boolean;
  questions: ParsedQuestionCandidate[];
  summary: {
    totalDetected: number;
    ready: number;
    needsReview: number;
    duplicates: number;
    invalid: number;
  };
  error?: string;
}

/**
 * Normalizes text for reliable duplicate comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates token overlap similarity between two strings
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  if (norm1 === norm2) return 1.0;

  const words1 = new Set(norm1.split(" ").filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(" ").filter((w) => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  const jaccard = union > 0 ? intersection / union : 0;
  const containment = intersection / Math.min(words1.size, words2.size);
  return Math.max(jaccard, containment * 0.85);
}

/**
 * Extracts plain text from an uploaded buffer (PDF or Word)
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileType: "PDF" | "DOCX" | "DOC"; isScannedPdf?: boolean }> {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    const data = await pdf(buffer);
    const text = data.text || "";
    // If multiple pages exist but extracted text is tiny, it's likely a scanned image PDF
    const isScannedPdf = data.numpages > 1 && text.trim().length < 50;
    return { text, fileType: "PDF", isScannedPdf };
  }

  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value || "", fileType: lowerName.endsWith(".doc") ? "DOC" : "DOCX" };
  }

  throw new Error(`Unsupported file type for '${fileName}'. Only PDF, DOCX, and DOC are supported.`);
}

/**
 * Parses questions, options, answers, and metadata from raw document text
 */
export function parseQuestionsFromDocumentText(
  rawText: string,
  fileName: string = "document",
  defaults: {
    category?: QuestionCategory;
    difficulty?: QuestionDifficulty;
    marks?: number;
    negativeMarks?: number;
    topic?: string;
  } = {}
): {
  questions: ParsedQuestionCandidate[];
  warnings: string[];
  metadata: Record<string, any>;
} {
  const defaultCategory = defaults.category || "Technical";
  const defaultDifficulty = defaults.difficulty || "MEDIUM";
  const defaultMarks = defaults.marks ?? 2;
  const defaultNegMarks = defaults.negativeMarks ?? 0.5;
  const defaultTopic = defaults.topic || "General";
  const warnings: string[] = [];
  const metadata: Record<string, any> = { fileName };

  // Check if an Answer Key section exists at the end
  const answerKeyMap = new Map<number, string>();
  const answerKeyRegex = /(?:Answer\s*Key|Answers|Keys)[\s\S]*$/i;
  const answerKeyMatch = rawText.match(answerKeyRegex);
  let textToProcess = rawText;

  if (answerKeyMatch) {
    const keyBlock = answerKeyMatch[0];
    const keyPairRegex = /(?:Q(?:uestion)?\s*)?(\d+)\s*[-.:)]\s*([A-Da-d](?:\s*,\s*[A-Da-d])*|True|False)/gi;
    let kMatch: RegExpExecArray | null;
    while ((kMatch = keyPairRegex.exec(keyBlock)) !== null) {
      const qNum = parseInt(kMatch[1], 10);
      const ansVal = kMatch[2].trim();
      answerKeyMap.set(qNum, ansVal);
    }
    if (answerKeyMatch.index !== undefined) {
      textToProcess = rawText.substring(0, answerKeyMatch.index);
    }
  }

  // Split document into lines and group into questions
  const lines = textToProcess
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const questionRegex = /^(?:Q(?:uestion)?\s*(\d+)[:.]?|(\d+)[:.)\]])\s*(.+)/i;
  const questionBlocks: { qNum?: number; lines: string[] }[] = [];
  let currentBlock: { qNum?: number; lines: string[] } | null = null;

  for (const line of lines) {
    // If line starts a new question
    const qMatch = line.match(questionRegex);
    if (qMatch) {
      if (currentBlock && currentBlock.lines.length > 0) {
        questionBlocks.push(currentBlock);
      }
      const qNum = parseInt(qMatch[1] || qMatch[2], 10);
      currentBlock = {
        qNum: isNaN(qNum) ? undefined : qNum,
        lines: [line],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock && currentBlock.lines.length > 0) {
    questionBlocks.push(currentBlock);
  }

  // Parse each question block
  const candidates: ParsedQuestionCandidate[] = [];

  questionBlocks.forEach((block, idx) => {
    const qNum = block.qNum || idx + 1;
    let questionText = "";
    const options: string[] = [];
    let correctAnswer: string | string[] = "";
    let explanation = "";
    let marks = defaultMarks;
    let negativeMarks = defaultNegMarks;
    let difficulty: QuestionDifficulty = defaultDifficulty;
    let category: QuestionCategory = defaultCategory;
    let topic = defaultTopic;

    const optionRegex = /^(?:([A-Da-d])\s*[-.)\]]|\(([A-Da-d])\))\s*(.+)/;
    const answerRegex = /^(?:Correct\s*Answer|Answer|Ans)\s*[:=]\s*(.+)/i;
    const marksRegex = /^(?:\[(?:Marks?|Pts?):\s*(\d+)\]|\((\d+)\s*(?:marks?|pts?)\)|Marks?\s*:\s*(\d+))/i;
    const negMarksRegex = /^(?:\[(?:Neg(?:ative)?|Deduct):\s*(-?\d+(?:\.\d+)?)\]|Negative\s*Marks?\s*:\s*(-?\d+(?:\.\d+)?))/i;
    const diffRegex = /^(?:\[(?:Difficulty|Level):\s*(Easy|Medium|Hard)\]|Difficulty\s*:\s*(Easy|Medium|Hard))/i;
    const topicRegex = /^(?:\[Topic:\s*([^\]]+)\]|Topic\s*:\s*(.+))/i;
    const typeRegex = /^(?:Type\s*:\s*(.+))/i;
    const expRegex = /^(?:Explanation|Reason):\s*(.+)/i;

    const optionLetterMap = new Map<string, string>(); // 'A' -> "O(log n)"

    const qLines: string[] = [];

    for (const rawLine of block.lines) {
      // Check Answer line
      const ansMatch = rawLine.match(answerRegex);
      if (ansMatch) {
        correctAnswer = ansMatch[1].trim();
        continue;
      }

      // Check Explanation line
      const expMatch = rawLine.match(expRegex);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      // Check Option line
      const optMatch = rawLine.match(optionRegex);
      if (optMatch) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase();
        const optText = optMatch[3].trim();
        options.push(optText);
        optionLetterMap.set(letter, optText);
        continue;
      }

      // Metadata extraction
      const mMatch = rawLine.match(marksRegex);
      if (mMatch) {
        marks = parseInt(mMatch[1] || mMatch[2] || mMatch[3], 10) || defaultMarks;
        continue;
      }
      const nmMatch = rawLine.match(negMarksRegex);
      if (nmMatch) {
        negativeMarks = Math.abs(parseFloat(nmMatch[1] || nmMatch[2])) || defaultNegMarks;
        continue;
      }
      const dMatch = rawLine.match(diffRegex);
      if (dMatch) {
        const dStr = (dMatch[1] || dMatch[2]).toUpperCase();
        if (dStr === "EASY" || dStr === "MEDIUM" || dStr === "HARD") {
          difficulty = dStr as QuestionDifficulty;
        }
        continue;
      }
      const tMatch = rawLine.match(topicRegex);
      if (tMatch) {
        topic = (tMatch[1] || tMatch[2]).trim();
        continue;
      }
      const tpMatch = rawLine.match(typeRegex);
      if (tpMatch) {
        continue;
      }

      // Clean line from question header on first line
      if (qLines.length === 0) {
        const cleaned = rawLine.replace(/^(?:Q(?:uestion)?\s*\d+[:.]?|\d+[:.)\]])\s*/i, "").trim();
        if (cleaned) qLines.push(cleaned);
      } else {
        qLines.push(rawLine);
      }
    }

    questionText = qLines.join(" ").trim();

    // If answer wasn't inline, check if found in the end-of-document Answer Key
    if (!correctAnswer && answerKeyMap.has(qNum)) {
      correctAnswer = answerKeyMap.get(qNum)!;
    }

    // Determine Question Type
    let type: QuestionType = "SINGLE_CHOICE";
    const isTrueFalse =
      options.length === 2 &&
      options.some((o) => o.toLowerCase() === "true") &&
      options.some((o) => o.toLowerCase() === "false");

    if (isTrueFalse) {
      type = "TRUE_FALSE";
    } else if (typeof correctAnswer === "string" && (correctAnswer.includes(",") || correctAnswer.includes(";"))) {
      type = "MULTIPLE_CHOICE";
    } else if (options.length === 0 && correctAnswer) {
      type = "SHORT_ANSWER";
    }

    // Map letter answer (e.g. "B" or "A, C") to actual option text or normalized letters
    if (typeof correctAnswer === "string") {
      if (type === "MULTIPLE_CHOICE") {
        const letters = correctAnswer.split(/[,;]/).map((s) => s.trim().toUpperCase());
        correctAnswer = letters
          .map((ltr) => optionLetterMap.get(ltr) || ltr)
          .filter(Boolean);
      } else if (optionLetterMap.has(correctAnswer.toUpperCase())) {
        correctAnswer = optionLetterMap.get(correctAnswer.toUpperCase())!;
      }
    }

    // Validation Status
    let status: "READY" | "NEEDS_REVIEW" | "INVALID" = "READY";
    let reviewReason: string | undefined;

    if (!questionText || questionText.length < 5) {
      status = "INVALID";
      reviewReason = "Question text is too short or empty.";
    } else if (type === "SINGLE_CHOICE" && options.length < 2) {
      status = "NEEDS_REVIEW";
      reviewReason = `Single choice question must have at least 2 options (detected ${options.length}).`;
    } else if (type === "MULTIPLE_CHOICE" && options.length < 2) {
      status = "NEEDS_REVIEW";
      reviewReason = `Multiple choice question must have at least 2 options (detected ${options.length}).`;
    } else if (!correctAnswer || (Array.isArray(correctAnswer) && correctAnswer.length === 0)) {
      status = "NEEDS_REVIEW";
      reviewReason = "Correct answer could not be confidently detected from document.";
    }

    const tempId = `cand_${Date.now()}_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`;
    const validationIssues = reviewReason ? [reviewReason] : [];

    candidates.push({
      id: tempId,
      tempId,
      rawIndex: qNum || idx + 1,
      questionNumber: qNum,
      questionText,
      type,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      difficulty,
      category,
      topic,
      explanation,
      status,
      validationStatus: status,
      reviewReason,
      validationIssues,
      duplicateStatus: "UNIQUE",
    });
  });

  return {
    questions: candidates,
    warnings,
    metadata,
  };
}

/**
 * Compares parsed candidates against existing Question Bank to detect duplicates
 */
export function checkDuplicatesAgainstBank(
  candidates: ParsedQuestionCandidate[],
  existingQuestions: AssessmentQuestion[]
): ParsedQuestionCandidate[] {
  for (const cand of candidates) {
    if (cand.status === "INVALID") continue;

    const candNorm = normalizeText(cand.questionText);
    let matchedExact: AssessmentQuestion | null = null;
    let matchedLikely: AssessmentQuestion | null = null;
    let highestSim = 0;

    for (const ex of existingQuestions) {
      const exNorm = normalizeText(ex.questionText);
      if (candNorm === exNorm) {
        matchedExact = ex;
        break;
      }

      const sim = calculateSimilarity(cand.questionText, ex.questionText);
      if (sim > 0.82 && sim > highestSim) {
        highestSim = sim;
        matchedLikely = ex;
      }
    }

    if (matchedExact) {
      cand.duplicateStatus = "EXACT_DUPLICATE";
      cand.matchedExistingQuestionId = matchedExact.id;
      cand.matchedQuestionText = matchedExact.questionText;
      cand.duplicateReason = `Matches existing question: "${matchedExact.questionText.slice(0, 80)}"`;
      cand.status = "DUPLICATE";
      cand.validationStatus = "DUPLICATE";
      cand.reviewReason = `Exact duplicate of existing question in bank (ID: ${matchedExact.id}).`;
      cand.validationIssues = [cand.reviewReason];
    } else if (matchedLikely) {
      cand.duplicateStatus = "LIKELY_DUPLICATE";
      cand.matchedExistingQuestionId = matchedLikely.id;
      cand.matchedQuestionText = matchedLikely.questionText;
      cand.duplicateReason = `${Math.round(highestSim * 100)}% similarity to "${matchedLikely.questionText.slice(0, 80)}"`;
      if (cand.status === "READY") {
        cand.status = "NEEDS_REVIEW";
        cand.validationStatus = "NEEDS_REVIEW";
        cand.reviewReason = `Likely duplicate (${Math.round(highestSim * 100)}% match) of: "${matchedLikely.questionText.slice(0, 60)}..."`;
        cand.validationIssues = [cand.reviewReason];
      }
    } else {
      cand.duplicateStatus = "UNIQUE";
    }
  }
  return candidates;
}
