import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getApplicationById,
  getRecruitmentDriveById,
  getStagesForDrive,
  getAssessments,
  getInterviews,
  getRecruitmentResults,
} from "@/lib/recruitment-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const application = getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Ownership check (IDOR Protection)
    if (application.studentId !== auth.student.id) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this application." }, { status: 403 });
    }

    const drive = getRecruitmentDriveById(application.driveId);
    const stages = getStagesForDrive(application.driveId);

    // Get relevant assessment for this student & drive
    const driveAssessments = getAssessments(application.driveId).filter(
      (a) => a.studentId === auth.student!.id
    );

    // Get relevant interview for this student & drive
    const driveInterviews = getInterviews(application.driveId).filter(
      (i) => i.studentId === auth.student!.id
    );

    // Get published result if published and locked
    const publishedResult = getRecruitmentResults(application.driveId);
    const studentResult =
      publishedResult && publishedResult.isLocked
        ? publishedResult.candidates.find((c) => c.studentId === auth.student!.id)
        : null;

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        drive,
        stages,
        assessments: driveAssessments,
        interviews: driveInterviews,
        result: studentResult
          ? {
              selectionStatus: studentResult.selectionStatus,
              rank: studentResult.rank,
              finalScore: studentResult.finalScore,
              publishedAt: publishedResult?.publishedAt,
              notes: studentResult.notes,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("[GET /api/student/applications/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
