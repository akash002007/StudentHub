import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";
import { ReportTargetType } from "@/types";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const targetType = searchParams.get("targetType") || undefined;

  const reports = ServerStore.getAllModerationReports({ search, status, targetType });

  return NextResponse.json({
    success: true,
    count: reports.length,
    reports,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reporterId, reporterName, reporterEmail, targetType, targetId, targetTitle, reason, details } = body;

  if (!targetType || !targetId || !reason || !details) {
    return NextResponse.json({ success: false, error: "Missing required report fields" }, { status: 400 });
  }

  const newReport = ServerStore.createModerationReport({
    reporterId: reporterId || "anonymous",
    reporterName: reporterName || "Anonymous User",
    reporterEmail: reporterEmail || "anonymous@studenthub.io",
    targetType: targetType as ReportTargetType,
    targetId,
    targetTitle: targetTitle || `Target ${targetId}`,
    reason,
    details,
  });

  return NextResponse.json({ success: true, report: newReport }, { status: 201 });
}
