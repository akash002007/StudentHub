import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import {
  getRecruitmentDriveById,
  saveRecruitmentDrive,
  getStagesForDrive,
  getApplications,
  logRecruiterAction,
} from "@/lib/recruitment-store";
import { ServerStore } from "@/lib/server-store";
import { DriveStatus } from "@/types";

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
  const drive = getRecruitmentDriveById(id);

  if (!drive) {
    return NextResponse.json({ success: false, error: "Recruitment drive not found" }, { status: 404 });
  }

  const stages = getStagesForDrive(id);
  const applications = getApplications({ driveId: id });

  return NextResponse.json({
    success: true,
    drive: {
      ...drive,
      stages,
      applicationsCount: applications.length,
      applications,
    },
  });
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
  const drive = getRecruitmentDriveById(id);

  if (!drive) {
    return NextResponse.json({ success: false, error: "Recruitment drive not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, reason } = body;

  if (!status) {
    return NextResponse.json({ success: false, error: "Status field is required." }, { status: 400 });
  }

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { success: false, error: "A justification reason is required for administrative drive overrides." },
      { status: 400 }
    );
  }

  const prevStatus = drive.status;
  drive.status = status as DriveStatus;
  drive.updatedAt = new Date().toISOString();

  saveRecruitmentDrive(drive);

  // Platform admin audit log
  ServerStore.addAuditLog({
    admin: actor.name || "Platform Admin",
    action: "DRIVE_STATUS_OVERRIDE",
    targetType: "DRIVE",
    targetId: id,
    targetName: drive.title,
    previousStatus: prevStatus,
    newStatus: status,
    reason: reason.trim(),
    ipSessionRef: "admin-console",
    details: `Administrator ${actor.name} modified recruitment drive "${drive.title}" status to ${status}. Reason: ${reason}`,
  });

  // Recruiter audit trail
  logRecruiterAction({
    driveId: drive.id,
    driveTitle: drive.title,
    actorId: actor.id,
    actorName: actor.name || "Platform Admin",
    actorRole: actor.role,
    action: "DRIVE_ADMIN_OVERRIDE",
    targetType: "DRIVE",
    targetId: drive.id,
    targetName: drive.title,
    previousState: prevStatus,
    newState: status,
    reason: reason.trim(),
    details: `Administrative override by ${actor.name}: changed status to ${status}. Reason: ${reason}`,
  });

  return NextResponse.json({
    success: true,
    drive,
    message: `Recruitment drive status updated to ${status}`,
  });
}
