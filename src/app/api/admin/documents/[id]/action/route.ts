import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse, user } = await requireRole(req, [
      "PLATFORM_ADMIN",
      "SUPER_ADMIN",
      "ADMIN",
      "VERIFICATION_OFFICER",
      "COLLEGE_ADMIN",
    ]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await req.json();
    const action = body.action as "APPROVE" | "REJECT" | "REQUEST_REUPLOAD";
    const reason = body.reason as string | undefined;
    const notes = body.notes as string | undefined;
    const adminName = body.adminName || user?.name || "Priya Menon (Verification Officer)";

    if (!action || !["APPROVE", "REJECT", "REQUEST_REUPLOAD"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be APPROVE, REJECT, or REQUEST_REUPLOAD." },
        { status: 400 }
      );
    }

    if ((action === "REJECT" || action === "REQUEST_REUPLOAD") && !reason?.trim()) {
      return NextResponse.json(
        { success: false, error: `A reason is required to ${action === "REJECT" ? "reject" : "request re-upload for"} this document.` },
        { status: 400 }
      );
    }

    const result = ServerStore.adminReviewDocument(id, action, adminName, reason?.trim(), notes?.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to process document review action." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Document successfully ${action === "APPROVE" ? "approved" : action === "REJECT" ? "rejected" : "marked for re-upload"}.`,
      document: result.document,
    });
  } catch (err: any) {
    console.error("Admin document review action error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during document action." },
      { status: 500 }
    );
  }
}
