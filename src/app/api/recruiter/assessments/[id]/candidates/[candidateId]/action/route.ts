import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { performCandidateStageAction } from "@/lib/assessment-engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id, candidateId } = await context.params;
    const body = await request.json();
    const { action, note } = body;

    if (!["SHORTLIST", "REJECT", "MOVE_TO_INTERVIEW"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be SHORTLIST, REJECT, or MOVE_TO_INTERVIEW." },
        { status: 400 }
      );
    }

    const result = performCandidateStageAction(id, candidateId, action, note, auth.recruiter);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, application: result.application });
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/[id]/candidates/[candidateId]/action] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
