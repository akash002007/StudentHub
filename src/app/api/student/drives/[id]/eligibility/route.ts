import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { getRecruitmentDriveById } from "@/lib/recruitment-store";
import { evaluateCandidateEligibility } from "@/lib/eligibility-engine";
import { ServerStore } from "@/lib/server-store";
import { defaultStudentUser } from "@/data/mock-users";

export async function POST(
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

    // Allow incoming overrides or fall back to stored profile
    let overrideProfile = {};
    try {
      overrideProfile = await request.json();
    } catch {
      // Empty body
    }

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

    const mergedCandidate = {
      ...studentProfile,
      ...overrideProfile,
    };

    const evaluation = evaluateCandidateEligibility(mergedCandidate, drive.eligibilityCriteria);

    return NextResponse.json({
      success: true,
      driveId: drive.id,
      evaluation,
    });
  } catch (err) {
    console.error("[POST /api/student/drives/[id]/eligibility] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
