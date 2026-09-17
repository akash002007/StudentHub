import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { requireRole } from "@/lib/authorization";
import { TrustSafetyStatus, ReportPriority } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const report = TrustSafetyEngine.getReportById(id);

  if (!report) {
    return NextResponse.json({ success: false, error: `Report ${id} not found` }, { status: 404 });
  }

  const roleUpper = (user.role || "").toUpperCase();
  const isAdmin = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER", "COLLEGE_ADMIN"].includes(roleUpper);

  // IDOR Protection: If not admin, the user MUST be the reporter
  if (!isAdmin && report.reporterId !== user.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized to view this report" }, { status: 403 });
  }

  if (!isAdmin) {
    // Strip internal moderator notes for normal users
    const { internalNotes, ...rest } = report;
    return NextResponse.json({
      success: true,
      report: { ...rest, internalNotes: [] },
    });
  }

  return NextResponse.json({ success: true, report });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: actor, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_OFFICER",
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, priority, assignedModeratorId, assignedModeratorName, resolutionNotes } = body;

    const validStatuses: TrustSafetyStatus[] = [
      "SUBMITTED",
      "TRIAGED",
      "INVESTIGATION",
      "DECISION",
      "ACTION",
      "RESOLVED",
      "ESCALATED",
      "DISMISSED",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: `Invalid status: ${status}` }, { status: 400 });
    }

    const validPriorities: ReportPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ success: false, error: `Invalid priority: ${priority}` }, { status: 400 });
    }

    const result = TrustSafetyEngine.updateReport(
      id,
      {
        status,
        priority,
        assignedModeratorId,
        assignedModeratorName,
        resolutionNotes,
      },
      { id: actor.id, name: actor.name || "Moderator", role: actor.role }
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Report ${result.report?.caseNumber} updated successfully.`,
      report: result.report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update report" }, { status: 500 });
  }
}
