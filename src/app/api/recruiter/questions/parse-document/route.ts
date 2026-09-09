import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import {
  getQuestions,
  bulkImportQuestions,
  recordQuestionImport,
} from "@/lib/assessment-engine";
import {
  extractTextFromBuffer,
  parseQuestionsFromDocumentText,
  checkDuplicatesAgainstBank,
} from "@/lib/document-question-parser";
import { QuestionImportRecord } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      const isForbidden = auth.status === 403;
      return NextResponse.json(
        {
          code: isForbidden ? "FORBIDDEN" : "UNAUTHORIZED",
          error: isForbidden
            ? "You do not have permission to import questions."
            : "Your session has expired. Please sign in again.",
        },
        { status: auth.status || 401 }
      );
    }

    const formData = await request.formData();
    // Accept either 'file' or 'document' field names
    const file = (formData.get("file") || formData.get("document")) as File | null;

    if (!file) {
      console.warn("[QuestionImport] File not received in upload request");
      return NextResponse.json(
        {
          code: "FILE_NOT_RECEIVED",
          error: "No document file was received. Please select a PDF or Word document.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name || "document.pdf";
    const mimeType = file.type || "application/octet-stream";
    const fileSize = file.size;

    // Structured server-side logs: File received
    console.log(`[QuestionImport] File received: ${fileName}`);
    console.log(`[QuestionImport] MIME: ${mimeType}`);
    console.log(`[QuestionImport] Size: ${fileSize} bytes`);

    const lowerName = fileName.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf") || mimeType === "application/pdf";
    const isDocx =
      lowerName.endsWith(".docx") ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDoc = lowerName.endsWith(".doc") || mimeType === "application/msword";

    // Structured server-side logs: File validation
    console.log(`[QuestionImport] File validation started`);
    if (!isPdf && !isDocx && !isDoc) {
      console.warn(`[QuestionImport] Rejected invalid file format: ${fileName} (${mimeType})`);
      return NextResponse.json(
        {
          code: "INVALID_FILE",
          error:
            "Unsupported file format. Please upload a valid PDF (.pdf) or Word document (.docx, .doc).",
        },
        { status: 400 }
      );
    }

    // Size limit check (25MB)
    if (fileSize > 25 * 1024 * 1024) {
      console.warn(`[QuestionImport] File exceeds 25MB limit: ${fileSize} bytes`);
      return NextResponse.json(
        {
          code: "FILE_TOO_LARGE",
          error: "Document file size exceeds 25MB limit.",
        },
        { status: 413 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer || buffer.length === 0) {
      console.warn("[QuestionImport] Uploaded file buffer is empty");
      return NextResponse.json(
        {
          code: "INVALID_FILE",
          error: "The uploaded file is empty. Please select a valid document.",
        },
        { status: 400 }
      );
    }

    // Check PDF magic bytes if reported as PDF
    if (isPdf) {
      const magicBytes = buffer.slice(0, 5).toString("ascii");
      if (magicBytes !== "%PDF-" && !lowerName.endsWith(".pdf")) {
        console.warn(`[QuestionImport] Invalid PDF magic bytes: ${magicBytes}`);
        return NextResponse.json(
          {
            code: "INVALID_PDF",
            error: "The uploaded file does not contain a valid PDF structure.",
          },
          { status: 400 }
        );
      }
    }

    console.log(`[QuestionImport] File validation passed`);

    // Recruiter overrides
    const defaultCategory = (formData.get("defaultCategory") as string) || undefined;
    const defaultTopic = (formData.get("defaultTopic") as string) || undefined;
    const defaultDifficulty = (formData.get("defaultDifficulty") as string) || undefined;
    const defaultMarks = formData.get("defaultMarks")
      ? Number(formData.get("defaultMarks"))
      : undefined;
    const defaultNegativeMarks =
      formData.get("defaultNegativeMarks") !== null && formData.get("defaultNegativeMarks") !== undefined
        ? Number(formData.get("defaultNegativeMarks"))
        : undefined;
    const autoImport = formData.get("autoImport") === "true";

    // 1. Text extraction
    const parserName = isPdf ? "PDFParse (v2) with stream fallback" : "Mammoth Word Extractor";
    console.log(`[QuestionImport] Parser selected: ${parserName}`);
    console.log(`[QuestionImport] ${isPdf ? "PDF" : "Document"} extraction started`);

    let textExtraction;
    try {
      textExtraction = await extractTextFromBuffer(buffer, fileName);
    } catch (err: any) {
      console.error("[QuestionImport] Text extraction failed:", err?.message || err);
      return NextResponse.json(
        {
          code: isPdf ? "PDF_PARSE_FAILED" : "TEXT_EXTRACTION_FAILED",
          error:
            "Unable to extract text from this document. Please ensure the file is not corrupted or password-protected.",
          details: err?.message,
        },
        { status: 422 }
      );
    }

    console.log(`[QuestionImport] ${isPdf ? "PDF" : "Document"} extraction completed`);
    console.log(`[QuestionImport] Extracted characters: ${textExtraction.text.length}`);

    // Check for empty or scanned PDF
    if (textExtraction.isScannedPdf || !textExtraction.text || textExtraction.text.trim().length < 20) {
      console.warn("[QuestionImport] No selectable text found in document");
      return NextResponse.json(
        {
          code: "NO_TEXT_FOUND",
          error:
            "No selectable text found in this document. If this is a scanned document or image-only PDF, Optical Character Recognition (OCR) is required.",
          isScannedPdf: true,
          debugInfo: (textExtraction as any).debugInfo,
        },
        { status: 422 }
      );
    }

    // 2. Question Parsing
    console.log(`[QuestionImport] Question detection started`);
    const parsedResult = parseQuestionsFromDocumentText(textExtraction.text, fileName, {
      category: defaultCategory as any,
      topic: defaultTopic,
      difficulty: defaultDifficulty as any,
      marks: defaultMarks,
      negativeMarks: defaultNegativeMarks,
    });

    console.log(`[QuestionImport] Questions detected: ${parsedResult.questions.length}`);

    const answerKeysDetected = parsedResult.questions.filter((q) =>
      Boolean(
        q.correctAnswer &&
          (Array.isArray(q.correctAnswer) ? q.correctAnswer.length > 0 : String(q.correctAnswer).trim())
      )
    ).length;
    console.log(`[QuestionImport] Answer keys detected: ${answerKeysDetected}`);

    if (!parsedResult.questions || parsedResult.questions.length === 0) {
      console.warn("[QuestionImport] No recognizable question patterns detected");
      return NextResponse.json(
        {
          code: "QUESTION_EXTRACTION_FAILED",
          error:
            "We could not identify valid questions in this document. Please ensure questions follow standard numbering (e.g. 1., Q1.) and option formats (e.g. A., B.).",
          parseWarnings: parsedResult.warnings,
        },
        { status: 422 }
      );
    }

    // 3. Validation & Duplicate Detection
    console.log(`[QuestionImport] Validation started`);
    const existingBank = getQuestions({}, auth.recruiter);
    const finalCandidates = checkDuplicatesAgainstBank(parsedResult.questions, existingBank);

    console.log(`[QuestionImport] Import ready`);

    // If autoImport requested, directly persist to DB
    if (autoImport) {
      console.log(`[QuestionImport] Auto-importing ${finalCandidates.length} questions into Question Bank`);
      const toImport = finalCandidates.filter(
        (c) => c.status !== "INVALID" && c.duplicateStatus !== "EXACT_DUPLICATE"
      );

      const duplicateCount = finalCandidates.filter(
        (c) => c.duplicateStatus === "EXACT_DUPLICATE" || c.duplicateStatus === "LIKELY_DUPLICATE"
      ).length;
      const exactDuplicateCount = finalCandidates.filter(
        (c) => c.duplicateStatus === "EXACT_DUPLICATE"
      ).length;
      const needsReviewCount = finalCandidates.filter(
        (c) => c.status === "NEEDS_REVIEW" || c.duplicateStatus === "LIKELY_DUPLICATE"
      ).length;

      if (toImport.length === 0 && exactDuplicateCount === finalCandidates.length) {
        return NextResponse.json(
          {
            code: "VALIDATION_FAILED",
            error: `All ${finalCandidates.length} detected questions are exact duplicates of questions already in your Question Bank.`,
          },
          { status: 422 }
        );
      }

      const importResult = bulkImportQuestions(toImport, auth.recruiter);
      const companyId = auth.recruiter.company_id || "comp_stripe";
      const importRecord: QuestionImportRecord = {
        id: `qimp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fileName,
        fileType: textExtraction.fileType,
        fileSizeBytes: buffer.length,
        uploadedById: auth.recruiter.id,
        uploadedByName: auth.recruiter.name || "Recruiter",
        companyId,
        totalDetected: finalCandidates.length,
        importedCount: importResult.imported.length,
        duplicateCount,
        failedCount: finalCandidates.length - importResult.imported.length,
        status: importResult.imported.length === finalCandidates.length ? "COMPLETED" : "PARTIAL",
        importedAt: new Date().toISOString(),
        importedBy: auth.recruiter.name || "Recruiter",
        questionIds: importResult.imported.map((q) => q.id),
        metadata: {
          needsReviewCount,
          duplicateCount,
          exactDuplicateCount,
          ...parsedResult.metadata,
        },
      };

      recordQuestionImport(importRecord, auth.recruiter);
      console.log(`[QuestionImport] Auto-import completed: ${importResult.imported.length} questions saved`);

      return NextResponse.json({
        success: true,
        fileName,
        fileType: textExtraction.fileType,
        totalDetected: finalCandidates.length,
        importedCount: importResult.imported.length,
        needsReviewCount,
        duplicateCount,
        exactDuplicateCount,
        importedQuestions: importResult.imported,
        importRecord,
      });
    }

    // Return parsed candidate questions for recruiter review/edit flow
    return NextResponse.json({
      success: true,
      fileName,
      fileType: textExtraction.fileType,
      totalDetected: finalCandidates.length,
      questions: finalCandidates,
      metadata: parsedResult.metadata,
      parseWarnings: parsedResult.warnings,
      isScannedPdf: false,
    });
  } catch (err: any) {
    console.error("[QuestionImport] Unhandled server error:", err);
    return NextResponse.json(
      {
        code: "UNKNOWN_ERROR",
        error:
          "Something went wrong while processing the document. Please check the file and try again.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
