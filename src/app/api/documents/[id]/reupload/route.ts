import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { DocumentVerificationService } from "@/lib/document-verification-service";
import { DocumentVerificationAttempt } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await getAuthenticatedUser(req);
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a replacement file to upload." },
        { status: 400 }
      );
    }

    const doc = ServerStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Original document record not found." },
        { status: 404 }
      );
    }

    // Check ownership
    const userRole = (user?.role || "STUDENT").toUpperCase();
    const isStaff = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER"].includes(userRole);
    if (!isStaff && user?.id !== doc.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only re-upload your own documents." },
        { status: 403 }
      );
    }

    const student = ServerStore.getStudentProfileById(doc.userId);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || doc.fileName;
    const claimedMime = file.type || doc.mimeType;

    // 1. File Validation
    const validation = DocumentVerificationService.validateDocument(buffer, fileName, claimedMime);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 2. OCR / Extraction
    const extractedData = await DocumentVerificationService.extractDocumentData(
      buffer,
      fileName,
      validation.mimeType,
      doc.documentType
    );

    // 3. Classification Check
    const classification = DocumentVerificationService.classifyDocument(
      extractedData.rawTextPreview,
      fileName,
      doc.documentType
    );

    // 4. Verification Evaluation
    const evaluation = DocumentVerificationService.evaluateVerification(
      doc.documentType,
      classification,
      extractedData,
      student
    );

    const nowStr = new Date().toISOString();
    const sizeStr = `${(validation.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

    // Update document record
    doc.fileName = fileName;
    doc.mimeType = validation.mimeType;
    doc.fileSize = sizeStr;
    doc.fileSizeBytes = validation.fileSizeBytes;
    doc.updatedAt = nowStr;
    doc.verificationStatus = evaluation.status;
    doc.confidenceScore = evaluation.confidenceScore;
    doc.matchedFields = evaluation.matchedFields;
    doc.failedChecks = evaluation.failedChecks;
    doc.warnings = evaluation.warnings;
    doc.decisionReason = evaluation.reason;
    doc.extractedData = extractedData;
    doc.reuploadReason = null;
    doc.rejectionReason = null;

    if (evaluation.status === "AUTO_VERIFIED") {
      doc.verificationMethod = "AUTOMATED";
      doc.verifiedBy = "Automated Verification Pipeline";
      doc.verifiedAt = nowStr;
    }

    ServerStore.saveDocument(doc.userId, doc, buffer);

    // Record verification attempt
    const attempt: DocumentVerificationAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId: id,
      userId: doc.userId,
      verificationMethod: "AUTOMATED",
      status: evaluation.status,
      confidenceScore: evaluation.confidenceScore,
      extractedData,
      matchedFields: evaluation.matchedFields,
      failedChecks: evaluation.failedChecks,
      warnings: evaluation.warnings,
      reason: `Replacement document uploaded: ${evaluation.reason}`,
      performedBy: "Automated OCR & Classification Pipeline",
      createdAt: nowStr,
    };
    ServerStore.recordVerificationAttempt(attempt);

    // Audit log
    ServerStore.addAuditLog({
      admin: user?.name || "Student",
      action: "STUDENT_UPDATED_PROFILE" as any,
      student: doc.studentName || doc.userId,
      previousStatus: "REUPLOAD_REQUIRED",
      newStatus: evaluation.status,
      ipSessionRef: "127.0.0.1 / api_documents_reupload",
      details: `Replaced document ${fileName} (${doc.documentType}). New evaluation: ${evaluation.status} (Score: ${evaluation.confidenceScore}%).`,
    });

    return NextResponse.json({
      success: true,
      message:
        evaluation.status === "AUTO_VERIFIED"
          ? "Replacement document automatically verified!"
          : "Replacement document uploaded and submitted for review.",
      document: doc,
      verificationResult: evaluation,
    });
  } catch (err: any) {
    console.error("Document re-upload error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to re-upload document." },
      { status: 500 }
    );
  }
}
