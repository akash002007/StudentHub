import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getQuestions, saveQuestion } from "@/lib/assessment-engine";
import { QuestionSource } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownerType = searchParams.get("ownerType") as QuestionSource | null;
    const category = searchParams.get("category") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const questions = getQuestions(
      {
        ownerType: ownerType || undefined,
        category,
        difficulty,
        type,
        search,
      },
      auth.recruiter
    );

    return NextResponse.json({ success: true, questions, totalCount: questions.length });
  } catch (err) {
    console.error("[GET /api/recruiter/questions] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const result = saveQuestion(body, auth.recruiter);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, question: result.question });
  } catch (err) {
    console.error("[POST /api/recruiter/questions] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
