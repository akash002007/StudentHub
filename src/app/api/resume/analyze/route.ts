import { NextRequest, NextResponse } from "next/server";
import { getActiveResumeRecord } from "@/lib/server-store";
import { enqueueResumeAnalysis } from "@/lib/resume-analysis-worker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || "std_default_01";
    let resumeId = body.resumeId;

    if (!resumeId) {
      const active = getActiveResumeRecord(userId);
      if (!active) {
        return NextResponse.json(
          { success: false, error: "No active resume found to analyze." },
          { status: 404 }
        );
      }
      resumeId = active.id;
    }

    const updatedRecord = await enqueueResumeAnalysis(userId, resumeId);

    return NextResponse.json({
      success: updatedRecord.status === "COMPLETED",
      status: updatedRecord.status,
      resumeScore: updatedRecord.resumeScore,
      message:
        updatedRecord.status === "COMPLETED"
          ? "Resume DNA analysis complete."
          : "Resume DNA analysis failed.",
      record: updatedRecord,
    });
  } catch (err: any) {
    console.error("Resume Analyze API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to trigger resume analysis." },
      { status: 500 }
    );
  }
}
