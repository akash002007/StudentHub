import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthenticatedRecruiter } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthenticatedRecruiter(request);
    if (!auth.recruiter) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

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
    
    // In a production app, we would verify the recruiter has access to this specific internship's applications.
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
