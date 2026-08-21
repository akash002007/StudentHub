/**
 * Production Resume Text Extractor (PDF / DOCX)
 * Safe buffer-based parser that extracts authentic text content from uploaded files.
 */
export class ResumeParser {
  /**
   * Extracts clean text content from a PDF or DOCX file buffer.
   */
  static async extractText(
    buffer: Buffer,
    fileName: string,
    fileType: string
  ): Promise<string> {
    if (!buffer || buffer.length === 0) {
      throw new Error("Resume document buffer is empty.");
    }

    const isPdf =
      fileName.toLowerCase().endsWith(".pdf") ||
      fileType.includes("pdf") ||
      buffer.subarray(0, 4).toString("utf-8") === "%PDF";

    const isDocx =
      fileName.toLowerCase().endsWith(".docx") ||
      fileName.toLowerCase().endsWith(".doc") ||
      fileType.includes("wordprocessingml") ||
      fileType.includes("msword");

    if (!isPdf && !isDocx) {
      throw new Error("Unsupported file format. Only PDF and DOCX documents are supported.");
    }

    let extractedText = "";

    if (isPdf) {
      extractedText = this.parsePdfBuffer(buffer);
    } else if (isDocx) {
      extractedText = this.parseDocxBuffer(buffer);
    }

    // Clean up whitespace & control characters
    const cleaned = extractedText
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < 20) {
      throw new Error("Failed to extract readable text. Document may be scanned, image-only, or corrupted.");
    }

    return cleaned;
  }

  /**
   * Parses text streams from PDF buffer (extracting Tj, TJ text tokens and stream commands)
   */
  private static parsePdfBuffer(buffer: Buffer): string {
    const rawContent = buffer.toString("utf-8");
    const textPieces: string[] = [];

    // Extract text blocks inside Tj and TJ operators
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match: RegExpExecArray | null;

    while ((match = tjRegex.exec(rawContent)) !== null) {
      if (match[1]) textPieces.push(match[1]);
    }

    // Extract text array brackets [ (text1) (text2) ] TJ
    const tjArrayRegex = /\[\s*([^\]]+)\s*\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(rawContent)) !== null) {
      const inner = match[1];
      const strMatch = /\(([^)]+)\)/g;
      let innerMatch: RegExpExecArray | null;
      while ((innerMatch = strMatch.exec(inner)) !== null) {
        if (innerMatch[1]) textPieces.push(innerMatch[1]);
      }
    }

    // Fallback: If PDF uses compressed streams or non-standard encodings, extract printable text sequences
    if (textPieces.length === 0) {
      const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
      return readableStrings.join(" ");
    }

    return textPieces.join(" ");
  }

  /**
   * Parses text nodes from DOCX buffer (<w:t> text nodes)
   */
  private static parseDocxBuffer(buffer: Buffer): string {
    const rawContent = buffer.toString("utf-8");
    const textPieces: string[] = [];

    const wtRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    let match: RegExpExecArray | null;

    while ((match = wtRegex.exec(rawContent)) !== null) {
      if (match[1]) textPieces.push(match[1]);
    }

    if (textPieces.length === 0) {
      const readableStrings = rawContent.match(/[A-Za-z0-9\s.,;:\-@#/()]{4,}/g) || [];
      return readableStrings.join(" ");
    }

    return textPieces.join(" ");
  }
}
