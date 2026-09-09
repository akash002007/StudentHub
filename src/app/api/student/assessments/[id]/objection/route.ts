import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { submitQuestionObjection } from "@/lib/assessment-engine";

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
    const body = await request.json();
    const { attemptId, questionId, objectionType, description, proposedAnswer } = body;

    if (!attemptId || !questionId || !objectionType || !description) {
      return NextResponse.json(
        { error: "attemptId, questionId, objectionType, and description are required." },
        { status: 400 }
      );
    }

    const result = submitQuestionObjection({
      assessmentId: id,
      attemptId,
      questionId,
      objectionType,
      description,
      proposedAnswer,
      candidateId: auth.student.id,
      candidateName: auth.student.name || "Candidate",
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/student/assessments/[id]/objection] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
