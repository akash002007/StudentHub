import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedStudent,
} from "@/lib/supabase/server";
import { localAppliedInternships } from "@/lib/supabase/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify Supabase Auth session and strictly validate STUDENT role
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    const studentId = auth.student.id;
    const { id: internshipId } = await params;

    if (!internshipId) {
      return NextResponse.json({ error: "Missing internship ID" }, { status: 400 });
    }

    // Read optional note from request body
    let notes = "";
    try {
      const body = await request.json();
      notes = body.notes || "";
    } catch {
      // Body may be empty
    }

    // 2. Check local fallback set
    if (localAppliedInternships.has(internshipId)) {
      return NextResponse.json(
        { error: "You have already applied for this internship" },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase Server Client
    const supabase = await createSupabaseServerClient();

    let createdRecord: any = null;

    try {
      // Check if existing application in Supabase
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id, status")
        .eq("user_id", studentId)
        .eq("internship_id", internshipId)
        .maybeSingle();

      if (existingApp) {
        localAppliedInternships.add(internshipId);
        return NextResponse.json(
          { error: "You have already applied for this internship" },
          { status: 400 }
        );
      }

      // Insert new application record with status 'SUBMITTED'
      const { data: newApp, error: insertError } = await supabase
        .from("applications")
        .insert({
          user_id: studentId,
          internship_id: internshipId,
          status: "SUBMITTED",
          notes: notes || undefined,
        })
        .select()
        .single();

      if (!insertError && newApp) {
        createdRecord = newApp;

        // Optionally increment applicants_count on the internship
        try {
          await supabase.rpc("increment_applicants", { row_id: internshipId });
        } catch {
          // Non-critical if RPC doesn't exist
        }
      }
    } catch {
      // Supabase connection unavailable, fall back to memory
    }

    // Mark as applied locally
    localAppliedInternships.add(internshipId);

    const resultApplication = createdRecord || {
      id: "app_" + Date.now(),
      user_id: studentId,
      internship_id: internshipId,
      status: "SUBMITTED",
      applied_at: new Date().toISOString(),
      notes,
    };

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      application: resultApplication,
    });
  } catch (error) {
    console.error("[POST /api/internships/:id/apply] Failed to apply for internship:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
