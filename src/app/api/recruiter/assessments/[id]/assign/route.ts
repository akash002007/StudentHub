import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { assignCandidatesToAssessmentConfig } from "@/lib/assessment-engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const candidateIds = Array.isArray(body.candidateIds) ? body.candidateIds : [];

    if (candidateIds.length === 0) {
      return NextResponse.json({ error: "candidateIds array is required." }, { status: 400 });
    }

    const result = assignCandidatesToAssessmentConfig(id, candidateIds, auth.recruiter);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, assignedCount: result.assignedCount });
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/[id]/assign] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
