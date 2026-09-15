import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { submitStudentApplication } from "@/lib/recruitment-store";
import { ServerStore } from "@/lib/server-store";
import { defaultStudentUser } from "@/data/mock-users";
import { requireVerifiedStudent } from "@/lib/student-access-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    // Authoritative Verification Check
    const verificationCheck = await requireVerifiedStudent(request, auth.student.id);
    if (!verificationCheck.authorized) {
      return verificationCheck.errorResponse;
    }

    const { id: driveId } = await params;

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body
    }

    // Get current student profile
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

    // Submit application through the centralized recruitment store
    const result = submitStudentApplication({
      driveId,
      student: studentProfile,
      resumeUrl: body.resumeUrl || studentProfile.resume?.url,
      portfolioUrl: body.portfolioUrl || studentProfile.socialLinks?.portfolio,
      githubUrl: body.githubUrl || studentProfile.socialLinks?.github,
      linkedinUrl: body.linkedinUrl || studentProfile.socialLinks?.linkedin,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      application: result.application,
      message: `Application submitted successfully. Application ID: ${result.application?.id}.`,
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/student/drives/[id]/apply] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
