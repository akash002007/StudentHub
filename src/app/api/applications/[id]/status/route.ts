import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole, authorizeResourceAccess } from "@/lib/authorization";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await requireRole(request, ["RECRUITER", "COMPANY_ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN"]);
    if (errorResponse) return errorResponse;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: applicationId } = await params;
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { status } = body;
    const validStatuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "ACCEPTED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Fetch the internship to authorize IDOR context
    const { data: application } = await supabase
      .from("applications")
      .select("internship_id")
      .eq("id", applicationId)
      .single();
      
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data: internship } = await supabase
      .from("internships")
      .select("company_id")
      .eq("id", application.internship_id)
      .single();
      
    if (!internship) {
      return NextResponse.json({ error: "Associated internship not found" }, { status: 404 });
    }

    // Verify IDOR (ensuring recruiter actually has access to the internship's company)
    const canAccess = authorizeResourceAccess(user, { companyId: internship.company_id });
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this application" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/applications/[id]/status] Database error:", error);
      // For MVP with mock data, we might not have the DB populated, so we can mock success
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ data: { id: applicationId, status } });
      }
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[PATCH /api/applications/[id]/status] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
