import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getStudentAssessments,
  getRecruitmentDriveById,
} from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const assessments = getStudentAssessments(auth.student.id);

    // Enrich with drive info
    const enriched = assessments.map((ass) => {
      const drive = getRecruitmentDriveById(ass.driveId);
      return {
        ...ass,
        driveTitle: drive?.title || "Recruitment Drive",
        company: drive?.company || "Company",
        companyLogo: drive?.companyLogo,
      };
    });

    return NextResponse.json({
      success: true,
      assessments: enriched,
      totalCount: enriched.length,
    });
  } catch (err) {
    console.error("[GET /api/student/assessments] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
