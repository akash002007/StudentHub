import { NextRequest, NextResponse } from "next/server";
import {
  getConversationsForRole,
  getUnreadCountForRole,
  postMessage,
  normalizeUserRole,
} from "@/lib/messaging-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") || "STUDENT";
    const normRole = normalizeUserRole(roleParam);

    const conversations = getConversationsForRole(normRole);
    const unreadCount = getUnreadCountForRole(normRole);

    return NextResponse.json({
      success: true,
      role: normRole,
      unreadCount,
      conversations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, content, user } = body;

    if (!conversationId || !content || !user) {
      return NextResponse.json(
        { success: false, error: "Missing required message parameters" },
        { status: 400 }
      );
    }

    const result = postMessage(conversationId, content, {
      id: user.id || "usr_anon",
      name: user.name || "StudentHub User",
      avatar: user.avatar,
      role: user.role || "STUDENT",
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
