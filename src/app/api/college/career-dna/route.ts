import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { CollegeIntelligenceEngine } from "@/lib/college-intelligence-engine";
import { ServerStore } from "@/lib/server-store";

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

    const intel = CollegeIntelligenceEngine.getPlacementIntelligence({
      collegeId: targetCollegeId,
    });

    const baseInsights = ServerStore.getCollegeCareerDNAInsights(targetCollegeId);

    return NextResponse.json({
      success: true,
      insights: {
        ...baseInsights,
        demandVsCoverage: intel.skillIntelligence,
      },
    });
  } catch (err) {
    console.error("[GET /api/college/career-dna] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
