import { NextRequest, NextResponse } from "next/server";
import { getActiveResumeRecord, getResumeHistory } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const activeRecord = getActiveResumeRecord(userId);
  const history = getResumeHistory(userId);

  return NextResponse.json({
    success: true,
    hasActiveResume: Boolean(activeRecord),
    activeResume: activeRecord,
    historyCount: history.length,
  });
}
