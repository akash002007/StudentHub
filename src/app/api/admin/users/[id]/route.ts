import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";
import { AdminUserStatus, UserRole } from "@/types";

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
  const user = ServerStore.getUserRecordById(id);

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
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
  const { status, role, reason } = body;

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { success: false, error: "A justification reason is required for administrative modifications." },
      { status: 400 }
    );
  }

  const actorInfo = {
    id: actor.id,
    name: actor.name || "Platform Admin",
    role: actor.role,
  };

  // Status mutation
  if (status) {
    const validStatuses: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING", "INACTIVE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
    }

    const res = ServerStore.updateUserStatus(actorInfo, id, status, reason.trim());
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.user, message: `User status updated to ${status}` });
  }

  // Role mutation
  if (role) {
    const res = ServerStore.updateUserRole(actorInfo, id, role as UserRole, reason.trim());
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.user, message: `User role updated to ${role}` });
  }

  return NextResponse.json({ success: false, error: "No valid update field (status or role) provided." }, { status: 400 });
}
