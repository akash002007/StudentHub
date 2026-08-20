import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.toLowerCase();
  const action = searchParams.get("action");

  let logs = ServerStore.getAuditLogs();

  if (query) {
    logs = logs.filter(
      (l) =>
        l.admin.toLowerCase().includes(query) ||
        l.student.toLowerCase().includes(query) ||
        l.action.toLowerCase().includes(query) ||
        l.details.toLowerCase().includes(query)
    );
  }

  if (action && action !== "All") {
    logs = logs.filter((l) => l.action.includes(action));
  }

  return NextResponse.json({ success: true, count: logs.length, logs });
}
