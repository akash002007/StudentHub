import { NextRequest, NextResponse } from "next/server";
import {
  getConversationById,
  markConversationAsRead,
  normalizeUserRole,
} from "@/lib/messaging-engine";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") || "STUDENT";
    const normRole = normalizeUserRole(roleParam);

    const conv = getConversationById(id, normRole);
    if (!conv) {
      return NextResponse.json(
        { success: false, error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: conv,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") || "STUDENT";
    const normRole = normalizeUserRole(roleParam);

    const updated = markConversationAsRead(id, normRole);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Conversation not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      read: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
