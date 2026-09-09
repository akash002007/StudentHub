import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { getAssessmentForCandidate } from "@/lib/assessment-engine";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await context.params;
    const result = getAssessmentForCandidate(id, auth.student.id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      assessment: result.assessment,
      attempt: result.attempt,
      isAssigned: result.isAssigned,
    });
  } catch (err) {
    console.error("[GET /api/student/assessments/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
