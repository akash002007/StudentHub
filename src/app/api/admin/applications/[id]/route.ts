import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { getApplicationById, updateApplicationStatus } from "@/lib/recruitment-store";
import { ServerStore } from "@/lib/server-store";
import { RecruitmentApplicationStatus } from "@/types";

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
  const app = getApplicationById(id);

  if (!app) {
    return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, application: app });
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
  const app = getApplicationById(id);

  if (!app) {
    return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, note, reason } = body;

  if (!status) {
    return NextResponse.json({ success: false, error: "Status is required." }, { status: 400 });
  }

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { success: false, error: "A justification reason is required for status updates." },
      { status: 400 }
    );
  }

  const updated = updateApplicationStatus(
    id,
    status as RecruitmentApplicationStatus,
    actor.name || "Platform Admin",
    note || reason
  );

  if (!updated) {
    return NextResponse.json({ success: false, error: "Failed to update application status" }, { status: 400 });
  }

  ServerStore.addAuditLog({
    admin: actor.name || "Platform Admin",
    action: "APPLICATION_STATUS_OVERRIDE",
    student: app.studentName,
    targetType: "APPLICATION",
    targetId: app.id,
    targetName: `${app.studentName} - ${app.driveTitle}`,
    previousStatus: app.status,
    newStatus: status,
    reason: reason.trim(),
    ipSessionRef: "admin-console",
    details: `Administrator ${actor.name} updated application ${app.id} for candidate ${app.studentName} to ${status}. Reason: ${reason}`,
  });

  return NextResponse.json({
    success: true,
    application: updated,
    message: `Application status updated to ${status}`,
  });
}
