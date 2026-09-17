import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { requireRole } from "@/lib/authorization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: actor, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_OFFICER",
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ success: false, error: "Note text is required." }, { status: 400 });
    }

    const res = TrustSafetyEngine.addInternalNote(
      id,
      note.trim(),
      { id: actor.id, name: actor.name || "Administrator", role: actor.role }
    );

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Investigation note added.",
      note: res.note,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to add note" }, { status: 500 });
  }
}
