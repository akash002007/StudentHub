import { NextRequest, NextResponse } from "next/server";
import { saveResumeRecord, getActiveResumeRecord } from "@/lib/server-store";
import { enqueueResumeAnalysis } from "@/lib/resume-analysis-worker";
import { ResumeRecord } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "std_default_01";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No resume file provided." },
        { status: 400 }
      );
    }

    // 1. Server-side File Validation
    const fileName = file.name || "Resume.pdf";
    const fileType = file.type || "application/pdf";
    const fileSize = file.size;

    const validExtensions = [".pdf", ".docx", ".doc"];
    const isExtensionValid = validExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext)
    );

    const validMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const isMimeValid = validMimes.includes(fileType);

    if (!isExtensionValid && !isMimeValid) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid PDF or DOCX resume document." },
        { status: 400 }
      );
    }

    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Resume file size must be less than 10 MB." },
        { status: 400 }
      );
    }

    if (fileSize === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded resume file is empty." },
        { status: 400 }
      );
    }

    // Convert file to Buffer for server-side parsing & processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const now = new Date().toISOString();
    const sizeStr = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const existingActive = getActiveResumeRecord(userId);

    // Create new ResumeRecord in PROCESSING state
    const newRecord: ResumeRecord = {
      id: resumeId,
      userId,
      fileName,
      fileType,
      fileSize: sizeStr,
      fileSizeBytes: fileSize,
      status: "PROCESSING",
      extractedText: "",
      uploadedAt: now,
      analyzedAt: null,
      analysisVersion: "v1.0",
      resumeScore: existingActive?.resumeScore || null,
      isActive: existingActive ? false : true, // If first upload, set active immediately
      supersededAt: null,
      resumeDNA: existingActive?.resumeDNA || null,
      error: null,
    };

    saveResumeRecord(userId, newRecord);

    // 2. Enqueue Non-Blocking Background Processing
    enqueueResumeAnalysis(userId, resumeId, buffer).catch((err) => {
      console.error("Background resume analysis error:", err);
    });

    return NextResponse.json({
      success: true,
      resumeId,
      status: "PROCESSING",
      message: "Resume uploaded successfully. Resume DNA analysis is processing in the background.",
      record: newRecord,
    });
  } catch (err: any) {
    console.error("Resume Upload API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload and process resume." },
      { status: 500 }
    );
  }
}
