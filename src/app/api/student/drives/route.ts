import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getRecruitmentDrives,
  getStudentApplicationForDrive,
} from "@/lib/recruitment-store";
import { evaluateCandidateEligibility } from "@/lib/eligibility-engine";
import { ServerStore } from "@/lib/server-store";
import { defaultStudentUser } from "@/data/mock-users";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const department = searchParams.get("department") || "all";
    const workMode = searchParams.get("workMode") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    // Fetch student profile for live eligibility calculation
    let studentProfile: any = ServerStore.getStudentProfileById(auth.student.id);
    if (!studentProfile) {
      studentProfile = {
        ...defaultStudentUser,
        id: auth.student.id,
        name: auth.student.name || defaultStudentUser.name,
        email: auth.student.email || defaultStudentUser.email,
        backlogs: 0,
      };
    }

    const allDrives = getRecruitmentDrives();

    // Filter to public-visible statuses for students
    let visibleDrives = allDrives.filter(
      (d) =>
        d.status === "APPLICATIONS_OPEN" ||
        d.status === "PUBLISHED" ||
        d.status === "SCREENING" ||
        d.status === "SELECTION_IN_PROGRESS" ||
        d.status === "RESULTS_PUBLISHED" ||
        d.status === "CLOSED"
    );

    // Apply query filters
    if (status !== "all") {
      if (status === "OPEN") {
        visibleDrives = visibleDrives.filter(
          (d) => d.status === "APPLICATIONS_OPEN" || d.status === "PUBLISHED"
        );
      } else {
        visibleDrives = visibleDrives.filter(
          (d) => d.status.toLowerCase() === status.toLowerCase()
        );
      }
    }

    if (department !== "all") {
      visibleDrives = visibleDrives.filter(
        (d) => d.department.toLowerCase() === department.toLowerCase()
      );
    }

    if (workMode !== "all") {
      visibleDrives = visibleDrives.filter(
        (d) => d.workMode.toLowerCase() === workMode.toLowerCase()
      );
    }

    if (search) {
      visibleDrives = visibleDrives.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.position.toLowerCase().includes(search) ||
          d.company.toLowerCase().includes(search) ||
          d.department.toLowerCase().includes(search) ||
          d.location.toLowerCase().includes(search) ||
          d.eligibilityCriteria.requiredSkills.some((s) => s.toLowerCase().includes(search))
      );
    }

    // Enrich each drive with student's application status and eligibility preview
    const enrichedDrives = visibleDrives.map((drive) => {
      const application = getStudentApplicationForDrive(auth.student!.id, drive.id);
      const eligibility = evaluateCandidateEligibility(studentProfile, drive.eligibilityCriteria);

      return {
        ...drive,
        userApplication: application
          ? {
              id: application.id,
              status: application.status,
              currentStageName: application.currentStageName,
              appliedAt: application.appliedAt,
            }
          : null,
        eligibilitySummary: {
          status: eligibility.status,
          score: eligibility.score,
          passedCount: eligibility.passedCount,
          totalCount: eligibility.totalCount,
        },
      };
    });

    return NextResponse.json({
      success: true,
      drives: enrichedDrives,
      totalCount: enrichedDrives.length,
    });
  } catch (err) {
    console.error("[GET /api/student/drives] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
