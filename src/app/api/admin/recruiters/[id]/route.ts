import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";
import { AdminUserStatus } from "@/types";

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
  const { status, reason } = body;

  if (!status) {
    return NextResponse.json({ success: false, error: "Status field is required." }, { status: 400 });
  }

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { success: false, error: "A justification reason is required to update recruiter status." },
      { status: 400 }
    );
  }

  const validStatuses: AdminUserStatus[] = ["ACTIVE", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid recruiter status value." }, { status: 400 });
  }

  const actorInfo = {
    id: actor.id,
    name: actor.name || "Platform Admin",
    role: actor.role,
  };

  const res = ServerStore.updateRecruiterStatus(actorInfo, id, status, reason.trim());
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    recruiter: res.recruiter,
    message: `Recruiter status updated to ${status}`,
  });
}
