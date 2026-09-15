import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { getAuthenticatedStudent } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    let studentId = "student_01";

    try {
      const auth = await getAuthenticatedStudent(req);
      if (auth.student?.id) {
        studentId = auth.student.id;
      }
    } catch {
      // Fallback to body or query
    }

    try {
      const body = await req.json();
      if (body.studentId) {
        studentId = body.studentId;
      }
    } catch {
      // Body may be empty
    }

    const result = ServerStore.resetVerificationForResubmission(studentId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to reset verification." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "UNVERIFIED",
      verificationStatus: "not_submitted",
      accountAccessStatus: "RESTRICTED",
      student: result.student,
      message: "Ready for a new verification attempt. Account remains restricted until verified.",
    });
  } catch (err: any) {
    console.error("Verification reset error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification reset." },
      { status: 500 }
    );
  }
}
