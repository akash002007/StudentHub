import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";
import { ReportStatus } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const report = ServerStore.getModerationReportById(id);

  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
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
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, resolutionNotes } = body;

  if (!status) {
    return NextResponse.json({ success: false, error: "Status field is required." }, { status: 400 });
  }

  if (!resolutionNotes || !resolutionNotes.trim()) {
    return NextResponse.json(
      { success: false, error: "Resolution notes are required when updating moderation report status." },
      { status: 400 }
    );
  }

  const validStatuses: ReportStatus[] = ["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
  }

  const actorInfo = {
    id: actor.id,
    name: actor.name || "Platform Admin",
    role: actor.role,
  };

  const res = ServerStore.resolveModerationReport(actorInfo, id, status, resolutionNotes.trim());
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    report: res.report,
    message: `Report status updated to ${status}`,
  });
}
