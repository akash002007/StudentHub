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
          error: isForbidden
            ? "You do not have permission to import questions."
            : "Your session has expired. Please sign in again.",
        },
        { status: auth.status || 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please select a PDF or Word document." },
        { status: 400 }
      );
    }

    const fileName = file.name || "document";
    const lowerName = fileName.toLowerCase();
    if (
      !lowerName.endsWith(".pdf") &&
      !lowerName.endsWith(".docx") &&
      !lowerName.endsWith(".doc")
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx, .doc).",
        },
        { status: 400 }
      );
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "This document is too large. Maximum supported file size is 25MB." },
        { status: 413 }
      );
    }

    // Default metadata overrides passed by recruiter
    const defaultCategory = (formData.get("defaultCategory") as string) || undefined;
    const defaultTopic = (formData.get("defaultTopic") as string) || undefined;
    const defaultDifficulty = (formData.get("defaultDifficulty") as string) || undefined;
    const defaultMarks = formData.get("defaultMarks")
      ? Number(formData.get("defaultMarks"))
      : undefined;
    const defaultNegativeMarks =
      formData.get("defaultNegativeMarks") !== null
        ? Number(formData.get("defaultNegativeMarks"))
        : undefined;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty. Please upload a valid document." },
        { status: 400 }
      );
    }

    // 1. Extract text
    let textExtraction;
    try {
      textExtraction = await extractTextFromBuffer(buffer, fileName);
    } catch (err: any) {
      console.error("[parse-document] Text extraction failed:", err?.message || err);
      return NextResponse.json(
        {
          error:
            "Unable to extract text from this document. Please ensure the file is not corrupted or password-protected.",
        },
        { status: 422 }
      );
    }

    // Check for scanned image or empty PDF
    if (textExtraction.isScannedPdf || !textExtraction.text || textExtraction.text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "This document appears to be a scanned image or protected PDF with no selectable text. Please export or OCR the document to text first.",
        },
        { status: 422 }
      );
    }

    // 2. Parse questions from raw text
    const parsedResult = parseQuestionsFromDocumentText(textExtraction.text, fileName, {
      category: defaultCategory as any,
      topic: defaultTopic,
      difficulty: defaultDifficulty as any,
      marks: defaultMarks,
      negativeMarks: defaultNegativeMarks,
    });

    if (!parsedResult.questions || parsedResult.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "We could not identify valid questions in this document. Please ensure questions follow standard numbering (e.g. 1., Q1.) and option formats (e.g. A., B.).",
        },
        { status: 422 }
      );
    }

    // 3. Query existing questions for duplicate detection
    const existingBank = getQuestions({}, auth.recruiter);

    // 4. Check duplicates
    const finalCandidates = checkDuplicatesAgainstBank(parsedResult.questions, existingBank);

    // Filter valid questions to import (exclude invalid and exact duplicates)
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

    if (toImport.length === 0) {
      if (exactDuplicateCount === finalCandidates.length) {
        return NextResponse.json(
          {
            error: `All ${finalCandidates.length} detected questions are exact duplicates of questions already in your Question Bank.`,
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to extract valid questions from this document. Please check the question format and try again.",
        },
        { status: 422 }
      );
    }

    // 5. Persist valid questions into the company Question Bank
    const importResult = bulkImportQuestions(toImport, auth.recruiter);

    // 6. Record import history record for audit trail
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
  } catch (err: any) {
    console.error("[POST /api/recruiter/questions/parse-document] Error:", err);
    return NextResponse.json(
      {
        error:
          "Something went wrong while processing the document. Please check the file and try again.",
      },
      { status: 500 }
    );
  }
}
