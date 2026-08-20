import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "student";
  const userId = searchParams.get("userId") || "student_01";

  if (role === "admin") {
    const notifications = ServerStore.getAdminNotifications();
    return NextResponse.json({ success: true, notifications });
  }

  const notifications = ServerStore.getStudentNotifications(userId);
  return NextResponse.json({ success: true, notifications });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { notificationId, role, userId } = body;

  if (role === "admin" && notificationId) {
    ServerStore.markAdminNotificationAsRead(notificationId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
