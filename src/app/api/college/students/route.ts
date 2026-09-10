import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getApplications } from "@/lib/recruitment-store";

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

    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const department = searchParams.get("department") || "ALL";
    const batch = searchParams.get("batch") || "ALL";
    const placementStatus = searchParams.get("placementStatus") || "ALL";
    const verificationStatus = searchParams.get("verificationStatus") || "ALL";

    let students = ServerStore.getCollegeStudents(targetCollegeId);

    // Apply filters
    if (department !== "ALL") {
      students = students.filter(
        (s) =>
          (s.department && s.department.toLowerCase() === department.toLowerCase()) ||
          (s.branch && s.branch.toLowerCase().includes(department.toLowerCase()))
      );
    }

    if (batch !== "ALL") {
      students = students.filter((s) => String(s.graduationYear) === batch);
    }

    if (placementStatus !== "ALL") {
      students = students.filter(
        (s) => (s.placementStatus || "UNPLACED").toLowerCase() === placementStatus.toLowerCase()
      );
    }

    if (verificationStatus !== "ALL") {
      students = students.filter((s) => {
        const v = String(s.verificationStatus || "").toLowerCase();
        if (verificationStatus.toLowerCase() === "verified") return v.includes("verified") || v === "approved";
        if (verificationStatus.toLowerCase() === "pending") return v.includes("pending") || v.includes("review");
        if (verificationStatus.toLowerCase() === "rejected") return v.includes("rejected");
        return true;
      });
    }

    if (search) {
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          (s.branch && s.branch.toLowerCase().includes(search)) ||
          (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(search)))
      );
    }

    // Enrich with applications count
    const allApps = getApplications();
    const enriched = students.map((s) => {
      const studentApps = allApps.filter((a) => a.studentId === s.id);
      return {
        ...s,
        applicationsCount: studentApps.length,
        offersCount: studentApps.filter((a) => a.status === "SELECTED").length,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      students: enriched,
    });
  } catch (err: any) {
    console.error("[GET /api/college/students] Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err?.message, stack: err?.stack }, { status: 500 });
  }
}
