import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getStudentResults,
  getRecruitmentDriveById,
} from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const results = getStudentResults(auth.student.id);

    // Enrich with drive info
    const enriched = results.map((res) => {
      const drive = getRecruitmentDriveById(res.driveId);
      return {
        ...res,
        companyLogo: drive?.companyLogo,
        position: drive?.position,
        salaryStipend: drive?.salaryStipend,
        department: drive?.department,
        location: drive?.location,
      };
    });

    return NextResponse.json({
      success: true,
      results: enriched,
      totalCount: enriched.length,
    });
  } catch (err) {
    console.error("[GET /api/student/results] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
