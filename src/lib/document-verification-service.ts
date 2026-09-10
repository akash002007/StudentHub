import {
  DocumentType,
  DocumentStatus,
  DocumentVerificationAttempt,
  StudentProfile,
} from "@/types";
import { ResumeParser } from "@/lib/resume-parser";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface DocumentClassificationResult {
  detectedType: DocumentType;
  confidence: number;
  matchesClaimed: boolean;
  reason?: string;
}

export interface ExtractedDocumentFields {
  studentName?: string;
  institution?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: string;
  registrationNumber?: string;
  companyName?: string;
  internshipRole?: string;
  startDate?: string;
  endDate?: string;
  idNumberMasked?: string;
  documentCategory?: string;
  rawTextPreview: string;
}

export interface VerificationEvaluationResult {
  status: DocumentStatus;
  confidenceScore: number;
  extractedData: ExtractedDocumentFields;
  matchedFields: string[];
  failedChecks: string[];
  warnings: string[];
  reason: string;
}

export class DocumentVerificationService {
  /**
   * STEP 1: Strict File Validation & Security Verification
   */
  static validateDocument(
    buffer: Buffer,
    fileName: string,
    claimedMimeType: string
  ): FileValidationResult {
    if (!buffer || buffer.length === 0) {
      return {
        valid: false,
        error: "Uploaded document file is empty or corrupted.",
        fileSizeBytes: 0,
        mimeType: claimedMimeType,
      };
    }

    const fileSizeBytes = buffer.length;
    // 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileSizeBytes > MAX_SIZE) {
      return {
        valid: false,
        error: "File size exceeds the 10 MB maximum limit.",
        fileSizeBytes,
        mimeType: claimedMimeType,
      };
    }

    const lowerName = fileName.toLowerCase();
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"];
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    const validMimes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const hasValidMime = validMimes.includes(claimedMimeType);

    if (!hasValidExt && !hasValidMime) {
      return {
        valid: false,
        error:
          "Unsupported file format. Please upload a PDF, PNG, JPG, or DOCX document.",
        fileSizeBytes,
        mimeType: claimedMimeType,
      };
    }

    // Inspect file header magic bytes
    const isPdfMagic = buffer.subarray(0, 4).toString("utf-8") === "%PDF";
    const isPngMagic =
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isJpgMagic =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    if (lowerName.endsWith(".pdf") && !isPdfMagic && claimedMimeType === "application/pdf") {
      return {
        valid: false,
        error: "Corrupted PDF structure detected. Please provide a valid PDF scan.",
        fileSizeBytes,
        mimeType: claimedMimeType,
      };
    }

    return {
      valid: true,
      fileSizeBytes,
      mimeType: claimedMimeType || (isPdfMagic ? "application/pdf" : "image/jpeg"),
    };
  }

  /**
   * STEP 2: Document Classification
   */
  static classifyDocument(
    extractedText: string,
    fileName: string,
    claimedType: DocumentType
  ): DocumentClassificationResult {
    const text = extractedText.toLowerCase();
    const fname = fileName.toLowerCase();

    const typeScores: Record<DocumentType, number> = {
      RESUME: 0,
      DEGREE_CERTIFICATE: 0,
      MARKSHEET: 0,
      INTERNSHIP_CERTIFICATE: 0,
      PROJECT_CERTIFICATE: 0,
      GOVERNMENT_ID: 0,
      COLLEGE_ID: 0,
      OTHER: 0,
    };

    // Keyword heuristics
    if (text.includes("degree") || text.includes("bachelor") || text.includes("conferred") || text.includes("convocation") || text.includes("hereby certifies that")) {
      typeScores.DEGREE_CERTIFICATE += 40;
    }
    if (text.includes("statement of marks") || text.includes("transcript") || text.includes("semester") || text.includes("cgpa") || text.includes("sgpa") || text.includes("credit points")) {
      typeScores.MARKSHEET += 45;
    }
    if (text.includes("internship") || text.includes("intern") || text.includes("has successfully completed his/her internship") || text.includes("period of training")) {
      typeScores.INTERNSHIP_CERTIFICATE += 45;
    }
    if (text.includes("passport") || text.includes("driving licence") || text.includes("identity card") || text.includes("aadhaar") || text.includes("republic of") || text.includes("government of")) {
      typeScores.GOVERNMENT_ID += 45;
    }
    if (text.includes("student identity card") || text.includes("student id") || text.includes("campus card") || text.includes("valid up to") || text.includes("student card")) {
      typeScores.COLLEGE_ID += 40;
    }
    if (text.includes("curriculum vitae") || text.includes("resume") || text.includes("summary of experience") || (text.includes("skills") && text.includes("experience") && text.includes("projects"))) {
      typeScores.RESUME += 45;
    }

    // Filename clues
    if (fname.includes("degree") || fname.includes("convocation")) typeScores.DEGREE_CERTIFICATE += 20;
    if (fname.includes("marksheet") || fname.includes("transcript") || fname.includes("grade")) typeScores.MARKSHEET += 20;
    if (fname.includes("internship") || fname.includes("offer_letter") || fname.includes("training")) typeScores.INTERNSHIP_CERTIFICATE += 20;
    if (fname.includes("passport") || fname.includes("license") || fname.includes("id_proof") || fname.includes("gov")) typeScores.GOVERNMENT_ID += 20;
    if (fname.includes("college_id") || fname.includes("student_id") || fname.includes("campus")) typeScores.COLLEGE_ID += 20;
    if (fname.includes("resume") || fname.includes("cv")) typeScores.RESUME += 20;

    // Detect highest scoring type
    let detectedType: DocumentType = claimedType;
    let highestScore = 0;
    for (const [t, s] of Object.entries(typeScores)) {
      if (s > highestScore) {
        highestScore = s;
        detectedType = t as DocumentType;
      }
    }

    if (highestScore === 0) {
      return {
        detectedType: claimedType,
        confidence: 60,
        matchesClaimed: true,
      };
    }

    const matchesClaimed = detectedType === claimedType;
    let reason: string | undefined;

    if (!matchesClaimed && highestScore >= 35) {
      reason = `Uploaded document appears inconsistent with selected document type (${claimedType.replace("_", " ")} vs detected ${detectedType.replace("_", " ")}).`;
    }

    return {
      detectedType,
      confidence: Math.min(highestScore + 30, 95),
      matchesClaimed,
      reason,
    };
  }

  /**
   * STEP 3: OCR & Structured Data Extraction
   */
  static async extractDocumentData(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    docType: DocumentType
  ): Promise<ExtractedDocumentFields> {
    let rawText = "";

    try {
      if (fileName.toLowerCase().endsWith(".pdf") || mimeType.includes("pdf")) {
        rawText = await ResumeParser.extractText(buffer, fileName, mimeType);
      } else {
        const rawContent = buffer.toString("utf-8");
        const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
        rawText = readableStrings.join(" ").replace(/\s+/g, " ").trim();
      }
    } catch {
      // Fallback text preview extraction
      const rawContent = buffer.toString("utf-8");
      const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
      rawText = readableStrings.join(" ").replace(/\s+/g, " ").trim();
    }

    if (!rawText || rawText.length < 10) {
      rawText = `Document content for ${fileName}. Issued to candidate.`;
    }

    const extracted: ExtractedDocumentFields = {
      rawTextPreview: rawText.slice(0, 300),
    };

    // Extract student name
    const nameMatch =
      rawText.match(/(?:certif(?:y|ies)\s+that|name\s*[:\-]|candidate\s*[:\-]|issued to|this is to certify that)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i) ||
      rawText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
    if (nameMatch) {
      extracted.studentName = nameMatch[1].trim();
    }

    // Extract institution / University
    const uniMatch =
      rawText.match(/(?:university|institute of technology|college of engineering|stanford university|berkeley|mit|niat|iit|nit)[\w\s&]+/i) ||
      rawText.match(/institution\s*[:\-]\s*([A-Za-z\s&]+)/i);
    if (uniMatch) {
      extracted.institution = uniMatch[0].trim();
    }

    // Extract Degree
    const degreeMatch = rawText.match(
      /(?:bachelor of technology|bachelor of science|master of science|b\.tech|b\.s\.|m\.s\.|bachelor of engineering|b\.e\.)(?:[\w\s&]+)?/i
    );
    if (degreeMatch) {
      extracted.degree = degreeMatch[0].trim();
    }

    // Extract Branch / Specialization
    const branchMatch = rawText.match(
      /(?:computer science|electrical engineering|information technology|mechanical engineering|artificial intelligence|data science)/i
    );
    if (branchMatch) {
      extracted.branch = branchMatch[0].trim();
    }

    // Extract Graduation Year or Dates
    const yearMatch = rawText.match(/\b(202[0-9]|201[5-9])\b/);
    if (yearMatch) {
      extracted.graduationYear = parseInt(yearMatch[1], 10);
    }

    // Extract CGPA / Marks
    const cgpaMatch = rawText.match(/(?:cgpa|gpa|marks)\s*[:\-]?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*10(?:\.0)?)?)/i);
    if (cgpaMatch) {
      extracted.cgpa = cgpaMatch[1].trim();
    }

    // Extract Registration / Roll Number
    const regMatch = rawText.match(/(?:roll|reg(?:istration)?|id)\s*(?:no|num|number)?\s*[:\-]?\s*([A-Z0-9\-_]{6,15})/i);
    if (regMatch) {
      extracted.registrationNumber = regMatch[1].trim();
    }

    // Extract Company Name for Internship
    if (docType === "INTERNSHIP_CERTIFICATE") {
      const compMatch = rawText.match(/(?:at|with|organization|company)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&]{2,30})/i);
      if (compMatch) {
        extracted.companyName = compMatch[1].trim();
      }
    }

    return extracted;
  }

  /**
   * STEP 4 & 5: Data Matching, Scoring & Confidence Calculation
   */
  static evaluateVerification(
    claimedType: DocumentType,
    classification: DocumentClassificationResult,
    extracted: ExtractedDocumentFields,
    student: StudentProfile | null
  ): VerificationEvaluationResult {
    const matchedFields: string[] = [];
    const failedChecks: string[] = [];
    const warnings: string[] = [];

    // Check classification consistency
    if (!classification.matchesClaimed) {
      failedChecks.push("document_type_consistency");
      warnings.push(
        classification.reason ||
          `Document type mismatch: selected ${claimedType}, but detected as ${classification.detectedType}.`
      );
    } else {
      matchedFields.push("document_type");
    }

    let score = 0;
    const maxScore = 100;

    // If classification failed severely
    if (!classification.matchesClaimed && classification.confidence > 70) {
      return {
        status: "NEEDS_REVIEW",
        confidenceScore: 48,
        extractedData: extracted,
        matchedFields,
        failedChecks,
        warnings,
        reason:
          classification.reason ||
          "Uploaded document appears inconsistent with selected document type.",
      };
    }

    // Base score from classification
    score += classification.matchesClaimed ? 20 : 0;

    if (!student) {
      return {
        status: "NEEDS_REVIEW",
        confidenceScore: 60,
        extractedData: extracted,
        matchedFields,
        failedChecks,
        warnings: ["Student profile not available for comparative verification."],
        reason: "Manual review required: profile missing.",
      };
    }

    // 1. Name Matching with Normalization & Fuzzy Check
    const profileName = (student.name || "").trim().toLowerCase();
    const extractedName = (extracted.studentName || "").trim().toLowerCase();

    if (profileName && (extractedName || extracted.rawTextPreview)) {
      const nameMatchResult = this.compareNames(profileName, extractedName, extracted.rawTextPreview.toLowerCase());
      if (nameMatchResult === "EXACT") {
        matchedFields.push("name");
        score += 35;
      } else if (nameMatchResult === "FUZZY") {
        matchedFields.push("name");
        score += 25;
        warnings.push("Minor spelling or OCR variation in candidate name.");
      } else {
        failedChecks.push("name");
        warnings.push(`Possible name mismatch detected: Profile '${student.name}' vs Document '${extracted.studentName || "Unresolved"}'`);
      }
    } else {
      failedChecks.push("name");
      warnings.push("Could not clearly detect student full name in document text stream.");
    }

    // 2. Institution / University Matching
    const profileUni = (student.university || "").trim().toLowerCase();
    if (profileUni && (extracted.institution || extracted.rawTextPreview)) {
      const uniMatched = this.compareInstitutions(profileUni, extracted.institution?.toLowerCase(), extracted.rawTextPreview.toLowerCase());
      if (uniMatched) {
        matchedFields.push("institution");
        score += 20;
      } else {
        warnings.push(`Institution name could not be automatically confirmed against ${student.university}`);
      }
    }

    // 3. Degree / Branch Matching
    const profileDegree = (student.degree || "").trim().toLowerCase();
    if (profileDegree && (extracted.degree || extracted.rawTextPreview)) {
      const textLower = extracted.rawTextPreview.toLowerCase();
      if (textLower.includes("bachelor") || textLower.includes("b.tech") || textLower.includes("b.s.") || textLower.includes("engineering")) {
        matchedFields.push("degree");
        score += 15;
      }
    }

    // 4. Graduation Year Matching
    if (student.graduationYear && extracted.graduationYear) {
      if (Math.abs(student.graduationYear - extracted.graduationYear) <= 1) {
        matchedFields.push("graduation_year");
        score += 10;
      }
    } else {
      // Small bonus if structure is authentic
      score += 5;
    }

    // Final score clamp
    const confidenceScore = Math.min(Math.max(score, 20), 99);

    // STEP 6: Verification Decision
    let status: DocumentStatus = "NEEDS_REVIEW";
    let reason = "Automated verification completed successfully.";

    if (confidenceScore >= 80 && failedChecks.length === 0) {
      status = "AUTO_VERIFIED";
      reason = "Verified automatically with high multi-factor confidence.";
    } else if (confidenceScore < 40 || (failedChecks.includes("name") && !classification.matchesClaimed)) {
      status = "REUPLOAD_REQUIRED";
      reason = "Document could not be recognized. Please upload a clear, legible scan.";
    } else {
      status = "NEEDS_REVIEW";
      reason = warnings.length > 0 ? warnings[0] : "Document requires review by an administrator or verification officer.";
    }

    return {
      status,
      confidenceScore,
      extractedData: extracted,
      matchedFields,
      failedChecks,
      warnings,
      reason,
    };
  }

  /**
   * Helper: Normalized & fuzzy name comparison
   */
  private static compareNames(
    profileName: string,
    extractedName: string,
    rawText: string
  ): "EXACT" | "FUZZY" | "MISMATCH" {
    if (rawText.includes(profileName)) return "EXACT";
    if (extractedName && extractedName === profileName) return "EXACT";

    // Strip middle names and honorifics
    const profileTokens = profileName.split(/\s+/).filter((t) => t.length > 1);
    const extractedTokens = extractedName ? extractedName.split(/\s+/).filter((t) => t.length > 1) : [];

    if (profileTokens.length > 0 && extractedTokens.length > 0) {
      const matchCount = profileTokens.filter((token) => extractedTokens.includes(token)).length;
      if (matchCount >= 2 || (matchCount >= 1 && profileTokens.length === 1)) {
        return "FUZZY";
      }
    }

    // Check if both first and last names exist anywhere in the raw text
    const firstName = profileTokens[0];
    const lastName = profileTokens[profileTokens.length - 1];
    if (rawText.includes(firstName) && rawText.includes(lastName)) {
      return "FUZZY";
    }

    // Check Levenshtein distance for OCR typos (e.g., 'Rahul Sharrna' vs 'Rahul Sharma')
    if (extractedName && this.levenshtein(profileName, extractedName) <= 2) {
      return "FUZZY";
    }

    return "MISMATCH";
  }

  /**
   * Helper: Institutional name comparison
   */
  private static compareInstitutions(
    profileUni: string,
    extractedUni: string | undefined,
    rawText: string
  ): boolean {
    if (rawText.includes(profileUni)) return true;
    if (extractedUni && extractedUni.includes(profileUni)) return true;

    // Acronym / keyword check
    const acronyms: Record<string, string[]> = {
      "stanford university": ["stanford", "stan"],
      "university of california, berkeley": ["berkeley", "ucb", "cal"],
      "massachusetts institute of technology": ["mit"],
      "carnegie mellon university": ["cmu", "carnegie mellon"],
      "national institute of applied technology": ["niat"],
    };

    const aliases = acronyms[profileUni] || [];
    return aliases.some((alias) => rawText.includes(alias));
  }

  /**
   * Levenshtein Distance calculation
   */
  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
