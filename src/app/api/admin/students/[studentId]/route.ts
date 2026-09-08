import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole, stripPrivilegedFields } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { user, errorResponse } = await requireRole(req, ["PLATFORM_ADMIN", "SUPER_ADMIN", "COLLEGE_ADMIN", "VERIFICATION_OFFICER"]);
  if (errorResponse) return errorResponse;

  const { studentId } = await params;
  const student = ServerStore.getStudentProfileById(studentId);

  if (!student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  // Get matching verification request if any
  const verificationRequest = ServerStore.getVerificationRequestByStudentId(studentId);
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
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { user, errorResponse } = await requireRole(req, ["PLATFORM_ADMIN", "SUPER_ADMIN", "COLLEGE_ADMIN", "VERIFICATION_OFFICER"]);
  if (errorResponse) return errorResponse;

  const { studentId } = await params;
  const body = await req.json();
  
  // Implement Mass Assignment Protection
  const sanitizedBody = stripPrivilegedFields(body);

  const updated = ServerStore.updateStudentProfile(studentId, sanitizedBody);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Student not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, student: updated });
}
