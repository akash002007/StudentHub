import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { saveAttemptAnswer } from "@/lib/assessment-engine";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { attemptId, questionId, answer } = body;

    if (!attemptId || !questionId) {
      return NextResponse.json(
        { error: "attemptId and questionId are required." },
        { status: 400 }
      );
    }

    const result = saveAttemptAnswer(attemptId, auth.student.id, questionId, answer);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, answer: result.answerRecord });
  } catch (err) {
    console.error("[POST /api/student/assessments/[id]/answers] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
