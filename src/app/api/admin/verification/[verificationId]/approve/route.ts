import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const decodedId = decodeURIComponent(params.verificationId);
  const body = await req.json().catch(() => ({}));
  const adminName = body.adminName || "Priya Menon";
  const adminNotes = body.adminNotes || undefined;

  const result = ServerStore.approveVerification(decodedId, adminName, adminNotes);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "Failed to approve verification request. Record not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Verification request ${decodedId} approved successfully. Student account verified.`,
    request: result.request,
  });
}
