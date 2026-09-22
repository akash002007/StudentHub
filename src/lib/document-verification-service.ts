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
  isCorrupt?: boolean;
}

export interface DocumentClassificationResult {
  detectedType: DocumentType;
  confidence: number;
  matchesClaimed: boolean;
  reason?: string;
}

export interface ExtractedDocumentFields {
  studentName?: string;
  institutionalId?: string;
  registrationNumber?: string;
  rollNumber?: string;
  institution?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: string;
  companyName?: string;
  internshipRole?: string;
  startDate?: string;
  endDate?: string;
  idNumberMasked?: string;
  documentCategory?: string;
  rawTextPreview: string;
  academicMarksFound?: boolean;
}

export interface IdentityResolutionResult {
  resolvedStudent: StudentProfile | null;
  isUniqueMatch: boolean;
  isMismatch: boolean;
  isAmbiguous: boolean;
  extractedInstitutionalId?: string;
  reason?: string;
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
        isCorrupt: true,
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
        error: "Unsupported file format. Please upload a PDF, PNG, JPG, or DOCX document.",
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
        isCorrupt: true,
      };
    }

    // Minimum readable threshold
    if (buffer.length < 32) {
      return {
        valid: false,
        error: "File is truncated or corrupted.",
        fileSizeBytes,
        mimeType: claimedMimeType,
        isCorrupt: true,
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
    if (
      text.includes("degree") ||
      text.includes("bachelor") ||
      text.includes("conferred") ||
      text.includes("convocation") ||
      text.includes("hereby certifies that") ||
      text.includes("provisional certificate") ||
      text.includes("degree certificate")
    ) {
      typeScores.DEGREE_CERTIFICATE += 45;
    }

    if (
      text.includes("statement of marks") ||
      text.includes("transcript") ||
      text.includes("semester") ||
      text.includes("cgpa") ||
      text.includes("sgpa") ||
      text.includes("credit points") ||
      text.includes("marksheet") ||
      text.includes("gradesheet")
    ) {
      typeScores.MARKSHEET += 50;
    }

    if (
      text.includes("internship") ||
      text.includes("intern") ||
      text.includes("has successfully completed his/her internship") ||
      text.includes("period of training") ||
      text.includes("internship certificate") ||
      text.includes("letter of completion")
    ) {
      typeScores.INTERNSHIP_CERTIFICATE += 50;
    }

    if (
      text.includes("passport") ||
      text.includes("driving licence") ||
      text.includes("driving license") ||
      text.includes("identity card") ||
      text.includes("aadhaar") ||
      text.includes("republic of") ||
      text.includes("government of") ||
      text.includes("national identity")
    ) {
      typeScores.GOVERNMENT_ID += 45;
    }

    if (
      text.includes("student identity card") ||
      text.includes("student id card") ||
      text.includes("campus card") ||
      text.includes("valid up to") ||
      text.includes("student card") ||
      text.includes("college id")
    ) {
      typeScores.COLLEGE_ID += 45;
    }

    if (
      text.includes("curriculum vitae") ||
      text.includes("resume") ||
      text.includes("summary of experience") ||
      (text.includes("skills") && text.includes("experience") && text.includes("projects") && text.includes("education"))
    ) {
      typeScores.RESUME += 50;
    }

    if (
      text.includes("hackathon") ||
      text.includes("project certificate") ||
      text.includes("certificate of achievement") ||
      text.includes("capstone project")
    ) {
      typeScores.PROJECT_CERTIFICATE += 40;
    }

    // Filename clues
    if (fname.includes("degree") || fname.includes("convocation")) typeScores.DEGREE_CERTIFICATE += 25;
    if (fname.includes("marksheet") || fname.includes("transcript") || fname.includes("grade")) typeScores.MARKSHEET += 25;
    if (fname.includes("internship") || fname.includes("training") || fname.includes("intern")) typeScores.INTERNSHIP_CERTIFICATE += 25;
    if (fname.includes("passport") || fname.includes("license") || fname.includes("gov") || fname.includes("aadhaar")) typeScores.GOVERNMENT_ID += 25;
    if (fname.includes("college_id") || fname.includes("student_id") || fname.includes("campus_id")) typeScores.COLLEGE_ID += 25;
    if (fname.includes("resume") || fname.includes("cv")) typeScores.RESUME += 25;
    if (fname.includes("project") || fname.includes("hackathon")) typeScores.PROJECT_CERTIFICATE += 25;

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

    // If candidate claimed DEGREE_CERTIFICATE but uploaded MARKSHEET
    if (!matchesClaimed && claimedType === "DEGREE_CERTIFICATE" && detectedType === "MARKSHEET") {
      reason = "Uploaded document does not appear to be a Degree Certificate. It appears to be an Academic Marksheet.";
    } else if (!matchesClaimed && highestScore >= 35) {
      const claimedLabel = claimedType.replace(/_/g, " ").toLowerCase();
      const detectedLabel = detectedType.replace(/_/g, " ").toLowerCase();
      reason = `Uploaded document does not appear to be a ${claimedLabel}. Detected content suggests a ${detectedLabel}.`;
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
    docType: DocumentType,
    fallbackText?: string
  ): Promise<ExtractedDocumentFields> {
    let rawText = fallbackText || "";

    if (!rawText) {
      try {
        if (fileName.toLowerCase().endsWith(".pdf") || mimeType.includes("pdf")) {
          rawText = await ResumeParser.extractText(buffer, fileName, mimeType);
        } else {
          const rawContent = buffer.toString("utf-8");
          const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
          rawText = readableStrings.join(" ").replace(/\s+/g, " ").trim();
        }
      } catch {
        const rawContent = buffer.toString("utf-8");
        const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
        rawText = readableStrings.join(" ").replace(/\s+/g, " ").trim();
      }
    }

    if (!rawText || rawText.length < 10) {
      rawText = `Document content for ${fileName}. Issued to candidate.`;
    }

    const extracted: ExtractedDocumentFields = {
      rawTextPreview: rawText.slice(0, 300),
    };

    // 1. Extract institutional identifier (student ID / roll number / enrollment number / registration number)
    // Common patterns: "Student ID: CSE2024012", "Roll No: 2024CSE027", "Enrollment No: EN10293", "ID: 2024CSE001"
    const idPatterns = [
      /(?:student\s*(?:id|number|no|#)|enrollment\s*(?:no|number|#)?|university\s*roll\s*(?:no|number|#)?|roll\s*(?:no|number|#)?|reg(?:istration)?\s*(?:no|number|#)?|institutional\s*id)\s*[:\-#]\s*([A-Za-z0-9\-_/]{4,20})/i,
      /\b(?:student\s*id|id|no)\s*[:\-]\s*([A-Za-z0-9\-_]{4,18})\b/i,
      /\b([A-Z]{2,5}[0-9]{4,8})\b/, // e.g. CSE2024012, STU202401
      /\b([0-9]{4}[A-Z]{2,5}[0-9]{3,6})\b/, // e.g. 2024CSE001, 2024CSE027
    ];

    for (const pattern of idPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const candidateId = match[1].trim();
        // Ignore generic words
        if (!["number", "certificate", "university", "technology", "college", "degree", "identity", "card", "entity"].includes(candidateId.toLowerCase())) {
          extracted.institutionalId = candidateId;
          extracted.registrationNumber = candidateId;
          extracted.rollNumber = candidateId;
          break;
        }
      }
    }

    // 2. Extract student name
    const ignoredNameWords = ["Bachelor", "Master", "Degree", "Technology", "Engineering", "Institute", "University", "College", "Department", "Statement", "Certificate"];
    const namePrefixMatch =
      rawText.match(/(?:certif(?:y|ies)\s+that|name\s*[:\-]|candidate\s*[:\-]|conferred\s+(?:up)?on|conferred\s+to|awarded\s+to|presented\s+to|issued\s+to|this\s+is\s+to\s+certify\s+that|student\s*name\s*[:\-])\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);

    if (namePrefixMatch) {
      extracted.studentName = namePrefixMatch[1].trim();
    } else {
      const genericMatches = rawText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/g);
      if (genericMatches) {
        const validCand = genericMatches.find((c) => {
          const parts = c.split(/\s+/);
          return !parts.some((p) => ignoredNameWords.includes(p));
        });
        if (validCand) {
          extracted.studentName = validCand.trim();
        }
      }
    }

    // 3. Extract institution / University
    const uniMatch =
      rawText.match(/(?:university|institute of technology|college of engineering|stanford university|berkeley|mit|niat|iit|nit|abc\s*(?:college|institute|university))[\w\s&,]+/i) ||
      rawText.match(/institution\s*[:\-]\s*([A-Za-z\s&,]+)/i);
    if (uniMatch) {
      extracted.institution = uniMatch[0].trim();
    }

    // 4. Extract Degree
    const degreeMatch = rawText.match(
      /(?:bachelor of technology|bachelor of science|master of science|b\.tech|b\s+tech|b\.s\.|m\.s\.|bachelor of engineering|b\.e\.)(?:[\w\s&]+)?/i
    );
    if (degreeMatch) {
      extracted.degree = degreeMatch[0].trim();
    }

    // 5. Extract Branch / Specialization
    const branchMatch = rawText.match(
      /(?:computer science(?: & engineering)?|electrical engineering|information technology|mechanical engineering|artificial intelligence|data science|cse|ece|it)/i
    );
    if (branchMatch) {
      extracted.branch = branchMatch[0].trim();
    }

    // 6. Extract Graduation Year or Dates
    const yearMatch = rawText.match(/\b(202[0-9]|201[5-9])\b/);
    if (yearMatch) {
      extracted.graduationYear = parseInt(yearMatch[1], 10);
    }

    // 7. Extract CGPA / Marks / Academic indicators
    const cgpaMatch = rawText.match(/(?:cgpa|gpa|marks|grade)\s*[:\-]?\s*([0-9]\.[0-9]{1,2}(?:\s*\/\s*10(?:\.0)?)?|[0-9]{2,3}(?:\s*\/\s*[0-9]{2,3})?%?)/i);
    if (cgpaMatch) {
      extracted.cgpa = cgpaMatch[1].trim();
      extracted.academicMarksFound = true;
    } else if (rawText.toLowerCase().includes("marks") || rawText.toLowerCase().includes("grade") || rawText.toLowerCase().includes("credits")) {
      extracted.academicMarksFound = true;
    }

    // 8. Extract Company Name for Internship
    if (docType === "INTERNSHIP_CERTIFICATE") {
      const compMatch = rawText.match(/(?:at|with|organization|company)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&]{2,30})/i);
      if (compMatch) {
        extracted.companyName = compMatch[1].trim();
      }
    }

    // 9. Mask Government ID if present
    if (docType === "GOVERNMENT_ID") {
      const idMatch = rawText.match(/[A-Z0-9]{8,16}/);
      if (idMatch) {
        const rawId = idMatch[0];
        extracted.idNumberMasked = `XXXX-XXXX-${rawId.slice(-4)}`;
      }
    }

    return extracted;
  }

  /**
   * STEP 4: Student Identity Resolution
   * Implements Section 11, 12, 13, 14:
   * - Unique institutional identifiers as primary anchor
   * - Detects wrong-student document uploads
   * - Detects duplicate same-name candidates and avoids ambiguous auto-verification
   */
  static resolveStudentIdentity(
    extracted: ExtractedDocumentFields,
    currentStudent: StudentProfile | null,
    allStudents: StudentProfile[] = []
  ): IdentityResolutionResult {
    const extractedId = extracted.institutionalId || extracted.registrationNumber || extracted.rollNumber;
    const normExtractedId = extractedId ? this.normalizeId(extractedId) : "";

    // Candidate search in CommandSkill pool
    const currentStudentId = currentStudent?.studentId || currentStudent?.enrollmentNumber || currentStudent?.rollNumber || currentStudent?.institutionalId;
    const normCurrentStudentId = currentStudentId ? this.normalizeId(currentStudentId) : "";

    // 1. UNIQUE IDENTIFIER RULE (Section 12 & 13)
    if (normExtractedId) {
      // Find all students in CommandSkill matching the extracted ID
      const matchingStudents = allStudents.filter((s) => {
        const sId = s.studentId || s.enrollmentNumber || s.rollNumber || s.institutionalId;
        return sId && this.normalizeId(sId) === normExtractedId;
      });

      if (matchingStudents.length === 1) {
        const matched = matchingStudents[0];
        // Check if matched student is the logged-in student
        if (currentStudent && matched.id !== currentStudent.id) {
          // WRONG STUDENT DOCUMENT PROTECTION (Section 13)
          return {
            resolvedStudent: matched,
            isUniqueMatch: false,
            isMismatch: true,
            isAmbiguous: false,
            extractedInstitutionalId: extractedId,
            reason: "The institutional identifier on this document does not match your CommandSkill profile.",
          };
        }

        return {
          resolvedStudent: matched,
          isUniqueMatch: true,
          isMismatch: false,
          isAmbiguous: false,
          extractedInstitutionalId: extractedId,
        };
      }

      // If document contains an ID that directly mismatches the current student's registered ID
      if (normCurrentStudentId && normExtractedId !== normCurrentStudentId) {
        return {
          resolvedStudent: null,
          isUniqueMatch: false,
          isMismatch: true,
          isAmbiguous: false,
          extractedInstitutionalId: extractedId,
          reason: "The institutional identifier on this document does not match your CommandSkill profile.",
        };
      }

      // If ID matches current student directly
      if (normCurrentStudentId && normExtractedId === normCurrentStudentId) {
        return {
          resolvedStudent: currentStudent,
          isUniqueMatch: true,
          isMismatch: false,
          isAmbiguous: false,
          extractedInstitutionalId: extractedId,
        };
      }
    }

    // 2. MISSING UNIQUE IDENTIFIER RULE (Section 14)
    // If document does NOT contain unique ID, check if multiple students match Name + College + Program
    if (!normExtractedId && currentStudent) {
      const studentName = currentStudent.name.toLowerCase().trim();
      const studentUni = (currentStudent.university || "").toLowerCase().trim();

      const sameNameStudents = allStudents.filter((s) => {
        const nameMatch = this.compareNames(s.name.toLowerCase().trim(), (extracted.studentName || "").toLowerCase().trim(), extracted.rawTextPreview.toLowerCase()) !== "MISMATCH";
        const uniMatch = this.compareInstitutions(s.university.toLowerCase().trim(), extracted.institution?.toLowerCase(), extracted.rawTextPreview.toLowerCase());
        return nameMatch && uniMatch;
      });

      if (sameNameStudents.length > 1) {
        return {
          resolvedStudent: null,
          isUniqueMatch: false,
          isMismatch: false,
          isAmbiguous: true,
          reason: "We couldn't uniquely identify the student from this document.",
        };
      }
    }

    return {
      resolvedStudent: currentStudent,
      isUniqueMatch: Boolean(normExtractedId && normCurrentStudentId && normExtractedId === normCurrentStudentId),
      isMismatch: false,
      isAmbiguous: false,
      extractedInstitutionalId: extractedId,
    };
  }

  /**
   * STEP 5: Verification Decision Engine with Document-Specific Rules
   */
  static evaluateVerification(
    claimedType: DocumentType,
    classification: DocumentClassificationResult,
    extracted: ExtractedDocumentFields,
    student: StudentProfile | null,
    allStudents: StudentProfile[] = []
  ): VerificationEvaluationResult {
    const matchedFields: string[] = [];
    const failedChecks: string[] = [];
    const warnings: string[] = [];

    // 1. Classification Consistency Check
    if (!classification.matchesClaimed) {
      failedChecks.push("document_type_consistency");
      const failReason =
        classification.reason ||
        `Uploaded document does not appear to be a ${claimedType.replace(/_/g, " ")}.`;

      return {
        status: "VERIFICATION_FAILED",
        confidenceScore: 35,
        extractedData: extracted,
        matchedFields,
        failedChecks,
        warnings: [failReason],
        reason: failReason,
      };
    } else {
      matchedFields.push("document_type");
    }

    // 2. Missing Profile Guard
    if (!student) {
      return {
        status: "VERIFICATION_FAILED",
        confidenceScore: 40,
        extractedData: extracted,
        matchedFields,
        failedChecks: ["missing_profile"],
        warnings: ["Student profile not available for comparative verification."],
        reason: "Student profile not available for comparative verification.",
      };
    }

    // 3. Identity Resolution (Unique Institutional Identifier Check)
    const identity = this.resolveStudentIdentity(extracted, student, allStudents);

    if (identity.isMismatch) {
      failedChecks.push("institutional_id_mismatch");
      return {
        status: "VERIFICATION_FAILED",
        confidenceScore: 30,
        extractedData: extracted,
        matchedFields,
        failedChecks,
        warnings: [identity.reason || "Institutional identifier does not match your CommandSkill profile."],
        reason: identity.reason || "The institutional identifier on this document does not match your CommandSkill profile.",
      };
    }

    if (identity.isAmbiguous) {
      failedChecks.push("multiple_possible_students");
      return {
        status: "VERIFICATION_FAILED",
        confidenceScore: 50,
        extractedData: extracted,
        matchedFields,
        failedChecks,
        warnings: ["Multiple candidates share matching profile data; unique ID missing."],
        reason: identity.reason || "We couldn't uniquely identify the student from this document.",
      };
    }

    if (identity.isUniqueMatch) {
      matchedFields.push("institutional_id");
    }

    // 4. Name Matching (Normalization & Fuzzy Tolerance)
    const profileName = (student.name || "").trim().toLowerCase();
    const extractedName = (extracted.studentName || "").trim().toLowerCase();
    const nameMatchResult = this.compareNames(profileName, extractedName, extracted.rawTextPreview.toLowerCase());

    if (nameMatchResult === "EXACT") {
      matchedFields.push("name");
    } else if (nameMatchResult === "FUZZY") {
      matchedFields.push("name");
      warnings.push("Minor spelling or OCR variation in candidate name.");
    } else {
      failedChecks.push("name");
      warnings.push(`Candidate name on document does not match profile (${student.name}).`);
    }

    // 5. Institution / University Matching
    const profileUni = (student.university || "").trim().toLowerCase();
    const uniMatched = this.compareInstitutions(profileUni, extracted.institution?.toLowerCase(), extracted.rawTextPreview.toLowerCase());
    if (uniMatched) {
      matchedFields.push("institution");
    } else if (profileUni) {
      warnings.push(`Institution name could not be automatically confirmed against ${student.university}.`);
    }

    // 6. Degree / Program Matching
    const profileDegree = (student.degree || "").trim().toLowerCase();
    const degreeMatched = this.compareDegrees(profileDegree, extracted.degree?.toLowerCase(), extracted.rawTextPreview.toLowerCase());
    if (degreeMatched) {
      matchedFields.push("degree");
    }

    // 7. Graduation Year Check
    if (student.graduationYear && extracted.graduationYear) {
      if (Math.abs(student.graduationYear - extracted.graduationYear) <= 1) {
        matchedFields.push("graduation_year");
      }
    }

    // 8. DOCUMENT-SPECIFIC VERIFICATION RULES (Section 19)
    let docSpecificRulesPassed = true;
    let docRuleFailureReason = "";

    switch (claimedType) {
      case "COLLEGE_ID":
        // College ID MUST have institution and student identity. Strong identifier: student ID.
        if (!matchedFields.includes("institution")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "College / Institution could not be confirmed on College ID.";
          failedChecks.push("college_id_institution_missing");
        }
        if (!identity.isUniqueMatch && !extracted.institutionalId) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Student ID could not be clearly detected from the document.";
          failedChecks.push("student_id_missing");
        }
        break;

      case "DEGREE_CERTIFICATE":
        // Required: student identity, degree, institution
        if (!matchedFields.includes("name")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Recipient name on Degree Certificate does not match candidate profile.";
          failedChecks.push("degree_name_mismatch");
        }
        if (!matchedFields.includes("institution")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Conferring university could not be confirmed on Degree Certificate.";
          failedChecks.push("degree_institution_mismatch");
        }
        if (!matchedFields.includes("degree")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Degree title on certificate does not match registered academic program.";
          failedChecks.push("degree_title_mismatch");
        }
        break;

      case "MARKSHEET":
        // Required: student identity, institution, academic info (marks/cgpa/grades)
        if (!matchedFields.includes("institution")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Issuing institution could not be confirmed on Marksheet.";
          failedChecks.push("marksheet_institution_mismatch");
        }
        if (!extracted.academicMarksFound && !extracted.cgpa) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Academic performance / semester marks could not be extracted from Marksheet.";
          failedChecks.push("academic_marks_missing");
        }
        break;

      case "INTERNSHIP_CERTIFICATE":
        // Required: student identity, organization/company
        if (!matchedFields.includes("name")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Recipient name on Internship Certificate does not match candidate profile.";
          failedChecks.push("internship_name_mismatch");
        }
        if (!extracted.companyName && !extracted.rawTextPreview.toLowerCase().includes("intern")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Host organization or internship role could not be verified on certificate.";
          failedChecks.push("internship_organization_missing");
        }
        break;

      case "GOVERNMENT_ID":
        // Required: student identity
        if (!matchedFields.includes("name")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Identity name on Government ID does not match CommandSkill profile.";
          failedChecks.push("govid_name_mismatch");
        }
        break;

      case "RESUME":
        // Required: student identity
        if (!matchedFields.includes("name")) {
          docSpecificRulesPassed = false;
          docRuleFailureReason = "Candidate name on Resume does not match CommandSkill profile.";
          failedChecks.push("resume_name_mismatch");
        }
        break;

      default:
        break;
    }

    // 9. Calculate Composite Confidence Score
    let score = 0;
    score += matchedFields.includes("document_type") ? 20 : 0;
    score += matchedFields.includes("institutional_id") ? 35 : 0;
    score += matchedFields.includes("name") ? 25 : 0;
    score += matchedFields.includes("institution") ? 10 : 0;
    score += matchedFields.includes("degree") ? 10 : 0;

    const confidenceScore = Math.min(Math.max(score, 20), 99);

    // 10. Verification Outcome Decision (Section 20 & 21)
    // Automated verification is default if required rules passed and confidence is strong
    if (docSpecificRulesPassed && failedChecks.length === 0 && confidenceScore >= 75) {
      return {
        status: "AUTO_VERIFIED",
        confidenceScore,
        extractedData: extracted,
        matchedFields,
        failedChecks: [],
        warnings,
        reason: "Document verified automatically with multi-factor institutional confidence.",
      };
    }

    // Unsuccessful verification -> VERIFICATION_FAILED
    const failureReason =
      docRuleFailureReason ||
      (warnings.length > 0 ? warnings[0] : "Automated verification could not confidently verify the document.");

    return {
      status: "VERIFICATION_FAILED",
      confidenceScore,
      extractedData: extracted,
      matchedFields,
      failedChecks: failedChecks.length > 0 ? failedChecks : ["verification_confidence_threshold"],
      warnings,
      reason: failureReason,
    };
  }

  /**
   * Helper: Normalized Identifier string
   */
  static normalizeId(id: string): string {
    return id.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  }

  /**
   * Helper: Normalized & fuzzy name comparison (Section 16)
   */
  static compareNames(
    profileName: string,
    extractedName: string,
    rawText: string
  ): "EXACT" | "FUZZY" | "MISMATCH" {
    const cleanProf = profileName.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    const cleanExt = extractedName.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    const cleanRaw = rawText.toLowerCase();

    if (cleanRaw.includes(cleanProf)) return "EXACT";
    if (cleanExt && cleanExt === cleanProf) return "EXACT";

    const profileTokens = cleanProf.split(/\s+/).filter((t) => t.length > 1);
    const extractedTokens = cleanExt ? cleanExt.split(/\s+/).filter((t) => t.length > 1) : [];

    if (profileTokens.length > 0 && extractedTokens.length > 0) {
      const matchCount = profileTokens.filter((token) => extractedTokens.includes(token)).length;
      if (matchCount >= 2 || (matchCount >= 1 && profileTokens.length === 1)) {
        return "FUZZY";
      }
    }

    const firstName = profileTokens[0];
    const lastName = profileTokens[profileTokens.length - 1];
    if (firstName && lastName && cleanRaw.includes(firstName) && cleanRaw.includes(lastName)) {
      return "FUZZY";
    }

    // Levenshtein distance check for OCR typos (e.g., 'Rahul Sharrna' vs 'Rahul Sharma')
    if (cleanExt && this.levenshtein(cleanProf, cleanExt) <= 2) {
      return "FUZZY";
    }

    // Check if any sliding window in cleanRaw fuzzy-matches profileName (e.g. OCR typos in raw text)
    const rawWords = cleanRaw.replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length > 1);
    for (let i = 0; i < rawWords.length - 1; i++) {
      const candidatePhrase = `${rawWords[i]} ${rawWords[i + 1]}`;
      if (this.levenshtein(cleanProf, candidatePhrase) <= 2) {
        return "FUZZY";
      }
    }

    return "MISMATCH";
  }

  /**
   * Helper: Institutional name comparison (Section 17)
   */
  static compareInstitutions(
    profileUni: string,
    extractedUni: string | undefined,
    rawText: string
  ): boolean {
    const normProf = profileUni.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const normExt = (extractedUni || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const normRaw = rawText.toLowerCase();

    if (normRaw.includes(normProf)) return true;
    if (normExt && normExt.includes(normProf)) return true;

    // Canonical acronyms & institutional alias registry
    const aliases: Record<string, string[]> = {
      "stanford university": ["stanford", "stan"],
      "university of california, berkeley": ["berkeley", "ucb", "cal"],
      "massachusetts institute of technology": ["mit"],
      "carnegie mellon university": ["cmu", "carnegie mellon"],
      "national institute of applied technology": ["niat"],
      "abc institute of technology": ["abc institute", "abc college", "abc inst. of tech", "abc university"],
      "indian institute of technology": ["iit"],
      "national institute of technology": ["nit"],
    };

    for (const [canonical, terms] of Object.entries(aliases)) {
      if (normProf.includes(canonical) || terms.some((t) => normProf.includes(t))) {
        if (terms.some((t) => normRaw.includes(t) || normExt.includes(t))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Helper: Degree & academic program normalization (Section 18)
   */
  static compareDegrees(
    profileDegree: string,
    extractedDegree: string | undefined,
    rawText: string
  ): boolean {
    const textLower = rawText.toLowerCase();
    const extLower = (extractedDegree || "").toLowerCase();
    const profLower = profileDegree.toLowerCase();

    // Normalization table
    const degreeFamilies: Record<string, string[]> = {
      "bachelor of technology": ["b.tech", "b tech", "b.tech.", "bachelor of technology", "b.e.", "bachelor of engineering"],
      "bachelor of science": ["b.s.", "b.sc", "bachelor of science", "bs"],
      "master of science": ["m.s.", "m.sc", "master of science", "ms"],
    };

    for (const [, variants] of Object.entries(degreeFamilies)) {
      const isProfInFamily = variants.some((v) => profLower.includes(v));
      if (isProfInFamily) {
        const isDocInFamily = variants.some((v) => textLower.includes(v) || extLower.includes(v));
        if (isDocInFamily) return true;
      }
    }

    return textLower.includes(profLower) || extLower.includes(profLower);
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
