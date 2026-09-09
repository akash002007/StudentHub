import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getStudentInterviews,
  getRecruitmentDriveById,
} from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const interviews = getStudentInterviews(auth.student.id);

    // Enrich with drive info (and filter out sensitive private evaluator notes if needed)
    const enriched = interviews.map((interview) => {
      const drive = getRecruitmentDriveById(interview.driveId);
      return {
        id: interview.id,
        driveId: interview.driveId,
        applicationId: interview.applicationId,
        driveTitle: interview.driveTitle || drive?.title || "Recruitment Drive",
        company: drive?.company || "Company",
        companyLogo: drive?.companyLogo,
        type: interview.type,
        date: interview.date,
        time: interview.time,
        duration: interview.duration,
        meetingLink: interview.meetingLink,
        location: interview.location,
        interviewerName: interview.interviewerName,
        status: interview.status,
        createdAt: interview.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      interviews: enriched,
      totalCount: enriched.length,
    });
  } catch (err) {
    console.error("[GET /api/student/interviews] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
