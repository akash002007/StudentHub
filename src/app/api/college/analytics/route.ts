import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getApplications, getRecruitmentDrives } from "@/lib/recruitment-store";

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

    const metrics = ServerStore.getCollegeMetrics(targetCollegeId);
    const departments = ServerStore.getCollegeDepartments(targetCollegeId);
    const batches = ServerStore.getCollegeBatches(targetCollegeId);
    const recruiters = ServerStore.getCollegeRecruiters(targetCollegeId);

    // Salary brackets
    const salaryBrackets = [
      { bracket: "Tier 1: $160k+ (Super Dream)", count: 2, percentage: 33 },
      { bracket: "Tier 2: $130k - $160k (Dream)", count: 3, percentage: 50 },
      { bracket: "Tier 3: $100k - $130k (Core)", count: 1, percentage: 17 },
      { bracket: "Tier 4: < $100k", count: 0, percentage: 0 },
    ];

    // Monthly recruitment velocity
    const monthlyTrend = [
      { month: "Jan 2026", drives: 2, applications: 18, selections: 1 },
      { month: "Feb 2026", drives: 4, applications: 34, selections: 2 },
      { month: "Mar 2026", drives: 6, applications: 48, selections: 3 },
      { month: "Apr 2026", drives: 3, applications: 22, selections: 0 },
    ];

    return NextResponse.json({
      success: true,
      metrics,
      departments,
      batches,
      recruiters,
      salaryBrackets,
      monthlyTrend,
    });
  } catch (err) {
    console.error("[GET /api/college/analytics] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
