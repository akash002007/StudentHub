import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
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

    const batches = ServerStore.getCollegeBatches(targetCollegeId);

    return NextResponse.json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (err) {
    console.error("[GET /api/college/batches] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
