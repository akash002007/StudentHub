import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { requireRole } from "@/lib/authorization";

export async function POST(req: NextRequest) {
  const { user: actor, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_OFFICER",
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { targetType, targetId, reason } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { success: false, error: "targetType and targetId are required." },
        { status: 400 }
      );
    }

    const actorInfo = { id: actor.id, name: actor.name || "Administrator", role: actor.role };

    if (targetType === "OPPORTUNITY" || targetType === "DRIVE" || targetType === "JOB" || targetType === "INTERNSHIP") {
      const res = TrustSafetyEngine.restoreOpportunity(targetId, reason, actorInfo);
      if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      return NextResponse.json({ success: true, message: "Opportunity reinstated successfully." });
    }

    if (targetType === "USER" || targetType === "RECRUITER" || targetType === "STUDENT") {
      const res = TrustSafetyEngine.restoreUser(targetId, reason, actorInfo);
      if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      return NextResponse.json({ success: true, message: "Account reinstated successfully." });
    }

    return NextResponse.json({ success: false, error: `Unsupported targetType: ${targetType}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to restore target" }, { status: 500 });
  }
}
