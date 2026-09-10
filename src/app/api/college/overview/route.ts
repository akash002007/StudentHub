import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getRecruitmentDrives, getApplications, getInterviews } from "@/lib/recruitment-store";

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

    const college = ServerStore.getCollegeById(targetCollegeId);
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const metrics = ServerStore.getCollegeMetrics(targetCollegeId);
    const students = ServerStore.getCollegeStudents(targetCollegeId);
    const studentIds = new Set(students.map((s) => s.id));

    // Get active campus drives
    const allDrives = getRecruitmentDrives();
    const participations = ServerStore.getCollegeDriveParticipation(targetCollegeId);
    const partMap = new Map(participations.map((p) => [p.driveId, p]));

    const campusDrives = allDrives.map((d) => {
      const part = partMap.get(d.id);
      return {
        ...d,
        participationStatus: part?.status || "OPEN",
        participatingStudentsCount: part?.registeredStudentsCount || 0,
        collegeApproved: part?.approvedByCollege || false,
      };
    });

    // Get upcoming interviews for college candidates
    const allInterviews = getInterviews();
    const collegeInterviews = allInterviews.filter((i) => studentIds.has(i.studentId));

    // Calculate pipeline funnel
    const allApps = getApplications().filter((a) => studentIds.has(a.studentId));
    const pipelineFunnel = {
      applied: allApps.length,
      underReview: allApps.filter((a) => a.status === "UNDER_REVIEW" || a.status === "SUBMITTED").length,
      assessment: allApps.filter((a) => a.currentStageType === "ASSESSMENT" || a.status === "ASSESSMENT_CLEARED").length,
      interview: allApps.filter((a) => a.currentStageType === "INTERVIEW" || a.status === "INTERVIEW_SCHEDULED").length,
      offered: allApps.filter((a) => a.status === "SELECTED" || a.status === "IN_SELECTION").length,
      placed: allApps.filter((a) => a.status === "SELECTED").length,
    };

    return NextResponse.json({
      success: true,
      college,
      metrics,
      pipelineFunnel,
      activeDrivesCount: campusDrives.filter((d) => d.status !== "CLOSED" && d.status !== "DRAFT").length,
      recentDrives: campusDrives.slice(0, 5),
      upcomingInterviews: collegeInterviews.slice(0, 5),
      studentCount: students.length,
    });
  } catch (err) {
    console.error("[GET /api/college/overview] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
