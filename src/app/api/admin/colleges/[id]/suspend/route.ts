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
    const reason = body.reason || "Administrative compliance suspension";

    const suspended = ServerStore.suspendCollege(collegeId, reason);
    if (!suspended) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      college: suspended,
      message: `${suspended.name} has been suspended from campus placement activity`,
    });
  } catch (err) {
    console.error("[POST /api/admin/colleges/[id]/suspend] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
