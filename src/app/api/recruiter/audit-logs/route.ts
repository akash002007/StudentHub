import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getRecruiterAuditLogs } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get("driveId") || "all";
    const action = searchParams.get("action") || "all";
    const query = (searchParams.get("query") || "").toLowerCase().trim();

    let logs = getRecruiterAuditLogs(driveId);

    if (action !== "all") {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }

    if (query) {
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(query) ||
          l.actorName.toLowerCase().includes(query) ||
          (l.targetName && l.targetName.toLowerCase().includes(query)) ||
          l.details.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error("[GET /api/recruiter/audit-logs] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
