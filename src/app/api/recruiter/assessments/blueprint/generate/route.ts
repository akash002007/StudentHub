import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiter } from "@/lib/supabase/server";
import { generatePaperFromBlueprint } from "@/lib/assessment-engine";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const { sections, companyId } = body;

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: "Sections blueprint array is required." }, { status: 400 });
    }

    const targetCompanyId = companyId || auth.recruiter.company_id || "comp_stripe";
    const result = generatePaperFromBlueprint(sections, targetCompanyId, auth.recruiter);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/recruiter/assessments/blueprint/generate] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
