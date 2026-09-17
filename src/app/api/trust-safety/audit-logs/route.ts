import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_OFFICER",
  ]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("query") || searchParams.get("search") || undefined;
  const action = searchParams.get("action") || undefined;

  let logs = ServerStore.getAuditLogs({ search, action });

  // Filter to Trust & Safety actions if no explicit action filter is applied
  const TS_ACTIONS = [
    "REPORT_CREATED",
    "REPORT_ASSIGNED",
    "PRIORITY_CHANGED",
    "STATUS_CHANGED",
    "EVIDENCE_ADDED",
    "INVESTIGATION_STARTED",
    "NOTE_ADDED",
    "DECISION_MADE",
    "CONTENT_REMOVED",
    "OPPORTUNITY_RESTRICTED",
    "USER_RESTRICTED",
    "USER_SUSPENDED",
    "USER_BANNED",
    "REPORT_RESOLVED",
    "REPORT_DISMISSED",
    "REPORT_ESCALATED",
    "COMPANY_SUSPENDED",
  ];

  if (!action || action === "ALL") {
    logs = logs.filter(
      (l) =>
        TS_ACTIONS.includes(l.action) ||
        l.ipSessionRef === "trust-safety-gateway" ||
        l.details.toLowerCase().includes("trust & safety") ||
        l.details.toLowerCase().includes("case ts-")
    );
  }

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs,
  });
}
