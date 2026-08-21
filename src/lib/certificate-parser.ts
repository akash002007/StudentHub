import { ResumeParser } from "@/lib/resume-parser";

export interface ParsedCertificateData {
  extractedText: string;
  recipientName: string;
  certificateTitle: string;
  courseName: string;
  issuerName: string;
  issueDate: string | null;
  expiryDate: string | null;
  certificateId: string | null;
  credentialId: string | null;
  verificationUrl: string | null;
  qrData: string | null;
  skills: string[];
}

export class CertificateParser {
  /**
   * Extracts clean text content from PDF or Image file buffer.
   */
  static async extractText(
    buffer: Buffer,
    fileName: string,
    fileType: string
  ): Promise<string> {
    if (!buffer || buffer.length === 0) {
      throw new Error("Certificate document buffer is empty.");
    }

    const isPdf =
      fileName.toLowerCase().endsWith(".pdf") ||
      fileType.includes("pdf") ||
      buffer.subarray(0, 4).toString("utf-8") === "%PDF";

    const isImage =
      fileName.toLowerCase().endsWith(".png") ||
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg") ||
      fileType.includes("image");

    if (!isPdf && !isImage) {
      throw new Error("Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG certificate.");
    }

    if (isPdf) {
      try {
        return await ResumeParser.extractText(buffer, fileName, fileType);
      } catch {
        // Fallback for PDF text stream parsing
        return this.parsePrintableBuffer(buffer);
      }
    } else {
      return this.parsePrintableBuffer(buffer);
    }
  }

  /**
   * Parses printable UTF-8/ASCII strings from binary or image buffers.
   */
  private static parsePrintableBuffer(buffer: Buffer): string {
    const rawContent = buffer.toString("utf-8");
    const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
    const cleaned = readableStrings.join(" ").replace(/\s+/g, " ").trim();
    return cleaned.length > 0 ? cleaned : "Certificate Document Content";
  }

  /**
   * Parses extracted text to identify recipient, issuer, credential ID, verification URL, dates, and skills.
   */
  static parseCertificateMetadata(
    extractedText: string,
    fileName: string,
    studentName?: string
  ): ParsedCertificateData {
    const text = extractedText;
    const lowerText = text.toLowerCase();

    // 1. Issuer Intelligence Detection
    let issuerName = "Independent Training Institute";

    const knownIssuers: Array<{ name: string; keywords: string[] }> = [
      { name: "Google", keywords: ["google", "coursera.org/verify", "skillshop"] },
      { name: "Amazon Web Services (AWS)", keywords: ["aws", "amazon web services", "aws.training"] },
      { name: "Microsoft", keywords: ["microsoft", "learn.microsoft.com", "certiport"] },
      { name: "Coursera", keywords: ["coursera", "coursera.org"] },
      { name: "Udemy", keywords: ["udemy", "ude.my"] },
      { name: "edX", keywords: ["edx", "edx.org"] },
      { name: "freeCodeCamp", keywords: ["freecodecamp", "freecodecamp.org"] },
      { name: "DeepLearning.AI", keywords: ["deeplearning.ai", "andrew ng"] },
      { name: "Meta", keywords: ["meta", "facebook"] },
      { name: "Oracle", keywords: ["oracle", "java SE"] },
      { name: "Cisco", keywords: ["cisco", "ccna", "ccnp"] },
    ];

    for (const issuer of knownIssuers) {
      if (issuer.keywords.some((kw) => lowerText.includes(kw))) {
        issuerName = issuer.name;
        break;
      }
    }

    // 2. Credential ID Extraction
    let credentialId: string | null = null;
    const credMatch = text.match(/(?:credential|certificate|verify|id|reference)\s*[:#\-]?\s*([A-Za-z0-9\-]{6,30})/i);
    if (credMatch && credMatch[1]) {
      credentialId = credMatch[1];
    }

    // 3. Verification URL Extraction
    let verificationUrl: string | null = null;
    const urlMatch = text.match(/(https?:\/\/[^\s<>()"']+)/i);
    if (urlMatch && urlMatch[1]) {
      verificationUrl = urlMatch[1].replace(/[.,;)]+$/, "");
    }

    // 4. Course / Certificate Title Extraction
    let certificateTitle = "Professional Skill Certificate";
    let courseName = "Professional Certification Program";

    const titleMatch = text.match(/(?:certificate of|completed|course|certified in|successful completion of)\s+([^.\n]{5,60})/i);
    if (titleMatch && titleMatch[1]) {
      courseName = titleMatch[1].trim();
      certificateTitle = `${courseName} Certificate`;
    } else {
      // Fallback from filename
      const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      if (cleanFileName.length > 3) {
        courseName = cleanFileName;
        certificateTitle = `${cleanFileName} Certificate`;
      }
    }

    // 5. Recipient Name Extraction
    let recipientName = studentName || "Certificate Holder";
    if (studentName) {
      const lowerStudent = studentName.toLowerCase();
      if (lowerText.includes(lowerStudent)) {
        recipientName = studentName;
      }
    }

    // 6. Issue Date Extraction
    let issueDate: string | null = null;
    const dateMatch = text.match(/(?:issued?|date|on)\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch && dateMatch[1]) {
      issueDate = dateMatch[1];
    } else {
      issueDate = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }

    // 7. Skill Keywords Extraction
    const candidateSkills = [
      "Python",
      "React",
      "TypeScript",
      "JavaScript",
      "AWS",
      "Cloud Computing",
      "Machine Learning",
      "Data Analysis",
      "SQL",
      "Node.js",
      "Docker",
      "Kubernetes",
      "Java",
      "C++",
      "Cybersecurity",
      "DevOps",
      "Full Stack Development",
    ];

    const detectedSkills = candidateSkills.filter((sk) => lowerText.includes(sk.toLowerCase()));
    if (detectedSkills.length === 0) {
      detectedSkills.push("Software Engineering");
    }

    return {
      extractedText: text,
      recipientName,
      certificateTitle,
      courseName,
      issuerName,
      issueDate,
      expiryDate: null,
      certificateId: credentialId,
      credentialId,
      verificationUrl,
      qrData: verificationUrl,
      skills: detectedSkills,
    };
  }
}
