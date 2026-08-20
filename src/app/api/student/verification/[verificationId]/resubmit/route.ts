import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const body = await req.json();
  const studentId = body.studentId || "student_01";

  const result = ServerStore.resubmitStudentVerification(studentId, {
    documentName: body.documentName || "Updated_Receipt.pdf",
    documentSize: body.documentSize || "1.4 MB",
    documentUrl: body.documentUrl || "#",
    personalEmail: body.personalEmail,
    notes: body.notes,
  });

  const updatedProfile = ServerStore.getStudentProfileById(studentId);

  return NextResponse.json({
    success: true,
    message: "Verification resubmitted and placed in the review queue.",
    request: result.request,
    student: updatedProfile,
  });
}
