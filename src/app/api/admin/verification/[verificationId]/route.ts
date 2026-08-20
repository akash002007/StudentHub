import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const decodedId = decodeURIComponent(params.verificationId);
  const request = ServerStore.getVerificationRequestById(decodedId);

  if (!request) {
    return NextResponse.json(
      { success: false, error: "Verification request not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, request });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const decodedId = decodeURIComponent(params.verificationId);
  const body = await req.json();

  if (body.checklist) {
    ServerStore.updateChecklist(decodedId, body.checklist);
  }

  const updated = ServerStore.getVerificationRequestById(decodedId);
  return NextResponse.json({ success: true, request: updated });
}
