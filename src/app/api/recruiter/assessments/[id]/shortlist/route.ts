import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { shortlistCandidates } from "@/lib/assessment-engine";

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
    const { candidateIds, action, notes } = body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ error: "candidateIds array is required." }, { status: 400 });
    }

    if (!["SHORTLIST", "REJECT", "MOVE_TO_INTERVIEW"].includes(action)) {
      return NextResponse.json({ error: "Valid action is required: SHORTLIST, REJECT, or MOVE_TO_INTERVIEW." }, { status: 400 });
    }

    const result = shortlistCandidates(id, candidateIds, action, auth.recruiter, notes);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/[id]/shortlist] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
