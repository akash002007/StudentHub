import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getInterviews, getRecruitmentDrives } from "@/lib/recruitment-store";

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

    const driveId = searchParams.get("driveId") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const collegeStudents = ServerStore.getCollegeStudents(targetCollegeId);
    const studentMap = new Map(collegeStudents.map((s) => [s.id, s]));

    const drives = getRecruitmentDrives();
    const driveMap = new Map(drives.map((d) => [d.id, d]));

    let allInterviews = getInterviews(
      driveId !== "ALL" ? driveId : undefined,
      status !== "ALL" ? status : undefined
    );

    let collegeInterviews = allInterviews.filter((i) => studentMap.has(i.studentId));

    if (search) {
      collegeInterviews = collegeInterviews.filter(
        (i) =>
          i.candidateName.toLowerCase().includes(search) ||
          i.driveTitle.toLowerCase().includes(search) ||
          (i.interviewerName && i.interviewerName.toLowerCase().includes(search))
      );
    }

    const enriched = collegeInterviews.map((i) => {
      const student = studentMap.get(i.studentId);
      const drive = driveMap.get(i.driveId);
      return {
        ...i,
        candidateEmail: student?.email || "candidate@stanford.edu",
        department: student?.department || student?.branch || "Engineering",
        branch: student?.branch || "Computer Science",
        companyName: drive?.company || "Enterprise Partner",
        companyLogo: drive?.companyLogo,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      interviews: enriched,
    });
  } catch (err) {
    console.error("[GET /api/college/interviews] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
