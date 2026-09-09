import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getStudentApplications,
  getRecruitmentDriveById,
  getStagesForDrive,
} from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const studentApps = getStudentApplications(auth.student.id);

    // Enrich applications with live drive data and stages list
    let enriched = studentApps.map((app) => {
      const drive = getRecruitmentDriveById(app.driveId);
      const stages = getStagesForDrive(app.driveId);
      return {
        ...app,
        companyLogo: drive?.companyLogo || "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
        salaryStipend: drive?.salaryStipend || "Competitive",
        location: drive?.location || "San Francisco, CA",
        workMode: drive?.workMode || "HYBRID",
        department: drive?.department || "Engineering",
        stages,
      };
    });

    if (statusFilter !== "all") {
      enriched = enriched.filter((a) => a.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (search) {
      enriched = enriched.filter(
        (a) =>
          a.driveTitle.toLowerCase().includes(search) ||
          a.company.toLowerCase().includes(search) ||
          a.id.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      applications: enriched,
      totalCount: enriched.length,
    });
  } catch (err) {
    console.error("[GET /api/student/applications] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
