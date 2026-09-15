import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { DocumentVerificationService } from "@/lib/document-verification-service";
import { DocumentType, DocumentRecord, DocumentVerificationAttempt } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || "student_01";

  const student = ServerStore.getStudentProfileById(studentId);
  const request = ServerStore.getVerificationRequestByStudentId(studentId);
  const studentVerifStatus = student?.verificationStatus || "not_submitted";

  // If student is in verification_failed or not_submitted, they have NOT requested manual review yet.
  const activeRequest =
    studentVerifStatus === "verification_failed" || studentVerifStatus === "not_submitted"
      ? null
      : request;

  return NextResponse.json({
    success: true,
    verificationStatus: studentVerifStatus,
    accountAccessStatus:
      student?.accountAccessStatus ||
      (studentVerifStatus === "approved" || studentVerifStatus === "VERIFIED" ? "ACTIVE" : "RESTRICTED"),
    student,
    request: activeRequest,
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let studentId = "student_01";
    let verificationType = "payment_receipt";
    let personalEmail: string | undefined = undefined;
    let fileName = "document.pdf";
    let claimedMime = "application/pdf";
    let buffer: Buffer | null = null;
    let fallbackText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      studentId = (formData.get("studentId") as string) || "student_01";
      verificationType = (formData.get("verificationType") as string) || "payment_receipt";
      personalEmail = (formData.get("personalEmail") as string) || undefined;

      const file = formData.get("file") as File | null;
      if (file) {
        fileName = file.name;
        claimedMime = file.type || "application/pdf";
        const arrayBuf = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      }
    } else {
      const body = await req.json();
      studentId = body.studentId || "student_01";
      verificationType = body.verificationType || "payment_receipt";
      personalEmail = body.personalEmail;
      fileName = body.documentName || "document.pdf";
      fallbackText = body.extractedText || body.documentContent || "";
      if (body.fileBase64) {
        buffer = Buffer.from(body.fileBase64, "base64");
      } else {
        buffer = Buffer.from(fallbackText || `%PDF-1.4\n${fileName}\n${body.studentName || ""} ${body.college || ""}`);
      }
    }

    const student = ServerStore.getStudentProfileById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    // Ensure studentId / institutionalId are populated if passed in request or not yet set
    const effectiveStudentId = student.studentId || student.institutionalId || "CSE2024012";
    if (!student.studentId || !student.institutionalId) {
      ServerStore.updateStudentProfile(studentId, {
        studentId: effectiveStudentId,
        institutionalId: effectiveStudentId,
        rollNumber: student.rollNumber || "2024CSE012",
        enrollmentNumber: student.enrollmentNumber || "EN2024012",
      });
      student.studentId = effectiveStudentId;
      student.institutionalId = effectiveStudentId;
    }

    // Save personal email if provided
    if (personalEmail && personalEmail !== student.personalEmail) {
      ServerStore.updateStudentProfile(studentId, { personalEmail });
    }

    // Map verificationType to DocumentType
    // payment_receipt is treated as MARKSHEET / Academic fee document
    // student_id_card is treated as COLLEGE_ID
    const docType: DocumentType =
      verificationType === "student_id_card" ? "COLLEGE_ID" : "MARKSHEET";

    if (!buffer || buffer.length === 0) {
      buffer = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Title (${fileName}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`);
    }

    // 1. Validate File
    const validation = DocumentVerificationService.validateDocument(buffer, fileName, claimedMime);
    if (!validation.valid && validation.isCorrupt) {
      return NextResponse.json(
        {
          success: false,
          status: "REUPLOAD_REQUIRED",
          verificationStatus: "verification_failed",
          failureReason: validation.error || "File corrupted or unreadable. Please upload a valid document.",
        },
        { status: 400 }
      );
    }

    // 2. OCR / Extraction
    let extractedData = await DocumentVerificationService.extractDocumentData(
      buffer,
      fileName,
      validation.mimeType,
      docType,
      fallbackText
    );

    if (fallbackText) {
      extractedData.rawTextPreview = `${fallbackText} ${extractedData.rawTextPreview}`;
    }

    // 3. Classification Check
    const classification = DocumentVerificationService.classifyDocument(
      extractedData.rawTextPreview,
      fileName,
      docType
    );

    // 4. Verification Evaluation
    const allStudents = ServerStore.getAllStudentProfiles();
    const evaluation = DocumentVerificationService.evaluateVerification(
      docType,
      classification,
      extractedData,
      student,
      allStudents
    );

    const nowStr = new Date().toISOString();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sizeStr = `${(validation.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

    // 5. Build DocumentRecord
    const newDoc: DocumentRecord = {
      id: docId,
      userId: studentId,
      studentName: student.name,
      collegeName: student.university,
      institutionalId: student.studentId || student.institutionalId || student.rollNumber,
      documentType: docType,
      fileName,
      storageKey: `documents/${studentId}/${docId}_${fileName}`,
      mimeType: validation.mimeType,
      fileSize: sizeStr,
      fileSizeBytes: validation.fileSizeBytes,
      uploadedAt: nowStr,
      updatedAt: nowStr,
      verificationStatus: evaluation.status,
      verificationMethod: evaluation.status === "AUTO_VERIFIED" ? "AUTOMATED" : undefined,
      verifiedBy: evaluation.status === "AUTO_VERIFIED" ? "Automatically verified" : null,
      verifiedAt: evaluation.status === "AUTO_VERIFIED" ? nowStr : null,
      failureReason: evaluation.status === "VERIFICATION_FAILED" ? evaluation.reason : null,
      reuploadReason: evaluation.status === "REUPLOAD_REQUIRED" ? evaluation.reason : null,
      isSensitive: docType === "COLLEGE_ID",
      isShareableWithRecruiters: docType !== "COLLEGE_ID",
      confidenceScore: evaluation.confidenceScore,
      extractedData,
      matchedFields: evaluation.matchedFields,
      failedChecks: evaluation.failedChecks,
      warnings: evaluation.warnings,
      decisionReason: evaluation.reason,
    };

    // Save document binary and record to ServerStore
    ServerStore.saveDocument(studentId, newDoc, buffer);

    // Record verification attempt
    const attempt: DocumentVerificationAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId: docId,
      userId: studentId,
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

    // 6. Branch by Automated Outcome
    if (evaluation.status === "AUTO_VERIFIED") {
      // AUTOMATIC SUCCESS: Update student profile to verified
      ServerStore.updateStudentProfile(studentId, {
        verificationStatus: "approved",
        accountStatus: "profile_complete",
      });

      ServerStore.addAuditLog({
        admin: "Automated Verification Pipeline",
        action: "STUDENT_SUBMITTED_VERIFICATION" as any,
        student: student.name,
        previousStatus: "not_submitted",
        newStatus: "approved",
        ipSessionRef: "127.0.0.1 / api_student_verification",
        details: `Document ${fileName} (${docType}) AUTO-VERIFIED with confidence ${evaluation.confidenceScore}%. Student status upgraded to verified.`,
      });

      const updatedProfile = ServerStore.getStudentProfileById(studentId);

      return NextResponse.json({
        success: true,
        status: "AUTO_VERIFIED",
        verificationStatus: "approved",
        confidenceScore: evaluation.confidenceScore,
        document: newDoc,
        student: updatedProfile,
        message: "Your document has been automatically verified successfully.",
      });
    }

    // AUTOMATIC FAILURE:
    // IMPORTANT: DO NOT create a manual review request.
    // DO NOT set student status to "pending".
    // Set student verificationStatus to "verification_failed".
    ServerStore.updateStudentProfile(studentId, {
      verificationStatus: "verification_failed",
    });

    ServerStore.addAuditLog({
      admin: "Automated Verification Pipeline",
      action: "STUDENT_SUBMITTED_VERIFICATION" as any,
      student: student.name,
      previousStatus: "not_submitted",
      newStatus: "verification_failed",
      ipSessionRef: "127.0.0.1 / api_student_verification",
      details: `Automated verification failed for ${fileName} (${docType}). Reason: ${evaluation.reason}. Held at student choice; no manual review created.`,
    });

    const updatedProfile = ServerStore.getStudentProfileById(studentId);

    return NextResponse.json({
      success: false,
      status: "VERIFICATION_FAILED",
      verificationStatus: "verification_failed",
      failureReason: evaluation.reason,
      confidenceScore: evaluation.confidenceScore,
      document: newDoc,
      student: updatedProfile,
      failedChecks: evaluation.failedChecks,
      message: evaluation.reason,
    });
  } catch (err: any) {
    console.error("Student verification submission error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process document verification." },
      { status: 500 }
    );
  }
}
