import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const notifications = ServerStore.getAdminNotifications();
  return NextResponse.json({ success: true, count: notifications.length, notifications });
}

export async function PATCH(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { id } = body;

  if (id) {
    ServerStore.markAdminNotificationAsRead(id);
    return NextResponse.json({ success: true, message: "Notification marked as read" });
  }

  return NextResponse.json({ success: false, error: "Notification ID required" }, { status: 400 });
}
