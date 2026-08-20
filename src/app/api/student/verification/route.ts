import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || "student_01";

  const student = ServerStore.getStudentProfileById(studentId);
  const request = ServerStore.getVerificationRequestByStudentId(studentId);

  return NextResponse.json({
    success: true,
    verificationStatus: student?.verificationStatus || "not_submitted",
    student,
    request,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const studentId = body.studentId || "student_01";

  const newRequest = ServerStore.submitStudentVerification(studentId, {
    studentName: body.studentName || "Student",
    email: body.email || "student@university.edu",
    college: body.college || "University",
    degree: body.degree || "B.Tech",
    branch: body.branch || "Computer Science",
    year: body.year || "3rd Year",
    studentIdNumber: body.studentIdNumber || "STU-2026-REG",
    graduationYear: String(body.graduationYear || "2027"),
    phone: body.phone,
    verificationType: body.verificationType || "payment_receipt",
    documentName: body.documentName || "Receipt.pdf",
    documentSize: body.documentSize || "1.2 MB",
    documentUrl: body.documentUrl || "#",
    personalEmail: body.personalEmail,
  });

  const updatedProfile = ServerStore.getStudentProfileById(studentId);

  return NextResponse.json({
    success: true,
    message: "Verification request submitted successfully.",
    request: newRequest,
    student: updatedProfile,
  });
}
