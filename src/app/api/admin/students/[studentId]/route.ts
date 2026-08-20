import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const student = ServerStore.getStudentProfileById(params.studentId);

  if (!student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  // Get matching verification request if any
  const verificationRequest = ServerStore.getVerificationRequestByStudentId(params.studentId);
  const auditLogs = ServerStore.getAuditLogs().filter((l) => l.student === student.name);

  return NextResponse.json({
    success: true,
    student,
    verificationRequest,
    auditLogs,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const body = await req.json();
  const updated = ServerStore.updateStudentProfile(params.studentId, body);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Student not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, student: updated });
}
