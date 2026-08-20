import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const decodedId = decodeURIComponent(params.verificationId);
  const body = await req.json();
  const reason = body.reason?.trim();
  const adminName = body.adminName || "Priya Menon";
  const adminNotes = body.adminNotes || undefined;

  if (!reason) {
    return NextResponse.json(
      { success: false, error: "A rejection reason is required." },
      { status: 400 }
    );
  }

  const result = ServerStore.rejectVerification(decodedId, reason, adminName, adminNotes);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "Failed to reject verification request. Record not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Verification request ${decodedId} rejected.`,
    request: result.request,
  });
}
