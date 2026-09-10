import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getAssessments, getRecruitmentDrives } from "@/lib/recruitment-store";

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

    let allAssessments = getAssessments(driveId !== "ALL" ? driveId : undefined);

    // Filter to college students
    let collegeAssessments = allAssessments.filter((ass) => studentMap.has(ass.studentId));

    if (status !== "ALL") {
      if (status.toLowerCase() === "passed") {
        collegeAssessments = collegeAssessments.filter((ass) => ass.passed === true);
      } else if (status.toLowerCase() === "failed") {
        collegeAssessments = collegeAssessments.filter((ass) => ass.passed === false);
      }
    }

    if (search) {
      collegeAssessments = collegeAssessments.filter(
        (ass) =>
          ass.studentName.toLowerCase().includes(search) ||
          ass.assessmentName.toLowerCase().includes(search)
      );
    }

    const enriched = collegeAssessments.map((ass) => {
      const student = studentMap.get(ass.studentId);
      const drive = driveMap.get(ass.driveId);
      return {
        ...ass,
        candidateName: ass.studentName,
        candidateEmail: student?.email || "candidate@stanford.edu",
        department: student?.department || student?.branch || "Engineering",
        branch: student?.branch || "Computer Science",
        companyName: drive?.company || "Enterprise Partner",
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      assessments: enriched,
    });
  } catch (err) {
    console.error("[GET /api/college/assessments] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
