import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = body.studentId || "student_01";
    const documentId = body.documentId;
    const reason = body.reason || "Student requested manual review by verification officer.";

    const student = ServerStore.getStudentProfileById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found." },
        { status: 404 }
      );
    }

    // 1. If documentId is provided, request manual review on the document
    if (documentId) {
      const docResult = ServerStore.requestManualReview(documentId, studentId, reason);
      if (!docResult.success) {
        return NextResponse.json(
          { success: false, error: docResult.error },
          { status: 400 }
        );
      }
    }

    // 2. Create the manual verification request in the administrative queue
    const nextVerId = `VER-2026-${String(Date.now()).slice(-6)}`;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const manualRequest = {
      verificationId: nextVerId,
      studentId,
      status: "Pending" as const,
      verificationMethod: "Manual Review" as const,
      submittedAt: nowStr,
      riskLevel: "Low" as const,
      priority: "Normal" as const,
      verificationResult: `Student-initiated manual review requested: ${reason}`,
      student: {
        avatar: student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
        fullName: student.name,
        email: student.email,
        phone: student.phone || "+1 (555) 342-8921",
        college: student.university,
        degree: student.degree || "B.Tech",
        branch: student.branch || student.specialization || "Computer Science",
        year: student.yearOfStudy || "3rd Year",
        semester: "5",
        graduationYear: String(student.graduationYear || 2027),
        studentId: student.studentId || student.institutionalId || "CSE2024012",
        collegeEmail: student.email,
        accountCreatedAt: nowStr,
      },
      academicFields: [
        { label: "College", value: student.university, verified: false },
        { label: "Degree", value: student.degree || "B.Tech", verified: false },
        { label: "Branch", value: student.branch || "Computer Science", verified: false },
        { label: "Student ID", value: student.studentId || "CSE2024012", verified: false },
      ],
      checklist: [
        { id: "c1", label: "Student name matches account", state: "Pending" as const },
        { id: "c2", label: "College name matches submitted information", state: "Pending" as const },
        { id: "c3", label: "Student ID is valid", state: "Pending" as const },
        { id: "c4", label: "Document appears authentic", state: "Pending" as const },
      ],
      document: {
        fileName: body.documentName || "Verification_Document.pdf",
        uploadDate: nowStr,
        fileSize: body.documentSize || "1.2 MB",
        documentType: "Student Institutional Verification",
        studentNameDetected: student.name,
        collegeNameDetected: student.university,
        fileUrl: "#",
      },
      duplicateCandidates: [],
      timeline: [
        {
          id: `t_${Date.now()}`,
          timestamp: nowStr,
          title: "Manual review requested by candidate",
          actor: student.name,
        },
      ],
    };

    // Add to administrative queue
    ServerStore.addVerificationRequest(manualRequest);

    // Update student profile status
    ServerStore.updateStudentProfile(studentId, {
      verificationStatus: "manual_review_requested",
      verificationRequest: {
        id: `req_${nextVerId}`,
        verificationId: nextVerId,
        studentId,
        studentName: student.name,
        university: student.university,
        universityEmail: student.email,
        verificationType: "payment_receipt",
        status: "pending",
        documentName: body.documentName || "Verification_Document.pdf",
        documentSize: body.documentSize || "1.2 MB",
        documentUrl: "#",
        submittedAt: nowStr,
      },
    });

    ServerStore.addAuditLog({
      admin: "Student Action",
      action: "STUDENT_REQUESTED_MANUAL_REVIEW" as any,
      student: student.name,
      previousStatus: "verification_failed",
      newStatus: "manual_review_requested",
      ipSessionRef: "127.0.0.1 / api_student_verification_manual_review",
      details: `Student confirmed manual review request for document ${documentId || body.documentName}. Reason: ${reason}`,
    });

    const updatedProfile = ServerStore.getStudentProfileById(studentId);

    return NextResponse.json({
      success: true,
      status: "MANUAL_REVIEW_REQUESTED",
      verificationStatus: "manual_review_requested",
      request: manualRequest,
      student: updatedProfile,
      message: "Your document has been submitted for manual review by a verification officer.",
    });
  } catch (err: any) {
    console.error("Manual review request error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to request manual review." },
      { status: 500 }
    );
  }
}
