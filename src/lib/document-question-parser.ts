// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth");
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
  warnings?: string[];
  metadata?: Record<string, any>;
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
 * Fallback stream text extraction for standard uncompressed or stream-based PDF blocks
 */
function extractPdfStreamFallback(buffer: Buffer): string {
  try {
    const raw = buffer.toString("latin1");
    const btRegex = /BT[\s\S]*?ET/g;
    const matches = raw.match(btRegex);
    if (!matches || matches.length === 0) return "";

    const textPieces: string[] = [];
    for (const block of matches) {
      // Single strings: (text) Tj
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let m: RegExpExecArray | null;
      while ((m = tjRegex.exec(block)) !== null) {
        textPieces.push(m[1]);
      }
      // Array strings: [(text) -20 (more)] TJ
      const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
      let arrM: RegExpExecArray | null;
      while ((arrM = arrayTjRegex.exec(block)) !== null) {
        const inner = arrM[1];
        const innerStrRegex = /\(([^)]+)\)/g;
        let strM: RegExpExecArray | null;
        while ((strM = innerStrRegex.exec(inner)) !== null) {
          textPieces.push(strM[1]);
        }
      }
    }
    return textPieces.join("\n").trim();
  } catch (err) {
    console.warn("[document-parser] Fallback stream extraction warning:", err);
    return "";
  }
}

/**
 * Extracts plain text from an uploaded buffer (PDF or Word)
 */
/**
 * Primary PDF text extractor using unpdf (serverless/Next.js/Node runtime compatible, zero-worker issue)
 */
async function extractPdfTextWithUnpdf(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const uint8 = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8);
  const pageCount = pdf.numPages || 1;
  const { text } = await extractText(pdf, { mergePages: true });
  return { text: text || "", pageCount };
}

/**
 * Secondary PDF text extractor using pdfjs-dist legacy Node engine
 */
async function extractPdfTextWithPdfJs(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable worker in Node.js server environment to avoid missing worker file issues
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = "";
  }

  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0,
    isEvalSupported: false,
  });

  const doc = await loadingTask.promise;
  const pageCount = doc.numPages || 1;
  let fullText = "";

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = "";
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if ("str" in item) {
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += "\n";
        } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
          pageText += " ";
        }
        pageText += item.str;
        if ((item as any).hasEOL) {
          pageText += "\n";
        }
        lastY = currentY;
      }
    }
    fullText += pageText + "\n\n";
  }

  return { text: fullText.trim(), pageCount };
}

/**
 * Extracts plain text from an uploaded buffer (PDF or Word)
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; fileType: "PDF" | "DOCX" | "DOC"; isScannedPdf?: boolean; pageCount?: number; parserUsed?: string; debugInfo?: string }> {
  const lowerName = fileName.toLowerCase();

  // 1. PDF Extraction
  if (lowerName.endsWith(".pdf") || buffer.slice(0, 5).toString("ascii") === "%PDF-") {
    let extractedText = "";
    let pageCount = 1;
    let parserUsed = "";
    const debugErrors: string[] = [];

    // Strategy 1: unpdf (Modern, Webpack/Next.js/Serverless friendly, no worker resolution errors)
    try {
      const unpdfResult = await extractPdfTextWithUnpdf(buffer);
      if (unpdfResult && unpdfResult.text && unpdfResult.text.trim().length >= 20) {
        extractedText = unpdfResult.text;
        pageCount = unpdfResult.pageCount;
        parserUsed = "unpdf (modern Next.js engine)";
      }
    } catch (unpdfErr: any) {
      debugErrors.push(`unpdf failed: ${unpdfErr?.message || unpdfErr}`);
      console.warn("[document-parser] Primary unpdf failed, trying secondary parser:", unpdfErr?.message || unpdfErr);
    }

    // Strategy 2: pdfjs-dist legacy Node engine
    if (!extractedText || extractedText.trim().length < 20) {
      try {
        const pdfJsResult = await extractPdfTextWithPdfJs(buffer);
        if (pdfJsResult && pdfJsResult.text && pdfJsResult.text.length >= 20) {
          extractedText = pdfJsResult.text;
          pageCount = pdfJsResult.pageCount;
          parserUsed = "pdfjs-dist/legacy";
        }
      } catch (pdfJsErr: any) {
        debugErrors.push(`pdfjs-dist failed: ${pdfJsErr?.message || pdfJsErr}`);
        console.warn("[document-parser] Secondary pdfjs-dist failed, trying tertiary parser:", pdfJsErr?.message || pdfJsErr);
      }
    }

    // Strategy 2: pdf-parse fallback (v2 class or v1 function)
    if (!extractedText || extractedText.trim().length < 20) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfModule = require("pdf-parse");
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: buffer });
          const result = await parser.getText();
          if (result && typeof result.text === "string" && result.text.length >= 20) {
            extractedText = result.text;
            pageCount = result.total || result.pages?.length || pageCount;
            parserUsed = "pdf-parse (v2)";
          }
        } else if (typeof pdfModule === "function") {
          const result = await pdfModule(buffer);
          if (result && typeof result.text === "string" && result.text.length >= 20) {
            extractedText = result.text;
            pageCount = result.numpages || pageCount;
            parserUsed = "pdf-parse (v1)";
          }
        }
      } catch (pdfParseErr: any) {
        debugErrors.push(`pdf-parse failed: ${pdfParseErr?.message || pdfParseErr}`);
        console.warn("[document-parser] Fallback pdf-parse failed:", pdfParseErr?.message || pdfParseErr);
      }
    }

    // Strategy 3: Direct PDF stream text extractor
    if (!extractedText || extractedText.trim().length < 20) {
      const fallbackText = extractPdfStreamFallback(buffer);
      if (fallbackText && fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
        parserUsed = "pdf-stream-fallback";
      }
    }

    const trimmedText = extractedText.trim();
    // Scanned image PDF detection: document has pages but virtually no selectable text
    const isScannedPdf = pageCount >= 1 && trimmedText.length < 20;

    return {
      text: extractedText,
      fileType: "PDF",
      isScannedPdf,
      pageCount,
      parserUsed: parserUsed || "none",
      debugInfo: debugErrors.join(" | "),
    };
  }

  // 2. Word (.docx / .doc) Extraction
  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result?.value || "";
    return {
      text,
      fileType: lowerName.endsWith(".doc") ? "DOC" : "DOCX",
      isScannedPdf: false,
    };
  }

  throw new Error(`Unsupported file type for '${fileName}'. Supported formats are PDF (.pdf) and Word (.docx, .doc).`);
}

/**
 * Parses questions, options, answers, explanations, and metadata from raw document text
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
  const warnings: string[] = [];
  const metadata: Record<string, any> = {
    fileName,
    category: defaults.category || "Technical",
    topic: defaults.topic || "General",
    difficulty: defaults.difficulty || "MEDIUM",
  };

  // 1. Detect Document-Level Metadata (e.g. Subject, Topic, Difficulty Level)
  const subjectMatch = rawText.match(/Subject:\s*([^\t\r\n]+)/i);
  if (subjectMatch) metadata.subject = subjectMatch[1].trim();

  const topicMatch = rawText.match(/Topic:\s*([^\t\r\n]+)/i);
  if (topicMatch) {
    metadata.topic = topicMatch[1].trim();
  }

  const diffMatch = rawText.match(/Difficulty(?:\s*Level)?:\s*([^\t\r\n]+)/i);
  if (diffMatch) {
    const dVal = diffMatch[1].trim().toUpperCase();
    if (dVal.includes("INTERMEDIATE") || dVal.includes("MEDIUM")) {
      metadata.difficulty = "MEDIUM";
    } else if (dVal.includes("HARD") || dVal.includes("ADVANCED")) {
      metadata.difficulty = "HARD";
    } else if (dVal.includes("EASY") || dVal.includes("BEGINNER")) {
      metadata.difficulty = "EASY";
    }
  }

  const defaultCategory = (metadata.category as QuestionCategory) || "Technical";
  const defaultDifficulty = (metadata.difficulty as QuestionDifficulty) || "MEDIUM";
  const defaultMarks = defaults.marks ?? 2;
  const defaultNegMarks = defaults.negativeMarks ?? 0.5;
  const defaultTopic = metadata.topic || "General";

  // 2. Check if an Answer Key block exists at the end
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
    if (answerKeyMatch.index !== undefined && answerKeyMatch.index > 50) {
      textToProcess = rawText.substring(0, answerKeyMatch.index);
    }
  }

  // 3. Clean lines and strip page footers/headers
  const rawLines = textToProcess.split(/\r?\n/);
  const cleanLines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Filter out page footers, page counts, and metadata banners
    if (/^Page\s*\d+\s*of\s*\d+$/i.test(trimmed)) continue;
    if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(trimmed)) continue;
    if (/^Generated for\s/i.test(trimmed)) continue;

    cleanLines.push(trimmed);
  }

  // 4. Identify Question Blocks
  // Matches "QUESTION 1", "Question 1:", "Q1.", "1.", "1)" with or without text on same line
  const questionHeaderRegex = /^(?:(?:QUESTION|Q)\s*(\d+)[:.]?|(\d+)[:.)\]])(?:\s*(.*))?$/i;
  const questionBlocks: { qNum: number; headerRemainder: string; lines: string[] }[] = [];
  let currentBlock: { qNum: number; headerRemainder: string; lines: string[] } | null = null;

  for (const line of cleanLines) {
    const qMatch = line.match(questionHeaderRegex);
    if (qMatch) {
      if (currentBlock && (currentBlock.headerRemainder || currentBlock.lines.length > 0)) {
        questionBlocks.push(currentBlock);
      }
      const qNum = parseInt(qMatch[1] || qMatch[2], 10) || questionBlocks.length + 1;
      currentBlock = {
        qNum,
        headerRemainder: (qMatch[3] || "").trim(),
        lines: [],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock && (currentBlock.headerRemainder || currentBlock.lines.length > 0)) {
    questionBlocks.push(currentBlock);
  }

  // 5. Parse Each Question Block
  const candidates: ParsedQuestionCandidate[] = [];

  const optionRegex = /^(?:([A-Da-d])\s*[-.)\]]|\(([A-Da-d])\))\s*(.+)/;
  const answerRegex = /^(?:CORRECT\s*ANSWER|Correct\s*Answer|Correct\s*Option|Answer|Ans)\s*[:=]\s*(.+)/i;
  const expRegex = /^(?:Explanation|Reason):\s*(.+)/i;
  const marksRegex = /^(?:\[(?:Marks?|Pts?):\s*(\d+)\]|\((\d+)\s*(?:marks?|pts?)\)|Marks?\s*:\s*(\d+))/i;
  const negMarksRegex = /^(?:\[(?:Neg(?:ative)?|Deduct):\s*(-?\d+(?:\.\d+)?)\]|Negative\s*Marks?\s*:\s*(-?\d+(?:\.\d+)?))/i;
  const diffRegex = /^(?:\[(?:Difficulty|Level):\s*(Easy|Medium|Hard)\]|Difficulty(?:\s*Level)?\s*:\s*(Easy|Medium|Hard|Intermediate|Advanced|Beginner))/i;
  const topicRegex = /^(?:\[Topic:\s*([^\]]+)\]|Topic\s*:\s*(.+))/i;
  const typeRegex = /^(?:Type\s*:\s*(.+))/i;

  questionBlocks.forEach((block, idx) => {
    const qNum = block.qNum || idx + 1;
    let marks = defaultMarks;
    let negativeMarks = defaultNegMarks;
    let difficulty: QuestionDifficulty = defaultDifficulty;
    let category: QuestionCategory = defaultCategory;
    let topic = defaultTopic;

    const qStemLines: string[] = [];
    if (block.headerRemainder) {
      qStemLines.push(block.headerRemainder);
    }

    const optionsMap = new Map<string, string>(); // 'A' -> option text
    const optionsOrder: string[] = [];
    let currentOptionLetter: string | null = null;

    let detectedAnswer = "";
    const explanationLines: string[] = [];
    let inExplanation = false;

    for (const rawLine of block.lines) {
      // Check Answer line
      const ansMatch = rawLine.match(answerRegex);
      if (ansMatch) {
        inExplanation = false;
        currentOptionLetter = null;
        detectedAnswer = ansMatch[1].trim();
        continue;
      }

      // Check Explanation line
      const expMatch = rawLine.match(expRegex);
      if (expMatch) {
        inExplanation = true;
        currentOptionLetter = null;
        explanationLines.push(expMatch[1].trim());
        continue;
      }

      // If in explanation mode, subsequent lines until next question belong to explanation
      if (inExplanation) {
        explanationLines.push(rawLine);
        continue;
      }

      // Check Option line (e.g. "A) Supervised...")
      const optMatch = rawLine.match(optionRegex);
      if (optMatch) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase();
        const optText = optMatch[3].trim();
        currentOptionLetter = letter;
        optionsMap.set(letter, optText);
        optionsOrder.push(letter);
        continue;
      }

      // Multi-line Option Continuation: If we are collecting an option and the line is not a metadata/answer line
      if (currentOptionLetter) {
        const prev = optionsMap.get(currentOptionLetter) || "";
        optionsMap.set(currentOptionLetter, `${prev} ${rawLine}`.trim());
        continue;
      }

      // Metadata tags
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
        if (dStr.includes("EASY") || dStr.includes("BEGINNER")) difficulty = "EASY";
        else if (dStr.includes("HARD") || dStr.includes("ADVANCED")) difficulty = "HARD";
        else difficulty = "MEDIUM";
        continue;
      }
      const tMatch = rawLine.match(topicRegex);
      if (tMatch) {
        topic = (tMatch[1] || tMatch[2]).trim();
        continue;
      }
      const tpMatch = rawLine.match(typeRegex);
      if (tpMatch) continue;

      // Question Stem Line
      qStemLines.push(rawLine);
    }

    // Check Answer Key from end of doc if not inline
    if (!detectedAnswer && answerKeyMap.has(qNum)) {
      detectedAnswer = answerKeyMap.get(qNum)!;
    }

    const questionText = qStemLines.join(" ").trim();
    const explanation = explanationLines.join(" ").trim();

    // Reconstruct options array
    const options: string[] = [];
    const lettersPresent = optionsOrder.length > 0 ? Array.from(new Set(optionsOrder)) : ["A", "B", "C", "D"];
    for (const ltr of lettersPresent) {
      if (optionsMap.has(ltr)) {
        options.push(optionsMap.get(ltr)!);
      }
    }

    // Determine Question Type
    let type: QuestionType = "SINGLE_CHOICE";
    const isTrueFalse =
      options.length === 2 &&
      options.some((o) => o.toLowerCase() === "true") &&
      options.some((o) => o.toLowerCase() === "false");

    if (isTrueFalse) {
      type = "TRUE_FALSE";
    } else if (
      (detectedAnswer.includes(",") || detectedAnswer.includes(";")) &&
      options.length > 2
    ) {
      type = "MULTIPLE_CHOICE";
    } else if (options.length === 0 && detectedAnswer) {
      type = "SHORT_ANSWER";
    }

    // Resolve Correct Answer
    let correctAnswer: string | string[] = detectedAnswer;
    const cleanLetter = detectedAnswer.trim().toUpperCase().replace(/[^A-D]/g, "");

    if (type === "MULTIPLE_CHOICE") {
      const parts = detectedAnswer.split(/[,;]/).map((p) => p.trim().toUpperCase());
      correctAnswer = parts.map((p) => optionsMap.get(p) || p).filter(Boolean);
    } else if (cleanLetter && optionsMap.has(cleanLetter)) {
      correctAnswer = optionsMap.get(cleanLetter)!;
    } else if (optionsMap.has(detectedAnswer.toUpperCase())) {
      correctAnswer = optionsMap.get(detectedAnswer.toUpperCase())!;
    }

    // Validation Status
    let status: "READY" | "NEEDS_REVIEW" | "DUPLICATE" | "INVALID" = "READY";
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
      rawIndex: qNum,
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
