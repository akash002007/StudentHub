import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getQuestions } from "@/lib/assessment-engine";
import {
  extractTextFromBuffer,
  parseQuestionsFromDocumentText,
  checkDuplicatesAgainstBank,
} from "@/lib/document-question-parser";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded. Please select a PDF or Word document." }, { status: 400 });
    }

    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx") && !lowerName.endsWith(".doc")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx, .doc)." },
        { status: 400 }
      );
    }

    // Default metadata overrides passed by user
    const defaultCategory = (formData.get("defaultCategory") as string) || undefined;
    const defaultTopic = (formData.get("defaultTopic") as string) || undefined;
    const defaultDifficulty = (formData.get("defaultDifficulty") as string) || undefined;
    const defaultMarks = formData.get("defaultMarks") ? Number(formData.get("defaultMarks")) : undefined;
    const defaultNegativeMarks = formData.get("defaultNegativeMarks") !== null ? Number(formData.get("defaultNegativeMarks")) : undefined;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    const textExtraction = await extractTextFromBuffer(buffer, fileName);

    if (textExtraction.isScannedPdf) {
      return NextResponse.json({
        success: true,
        fileName,
        fileType: textExtraction.fileType,
        totalDetected: 0,
        questions: [],
        metadata: {},
        parseWarnings: [
          "This document appears to be a scanned image or protected PDF with no selectable text. Please export or OCR the document to text first.",
        ],
        isScannedPdf: true,
        scannedWarning:
          "This document contains no selectable text layer. It appears to be a scanned image or flattened PDF. Optical Character Recognition (OCR) is required to parse questions from scanned images.",
      });
    }

    // Parse questions from raw text
    const parsedResult = parseQuestionsFromDocumentText(textExtraction.text, fileName, {
      category: defaultCategory as any,
      topic: defaultTopic,
      difficulty: defaultDifficulty as any,
      marks: defaultMarks,
      negativeMarks: defaultNegativeMarks,
    });

    // Query existing questions for duplicate detection
    const existingBank = getQuestions({}, auth.recruiter);

    // Check duplicates
    const finalCandidates = checkDuplicatesAgainstBank(parsedResult.questions, existingBank);

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
    console.error("[POST /api/recruiter/questions/parse-document] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse document. Please ensure the file is not corrupted or password-protected." },
      { status: 500 }
    );
  }
}
