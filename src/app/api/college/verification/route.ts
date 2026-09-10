import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { VerificationRequest } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetCollegeId =
      searchParams.get("collegeId") ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const collegeStudents = ServerStore.getCollegeStudents(targetCollegeId);
    const studentMap = new Map(collegeStudents.map((s) => [s.id, s]));

    const allRequests: VerificationRequest[] = ServerStore.getAllVerificationRequests();
    const collegeRequests = allRequests.filter(
      (r: VerificationRequest) =>
        studentMap.has(r.studentId) ||
        (r.student && r.student.college && r.student.college.toLowerCase().includes("stanford"))
    );

    const verifiedCount = collegeStudents.filter((s) => {
      const v = String(s.verificationStatus || "").toLowerCase();
      return v === "approved" || v === "verified";
    }).length;

    const pendingCount = collegeStudents.filter((s) => {
      const v = String(s.verificationStatus || "").toLowerCase();
      return v === "pending" || v.includes("review");
    }).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalStudents: collegeStudents.length,
        verifiedCount,
        pendingCount,
        unverifiedCount: Math.max(0, collegeStudents.length - verifiedCount - pendingCount),
        verificationRate: collegeStudents.length > 0 ? Math.round((verifiedCount / collegeStudents.length) * 100) : 0,
      },
      requests: collegeRequests,
      students: collegeStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        degree: s.degree,
        branch: s.branch,
        department: s.department || s.branch,
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        verificationStatus: s.verificationStatus,
      })),
    });
  } catch (err) {
    console.error("[GET /api/college/verification] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { studentId, status, remarks } = body;

    if (!studentId || !status) {
      return NextResponse.json({ error: "studentId and status are required" }, { status: 400 });
    }

    const student = ServerStore.getStudent(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updated = ServerStore.updateStudent(studentId, {
      verificationStatus: status === "VERIFIED" ? "approved" : status === "REJECTED" ? "rejected" : "pending",
    });

    return NextResponse.json({
      success: true,
      student: updated,
      message: `Student verification updated to ${status} by college placement authority`,
    });
  } catch (err) {
    console.error("[PATCH /api/college/verification] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
