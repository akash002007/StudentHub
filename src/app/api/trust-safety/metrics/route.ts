import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { requireRole } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_OFFICER",
    "COLLEGE_ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const metrics = TrustSafetyEngine.getMetrics();
  return NextResponse.json({
    success: true,
    metrics,
  });
}
