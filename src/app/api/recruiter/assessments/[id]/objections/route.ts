import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getQuestionObjections, resolveQuestionObjection } from "@/lib/assessment-engine";

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
    const objections = getQuestionObjections(id);

    return NextResponse.json({ objections });
  } catch (err) {
    console.error("[GET /api/recruiter/assessments/[id]/objections] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { objectionId, status, resolutionNotes } = body;

    if (!objectionId || !status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "objectionId and valid status ('ACCEPTED' | 'REJECTED') are required." }, { status: 400 });
    }

    const result = resolveQuestionObjection(objectionId, status, resolutionNotes || "", auth.recruiter);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/[id]/objections] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
