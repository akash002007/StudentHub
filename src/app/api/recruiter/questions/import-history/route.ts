import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import {
  bulkImportQuestions,
  recordQuestionImport,
  getQuestionImportHistory,
} from "@/lib/assessment-engine";
import { QuestionImportRecord } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const companyId = auth.recruiter.company_id || "comp_stripe";
    const history = getQuestionImportHistory(companyId);

    return NextResponse.json({ success: true, history });
  } catch (err) {
    console.error("[GET /api/recruiter/questions/import-history] Error:", err);
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
    const rows = Array.isArray(body.questions) ? body.questions : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No questions provided for import." },
        { status: 400 }
      );
    }

    // 1. Bulk import questions into company question bank
    const result = bulkImportQuestions(rows, auth.recruiter);

    // 2. Save import history record
    const companyId = auth.recruiter.company_id || "comp_stripe";
    const importRecord: QuestionImportRecord = {
      id: `qimp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName: body.fileName || "Uploaded Document",
      fileType: body.fileType || "pdf",
      totalDetected: body.totalDetected ?? rows.length,
      importedCount: result.imported.length,
      duplicateCount: body.duplicateCount ?? 0,
      importedAt: new Date().toISOString(),
      importedBy: auth.recruiter.name || "Recruiter",
      companyId,
      questionIds: result.imported.map((q) => q.id),
      metadata: body.metadata || {},
    };

    recordQuestionImport(importRecord, auth.recruiter);

    return NextResponse.json({
      success: true,
      importedCount: result.imported.length,
      importedQuestions: result.imported,
      importRecord,
      errors: result.errors,
    });
  } catch (err: any) {
    console.error("[POST /api/recruiter/questions/import-history] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
