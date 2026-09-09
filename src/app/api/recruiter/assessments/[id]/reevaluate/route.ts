import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { reevaluateAssessment } from "@/lib/assessment-engine";

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
    const { updatedAnswerKeys } = body;

    if (!updatedAnswerKeys || typeof updatedAnswerKeys !== "object") {
      return NextResponse.json({ error: "updatedAnswerKeys object mapping questionSnapshotId to correct answer is required." }, { status: 400 });
    }

    const result = reevaluateAssessment(id, updatedAnswerKeys, auth.recruiter);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/[id]/reevaluate] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
