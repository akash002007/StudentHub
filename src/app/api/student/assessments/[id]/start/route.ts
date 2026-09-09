import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { startAssessmentAttempt } from "@/lib/assessment-engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const applicationId = body.applicationId;

    const result = startAssessmentAttempt(id, auth.student, applicationId);

    if (result.error && !result.attempt) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, attempt: result.attempt });
  } catch (err) {
    console.error("[POST /api/student/assessments/[id]/start] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
