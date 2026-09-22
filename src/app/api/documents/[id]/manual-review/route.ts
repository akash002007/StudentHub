import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason as string | undefined;

    const doc = ServerStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    const userId = user?.id || doc.userId;

    // Check ownership: students can only request manual review for their own documents
    const userRole = (user?.role || "STUDENT").toUpperCase();
    const isStaff = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER"].includes(userRole);
    if (!isStaff && user?.id && user.id !== doc.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only request manual review for your own documents." },
        { status: 403 }
      );
    }

    const result = ServerStore.requestManualReview(id, userId, reason);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit manual review request." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your document has been submitted for manual verification. A CommandSkill verification officer will review your document.",
      document: result.document,
    });
  } catch (err: any) {
    console.error("Manual review request error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to request manual review." },
      { status: 500 }
    );
  }
}
