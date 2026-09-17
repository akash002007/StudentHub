import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { CollegeIntelligenceEngine, CollegeIntelligenceFilters } from "@/lib/college-intelligence-engine";

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

    // Strict institutional scoping
    const isPlatformAdmin = ["PLATFORM_ADMIN", "SUPER_ADMIN"].includes(auth.collegeUser.role);
    const userCollegeId = auth.collegeUser.college_id || (auth.collegeUser as any).collegeId || "col_stanford";

    if (!isPlatformAdmin && targetCollegeId !== userCollegeId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view intelligence for another institution." },
        { status: 403 }
      );
    }

    const filters: CollegeIntelligenceFilters = {
      collegeId: targetCollegeId,
      academicYear: searchParams.get("academicYear") || "2026-27",
      department: searchParams.get("department") || "ALL",
      program: searchParams.get("program") || "ALL",
      opportunityType: (searchParams.get("opportunityType") as any) || "ALL",
      company: searchParams.get("company") || "ALL",
      dateRange: searchParams.get("dateRange") || "THIS_YEAR",
    };

    const intelligence = CollegeIntelligenceEngine.getPlacementIntelligence(filters);

    return NextResponse.json({
      success: true,
      data: intelligence,
    });
  } catch (err) {
    console.error("[GET /api/college/intelligence] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
