import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getAssessmentResults } from "@/lib/assessment-engine";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await context.params;
    const data = getAssessmentResults(id);

    return NextResponse.json({
      success: true,
      assessment: data.assessment,
      attempts: data.attempts,
      summary: data.summary,
    });
  } catch (err) {
    console.error("[GET /api/recruiter/assessments/[id]/results] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
