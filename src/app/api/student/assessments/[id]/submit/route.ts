import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { submitAssessmentAttempt } from "@/lib/assessment-engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { attemptId, isAutoTimeout } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required." }, { status: 400 });
    }

    const result = submitAssessmentAttempt(attemptId, auth.student.id, Boolean(isAutoTimeout));

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      attempt: result.attempt,
      evaluated: result.evaluated,
    });
  } catch (err) {
    console.error("[POST /api/student/assessments/[id]/submit] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
