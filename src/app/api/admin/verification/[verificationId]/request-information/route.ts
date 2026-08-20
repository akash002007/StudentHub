import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  const decodedId = decodeURIComponent(params.verificationId);
  const body = await req.json();
  const requirements = body.requirements || ["Updated fee receipt"];
  const message = body.message?.trim() || "Please provide clearer documentation to complete verification.";
  const adminName = body.adminName || "Priya Menon";

  const result = ServerStore.requestInformation(decodedId, requirements, message, adminName);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "Failed to request information. Verification record not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Requested additional information for ${decodedId}.`,
    request: result.request,
  });
}
