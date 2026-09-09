import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import { getStudentOverviewMetrics } from "@/lib/recruitment-store";
import { ServerStore } from "@/lib/server-store";
import { defaultStudentUser } from "@/data/mock-users";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
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

    const overview = getStudentOverviewMetrics(auth.student.id);

    return NextResponse.json({
      success: true,
      overview,
      studentProfile: {
        name: studentProfile.name,
        university: studentProfile.university,
        degree: studentProfile.degree,
        branch: studentProfile.branch || studentProfile.specialization,
        cgpa: studentProfile.cgpa,
        graduationYear: studentProfile.graduationYear,
        verificationStatus: studentProfile.verificationStatus || "pending",
        hasResume: !!studentProfile.resume,
      },
    });
  } catch (err) {
    console.error("[GET /api/student/overview] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
