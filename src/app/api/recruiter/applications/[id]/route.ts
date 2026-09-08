import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import {
  getApplicationById,
  updateApplicationStatus,
  recordManualEligibilityOverride,
} from "@/lib/recruitment-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const application = getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (err) {
    console.error("[GET /api/recruiter/applications/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const application = getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes, nextStageId, isOverride, overrideReason } = body;

    let updated = null;

    if (isOverride && overrideReason) {
      updated = recordManualEligibilityOverride(
        id,
        status || "ELIGIBLE",
        overrideReason,
        auth.recruiter.name || "Sarah Chen"
      );
    } else if (status) {
      updated = updateApplicationStatus(
        id,
        status,
        auth.recruiter.name || "Sarah Chen",
        notes,
        nextStageId
      );
    }

    if (!updated) {
      return NextResponse.json({ error: "Failed to update application." }, { status: 400 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error("[PATCH /api/recruiter/applications/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
