import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getApplications, getAssessments, getInterviews } from "@/lib/recruitment-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const targetCollegeId =
      searchParams.get("collegeId") ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const student = ServerStore.getStudent(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // RBAC validation: ensure the student belongs to this college (unless platform admin)
    const isPlatformAdmin = ["PLATFORM_ADMIN", "SUPER_ADMIN"].includes(auth.collegeUser.role);
    if (!isPlatformAdmin && student.collegeId && student.collegeId !== targetCollegeId) {
      return NextResponse.json({ error: "Access denied: student belongs to another institution" }, { status: 403 });
    }

    // Get student's recruitment history
    const applications = getApplications().filter((a) => a.studentId === studentId);
    const assessments = getAssessments().filter((a) => a.studentId === studentId);
    const interviews = getInterviews().filter((i) => i.studentId === studentId);
    const verification = ServerStore.getVerificationRequestByStudentId(studentId);

    return NextResponse.json({
      success: true,
      student,
      applications,
      assessments,
      interviews,
      verification,
    });
  } catch (err) {
    console.error("[GET /api/college/students/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
