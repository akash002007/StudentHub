import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { updateApplicationStatus, logRecruiterAction } from "@/lib/recruitment-store";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { applicationIds, action, targetStageId, reason } = body as {
      applicationIds: string[];
      action: "SHORTLIST" | "REJECT" | "MOVE_STAGE";
      targetStageId?: string;
      reason?: string;
    };

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: "applicationIds array is required." }, { status: 400 });
    }

    const updatedApps = [];
    const actorName = auth.recruiter.name || "Sarah Chen";

    for (const id of applicationIds) {
      if (action === "SHORTLIST") {
        const app = updateApplicationStatus(id, "SHORTLISTED", actorName, reason || "Bulk shortlisted");
        if (app) updatedApps.push(app);
      } else if (action === "REJECT") {
        const app = updateApplicationStatus(id, "REJECTED", actorName, reason || "Bulk rejected");
        if (app) updatedApps.push(app);
      } else if (action === "MOVE_STAGE") {
        const app = updateApplicationStatus(
          id,
          "IN_SELECTION",
          actorName,
          reason || "Bulk stage transition",
          targetStageId
        );
        if (app) updatedApps.push(app);
      }
    }

    logRecruiterAction({
      actorId: auth.recruiter.id,
      actorName,
      actorRole: "RECRUITER",
      action: `BULK_${action}`,
      targetType: "APPLICATION",
      targetId: "BULK_SELECTION",
      details: `Bulk ${action} executed for ${updatedApps.length} candidate(s). Reason: ${reason || "N/A"}`,
    });

    return NextResponse.json({
      success: true,
      processedCount: updatedApps.length,
      applications: updatedApps,
    });
  } catch (err) {
    console.error("[POST /api/recruiter/applications/bulk] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
