import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getRecruitmentDriveById,
  getStagesForDrive,
  getStudentApplicationForDrive,
} from "@/lib/recruitment-store";
import { evaluateCandidateEligibility } from "@/lib/eligibility-engine";
import { ServerStore } from "@/lib/server-store";
import { defaultStudentUser } from "@/data/mock-users";

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
    const drive = getRecruitmentDriveById(id);
    if (!drive) {
      return NextResponse.json({ error: "Recruitment drive not found." }, { status: 404 });
    }

    const stages = getStagesForDrive(drive.id);
    const existingApplication = getStudentApplicationForDrive(auth.student.id, drive.id);

    // Fetch student profile for eligibility calculation
    let studentProfile: any = ServerStore.getStudentProfileById(auth.student.id);
    if (!studentProfile) {
      studentProfile = {
        ...defaultStudentUser,
        id: auth.student.id,
        name: auth.student.name || defaultStudentUser.name,
        email: auth.student.email || defaultStudentUser.email,
        backlogs: 0,
      };
    }

    const eligibility = evaluateCandidateEligibility(studentProfile, drive.eligibilityCriteria);

    return NextResponse.json({
      success: true,
      drive: {
        ...drive,
        stages,
      },
      userApplication: existingApplication || null,
      eligibility,
      studentProfileSummary: {
        degree: studentProfile.degree,
        branch: studentProfile.branch || studentProfile.specialization,
        cgpa: studentProfile.cgpa,
        graduationYear: studentProfile.graduationYear,
        backlogs: studentProfile.backlogs || 0,
        skills: studentProfile.skills || [],
        hasResume: !!studentProfile.resume,
      },
    });
  } catch (err) {
    console.error("[GET /api/student/drives/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
