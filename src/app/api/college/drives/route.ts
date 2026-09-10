import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getRecruitmentDrives } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetCollegeId =
      searchParams.get("collegeId") ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const statusFilter = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const drives = getRecruitmentDrives();
    const participations = ServerStore.getCollegeDriveParticipation(targetCollegeId);
    const partMap = new Map(participations.map((p) => [p.driveId, p]));

    let enrichedDrives = drives.map((d) => {
      const part = partMap.get(d.id);
      return {
        ...d,
        participationStatus: part?.status || "OPEN",
        collegeApproved: part?.approvedByCollege || false,
        participatingStudentsCount: part?.registeredStudentsCount || 0,
        participationId: part?.id,
        approvalNotes: part?.approvalNotes,
      };
    });

    if (statusFilter !== "ALL") {
      enrichedDrives = enrichedDrives.filter(
        (d) =>
          d.status.toLowerCase() === statusFilter.toLowerCase() ||
          d.participationStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (search) {
      enrichedDrives = enrichedDrives.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.company.toLowerCase().includes(search) ||
          d.position.toLowerCase().includes(search) ||
          d.department.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: enrichedDrives.length,
      drives: enrichedDrives,
    });
  } catch (err) {
    console.error("[GET /api/college/drives] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
