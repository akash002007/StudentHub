import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedStudent,
} from "@/lib/supabase/server";
import { localSavedInternships } from "@/lib/supabase/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify Supabase Auth session and strictly validate that role is STUDENT
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

    // 2. Initialize Supabase Server Client
    const supabase = await createSupabaseServerClient();

    let toggleResult: boolean | null = null;

    try {
      // Check existing bookmark in saved_internships junction table
      const { data: existing, error: checkError } = await supabase
        .from("saved_internships")
        .select("id")
        .eq("user_id", studentId)
        .eq("internship_id", internshipId)
        .maybeSingle();

      if (!checkError) {
        if (existing) {
          // Delete from junction table
          const { error: deleteError } = await supabase
            .from("saved_internships")
            .delete()
            .eq("id", existing.id);

          if (!deleteError) {
            toggleResult = false;
          }
        } else {
          // Insert into junction table
          const { error: insertError } = await supabase
            .from("saved_internships")
            .insert({
              user_id: studentId,
              internship_id: internshipId,
            });

          if (!insertError) {
            toggleResult = true;
          }
        }
      }
    } catch {
      // Supabase connection or table unavailable, fall back to memory
    }

    // 3. Fallback / synchronization with local in-memory store
    if (toggleResult === null) {
      if (localSavedInternships.has(internshipId)) {
        localSavedInternships.delete(internshipId);
        toggleResult = false;
      } else {
        localSavedInternships.add(internshipId);
        toggleResult = true;
      }
    } else {
      if (toggleResult) {
        localSavedInternships.add(internshipId);
      } else {
        localSavedInternships.delete(internshipId);
      }
    }

    return NextResponse.json({
      success: true,
      saved: toggleResult,
      internshipId,
    });
  } catch (error) {
    console.error("[POST /api/internships/:id/save] Error toggling saved status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
