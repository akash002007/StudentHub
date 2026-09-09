import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { bulkImportQuestions } from "@/lib/assessment-engine";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const rows = Array.isArray(body.questions) ? body.questions : Array.isArray(body) ? body : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: 'questions' must be an array of question records." },
        { status: 400 }
      );
    }

    const result = bulkImportQuestions(rows, auth.recruiter);

    return NextResponse.json({
      success: true,
      importedCount: result.imported.length,
      errorCount: result.errors.length,
      importedQuestions: result.imported,
      rowErrors: result.errors,
    });
  } catch (err) {
    console.error("[POST /api/recruiter/questions/import] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
