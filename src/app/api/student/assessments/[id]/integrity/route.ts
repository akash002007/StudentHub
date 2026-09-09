import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { recordIntegrityEvent } from "@/lib/assessment-engine";
import { IntegrityEventType } from "@/types";

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
    const { attemptId, eventType, severity, metadata } = body;

    if (!attemptId || !eventType) {
      return NextResponse.json(
        { error: "attemptId and eventType are required." },
        { status: 400 }
      );
    }

    const result = recordIntegrityEvent(
      attemptId,
      auth.student.id,
      auth.student.name || "Candidate",
      eventType as IntegrityEventType,
      severity || "MEDIUM",
      metadata
    );

    return NextResponse.json({
      success: true,
      event: result.event,
      actionTaken: result.actionTaken,
      violationCount: result.attempt.violationCount,
      attemptStatus: result.attempt.status,
      integrityStatus: result.attempt.integrityStatus,
    });
  } catch (err) {
    console.error("[POST /api/student/assessments/[id]/integrity] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
