import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getRecruitmentDriveById } from "@/lib/recruitment-store";
import { evaluateCandidateEligibility } from "@/lib/eligibility-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id: driveId } = await params;
    const { searchParams } = new URL(request.url);
    const targetCollegeId =
      searchParams.get("collegeId") ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const drive = getRecruitmentDriveById(driveId);
    if (!drive) {
      return NextResponse.json({ error: "Recruitment drive not found" }, { status: 404 });
    }

    const students = ServerStore.getCollegeStudents(targetCollegeId);
    const criteria = drive.eligibilityCriteria;

    const evaluatedStudents = students.map((student) => {
      // Convert student record to StudentProfile format for evaluator
      const evaluation = evaluateCandidateEligibility(
        {
          id: student.id,
          name: student.name,
          email: student.email,
          degree: student.degree,
          branch: student.branch,
          cgpa: student.cgpa,
          graduationYear: student.graduationYear,
          skills: student.skills,
          verificationStatus: student.verificationStatus,
          backlogs: student.backlogs || 0,
        },
        criteria
      );

      return {
        student,
        evaluation,
      };
    });

    const eligible = evaluatedStudents.filter((e) => e.evaluation.status === "ELIGIBLE");
    const potentiallyEligible = evaluatedStudents.filter(
      (e) => e.evaluation.status === "REQUIRES_MANUAL_REVIEW"
    );
    const ineligible = evaluatedStudents.filter((e) => e.evaluation.status === "NOT_ELIGIBLE");

    return NextResponse.json({
      success: true,
      drive: {
        id: drive.id,
        title: drive.title,
        company: drive.company,
        position: drive.position,
        eligibilityCriteria: drive.eligibilityCriteria,
      },
      summary: {
        totalEvaluated: students.length,
        eligibleCount: eligible.length,
        potentiallyEligibleCount: potentiallyEligible.length,
        ineligibleCount: ineligible.length,
        eligibilityRatio: students.length > 0 ? Math.round((eligible.length / students.length) * 100) : 0,
      },
      eligible,
      potentiallyEligible,
      ineligible,
    });
  } catch (err) {
    console.error("[GET /api/college/drives/[id]/eligible-students] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
