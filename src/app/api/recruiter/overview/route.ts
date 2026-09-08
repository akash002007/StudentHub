import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { getRecruiterOverviewMetrics } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const data = getRecruiterOverviewMetrics();
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("[GET /api/recruiter/overview] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
