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

    const doc = ServerStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    const student = ServerStore.getStudentProfileById(doc.userId);
    const buffer = ServerStore.getDocumentBuffer(id) || Buffer.from(doc.extractedData?.rawTextPreview || "Document text");

    // 1. Re-extract OCR
    const extractedData = await DocumentVerificationService.extractDocumentData(
      buffer,
      doc.fileName,
      doc.mimeType,
      doc.documentType
    );

    // 2. Classify
    const classification = DocumentVerificationService.classifyDocument(
      extractedData.rawTextPreview,
      doc.fileName,
      doc.documentType
    );

    // 3. Evaluate
    const evaluation = DocumentVerificationService.evaluateVerification(
      doc.documentType,
      classification,
      extractedData,
      student
    );

    const nowStr = new Date().toISOString();
    doc.verificationStatus = evaluation.status;
    doc.confidenceScore = evaluation.confidenceScore;
    doc.matchedFields = evaluation.matchedFields;
    doc.failedChecks = evaluation.failedChecks;
    doc.warnings = evaluation.warnings;
    doc.decisionReason = evaluation.reason;
    doc.extractedData = extractedData;
    doc.updatedAt = nowStr;

    if (evaluation.status === "AUTO_VERIFIED") {
      doc.verificationMethod = "AUTOMATED";
      doc.verifiedBy = "Automated Verification Pipeline";
      doc.verifiedAt = nowStr;
    }

    ServerStore.saveDocument(doc.userId, doc);

    // Record attempt
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
      reason: `Re-verification requested by ${user?.name || "System"}. ${evaluation.reason}`,
      performedBy: "Automated OCR & Classification Pipeline",
      createdAt: nowStr,
    };
    ServerStore.recordVerificationAttempt(attempt);

    return NextResponse.json({
      success: true,
      document: doc,
      verificationResult: evaluation,
    });
  } catch (err: any) {
    console.error("Document re-verify error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to re-verify document." },
      { status: 500 }
    );
  }
}
