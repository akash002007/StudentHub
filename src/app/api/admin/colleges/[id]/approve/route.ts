import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id: collegeId } = await params;
    const body = await req.json().catch(() => ({}));
    const approvedBy = body.approvedBy || user?.name || "Platform Admin";

    const approved = ServerStore.approveCollege(collegeId, approvedBy);
    if (!approved) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      college: approved,
      message: `${approved.name} has been approved and activated for campus recruitment operations`,
    });
  } catch (err) {
    console.error("[POST /api/admin/colleges/[id]/approve] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
