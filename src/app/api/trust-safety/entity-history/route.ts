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

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") || "RECRUITER";
  const entityId = searchParams.get("entityId");
  const companyId = searchParams.get("companyId");

  if (!entityId && !companyId) {
    return NextResponse.json(
      { success: false, error: "entityId or companyId query parameter required" },
      { status: 400 }
    );
  }

  const history = entityId ? TrustSafetyEngine.getEntitySafetyHistory(entityType, entityId) : null;
  const companySignals = companyId ? TrustSafetyEngine.getCompanyRiskSignals(companyId) : null;

  return NextResponse.json({
    success: true,
    history,
    companySignals,
  });
}
