import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { requireRole } from "@/lib/authorization";
import { EnforcementActionType, EnforcementDuration } from "@/types";

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
    const { action, duration, reason } = body;

    const validActions: EnforcementActionType[] = [
      "NO_ACTION",
      "WARNING",
      "CONTENT_REMOVED",
      "OPPORTUNITY_RESTRICTED",
      "USER_RESTRICTED",
      "RECRUITER_SUSPENDED",
      "COMPANY_SUSPENDED",
      "ACCOUNT_SUSPENDED",
      "ACCOUNT_BANNED",
      "ESCALATED",
    ];

    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ success: false, error: `Invalid enforcement action: ${action}` }, { status: 400 });
    }

    const validDurations: EnforcementDuration[] = ["24_HOURS", "7_DAYS", "30_DAYS", "PERMANENT"];
    const resolvedDuration: EnforcementDuration = validDurations.includes(duration) ? duration : "PERMANENT";

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "Enforcement reason is mandatory to maintain compliance audit trails." },
        { status: 400 }
      );
    }

    const res = TrustSafetyEngine.executeEnforcement(
      id,
      action,
      resolvedDuration,
      reason.trim(),
      { id: actor.id, name: actor.name || "Administrator", role: actor.role }
    );

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Enforcement action "${action}" successfully executed.`,
      report: res.report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to execute enforcement" }, { status: 500 });
  }
}
