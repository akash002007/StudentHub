import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { getRecruitmentDrives, getStagesForDrive, getApplications } from "@/lib/recruitment-store";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status")?.toUpperCase();
  const company = searchParams.get("company")?.toLowerCase();

  let drives = getRecruitmentDrives();

  // Enrich with application counts and stages
  const enriched = drives.map((d) => {
    const apps = getApplications({ driveId: d.id });
    const stages = getStagesForDrive(d.id);
    return {
      ...d,
      applicationsCount: apps.length,
      stagesCount: stages.length,
      stages,
    };
  });

  let result = enriched;

  if (search) {
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(search) ||
        d.company.toLowerCase().includes(search) ||
        (d.position && d.position.toLowerCase().includes(search)) ||
        d.location.toLowerCase().includes(search)
    );
  }

  if (status && status !== "ALL") {
    result = result.filter((d) => d.status.toUpperCase() === status);
  }

  if (company && company !== "all") {
    result = result.filter((d) => d.company.toLowerCase().includes(company));
  }

  return NextResponse.json({
    success: true,
    count: result.length,
    drives: result,
  });
}
