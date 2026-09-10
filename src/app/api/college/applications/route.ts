import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getApplications, getRecruitmentDrives } from "@/lib/recruitment-store";

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
    const stage = searchParams.get("stage") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const collegeStudents = ServerStore.getCollegeStudents(targetCollegeId);
    const studentMap = new Map(collegeStudents.map((s) => [s.id, s]));

    const drives = getRecruitmentDrives();
    const driveMap = new Map(drives.map((d) => [d.id, d]));

    let allApps = getApplications();

    // Filter to only this college's students
    let collegeApps = allApps.filter((app) => studentMap.has(app.studentId));

    if (driveId !== "ALL") {
      collegeApps = collegeApps.filter((a) => a.driveId === driveId);
    }

    if (stage !== "ALL") {
      collegeApps = collegeApps.filter((a) => a.currentStageType.toLowerCase() === stage.toLowerCase());
    }

    if (status !== "ALL") {
      collegeApps = collegeApps.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      collegeApps = collegeApps.filter(
        (a) =>
          a.studentName.toLowerCase().includes(search) ||
          a.studentEmail.toLowerCase().includes(search) ||
          (a.driveTitle && a.driveTitle.toLowerCase().includes(search))
      );
    }

    // Enrich applications with student details and drive company info
    const enriched = collegeApps.map((a) => {
      const student = studentMap.get(a.studentId);
      const drive = driveMap.get(a.driveId);
      return {
        ...a,
        candidateName: a.studentName,
        candidateEmail: a.studentEmail,
        department: student?.department || student?.branch || "Engineering",
        branch: student?.branch || "Computer Science",
        cgpa: student?.cgpa || "3.80",
        graduationYear: student?.graduationYear || 2026,
        companyName: drive?.company || "Enterprise Partner",
        companyLogo: drive?.companyLogo,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      applications: enriched,
    });
  } catch (err) {
    console.error("[GET /api/college/applications] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
