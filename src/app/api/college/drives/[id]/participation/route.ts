import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getRecruitmentDriveById } from "@/lib/recruitment-store";
import { CollegeParticipationStatus } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id: driveId } = await params;
    const body = await request.json();

    const targetCollegeId =
      body.collegeId ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const drive = getRecruitmentDriveById(driveId);
    if (!drive) {
      return NextResponse.json({ error: "Recruitment drive not found" }, { status: 404 });
    }

    const { status, approvedByCollege } = body;
    const resolvedStatus: CollegeParticipationStatus =
      status || (approvedByCollege ? "APPROVED" : "OPEN");

    const updated = ServerStore.updateCollegeDriveParticipation(
      targetCollegeId,
      driveId,
      resolvedStatus,
      auth.collegeUser.name
    );

    return NextResponse.json({
      success: true,
      participation: updated,
      message: "College drive participation updated successfully",
    });
  } catch (err) {
    console.error("[PATCH /api/college/drives/[id]/participation] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
