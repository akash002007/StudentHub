import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { DocumentVerificationService } from "@/lib/document-verification-service";
import { DocumentAccessPolicy } from "@/lib/document-access-policy";
import { DocumentRecord, DocumentType, DocumentVerificationAttempt } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId") || undefined;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const userRole = (user?.role || "STUDENT").toUpperCase();
    const isStaff = [
      "PLATFORM_ADMIN",
      "SUPER_ADMIN",
      "ADMIN",
      "VERIFICATION_OFFICER",
      "COLLEGE_ADMIN",
    ].includes(userRole);

    let docs: DocumentRecord[] = [];

    if (isStaff) {
      if (requestedUserId) {
        docs = ServerStore.getDocumentsByUserId(requestedUserId);
      } else {
        docs = ServerStore.getAllDocuments({ status, type, search });
      }
    } else {
      // Student only accesses own documents
      const targetId = user?.id || requestedUserId || "std_default_01";
      docs = ServerStore.getDocumentsByUserId(targetId);

      if (status && status !== "All") {
        docs = docs.filter((d) => d.verificationStatus === status);
      }
      if (type && type !== "All") {
        docs = docs.filter((d) => d.documentType === type);
      }
      if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((d) => d.fileName.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q));
      }
    }

    // Filter by Access Policy for Recruiters (they cannot see sensitive docs)
    if (["RECRUITER", "COMPANY_ADMIN"].includes(userRole)) {
      docs = docs.filter((d) => DocumentAccessPolicy.canViewDocument(user, d));
    }

    return NextResponse.json({
      success: true,
      count: docs.length,
      documents: docs,
    });
  } catch (err: any) {
    console.error("Documents GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(req);
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as DocumentType) || "OTHER";
    const expiresAt = (formData.get("expiresAt") as string) || null;
    const customUserId = (formData.get("userId") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a file to upload." },
        { status: 400 }
      );
    }

    const userId = user?.id || customUserId || "std_default_01";
    const student = ServerStore.getStudentProfileById(userId);

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || `Document_${Date.now()}.pdf`;
    const claimedMime = file.type || "application/pdf";

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
      documentType
    );

    // 3. Classification Check
    const classification = DocumentVerificationService.classifyDocument(
      extractedData.rawTextPreview,
      fileName,
      documentType
    );

    // 4. Data Matching & Verification Evaluation
    const evaluation = DocumentVerificationService.evaluateVerification(
      documentType,
      classification,
      extractedData,
      student
    );

    const nowStr = new Date().toISOString();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sizeStr = `${(validation.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

    // Determine sensitive and shareable status
    const isSensitive = ["GOVERNMENT_ID", "COLLEGE_ID"].includes(documentType);
    const isShareableWithRecruiters = documentType === "RESUME";

    const newDoc: DocumentRecord = {
      id: docId,
      userId,
      studentName: student?.name || "Student Candidate",
      studentEmail: student?.email || "student@example.com",
      collegeName: student?.university || "Student University",
      documentType,
      fileName,
      storageKey: `documents/${userId}/${docId}_${fileName}`,
      mimeType: validation.mimeType,
      fileSize: sizeStr,
      fileSizeBytes: validation.fileSizeBytes,
      uploadedAt: nowStr,
      updatedAt: nowStr,
      verificationStatus: evaluation.status,
      verificationMethod: evaluation.status === "AUTO_VERIFIED" ? "AUTOMATED" : undefined,
      verifiedBy: evaluation.status === "AUTO_VERIFIED" ? "Automated Verification Pipeline" : null,
      verifiedAt: evaluation.status === "AUTO_VERIFIED" ? nowStr : null,
      reuploadReason: evaluation.status === "REUPLOAD_REQUIRED" ? evaluation.reason : null,
      expiresAt,
      expiryStatus: expiresAt ? (new Date(expiresAt).getTime() < Date.now() ? "EXPIRED" : "VALID") : undefined,
      isSensitive,
      isShareableWithRecruiters,
      confidenceScore: evaluation.confidenceScore,
      extractedData,
      matchedFields: evaluation.matchedFields,
      failedChecks: evaluation.failedChecks,
      warnings: evaluation.warnings,
      decisionReason: evaluation.reason,
    };

    // Save document and binary buffer to ServerStore
    ServerStore.saveDocument(userId, newDoc, buffer);

    // Record verification attempt
    const attempt: DocumentVerificationAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId: docId,
      userId,
      verificationMethod: "AUTOMATED",
      status: evaluation.status,
      confidenceScore: evaluation.confidenceScore,
      extractedData,
      matchedFields: evaluation.matchedFields,
      failedChecks: evaluation.failedChecks,
      warnings: evaluation.warnings,
      reason: evaluation.reason,
      performedBy: "Automated OCR & Classification Pipeline",
      createdAt: nowStr,
    };
    ServerStore.recordVerificationAttempt(attempt);

    // Audit log
    ServerStore.addAuditLog({
      admin: "Automated Verification Pipeline",
      action: "STUDENT_SUBMITTED_VERIFICATION" as any,
      student: newDoc.studentName || userId,
      previousStatus: "UPLOADED",
      newStatus: evaluation.status,
      ipSessionRef: "127.0.0.1 / api_documents",
      details: `Uploaded ${fileName} (${documentType}). Automated evaluation: ${evaluation.status} (Score: ${evaluation.confidenceScore}%). ${evaluation.reason}`,
    });

    return NextResponse.json({
      success: true,
      message:
        evaluation.status === "AUTO_VERIFIED"
          ? "Document automatically verified with high confidence!"
          : evaluation.status === "NEEDS_REVIEW"
          ? "Document uploaded. Forwarded to admin queue for verification review."
          : "Document uploaded. Please review the verification feedback.",
      document: newDoc,
      verificationResult: evaluation,
    });
  } catch (err: any) {
    console.error("Document upload API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload and process document." },
      { status: 500 }
    );
  }
}
