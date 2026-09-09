import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { getApplications } from "@/lib/recruitment-store";

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
  const driveId = searchParams.get("driveId") || undefined;
  const company = searchParams.get("company")?.toLowerCase();

  let apps = getApplications({ driveId });

  if (search) {
    apps = apps.filter(
      (a) =>
        a.id.toLowerCase().includes(search) ||
        a.studentName.toLowerCase().includes(search) ||
        a.studentEmail.toLowerCase().includes(search) ||
        a.university.toLowerCase().includes(search) ||
        a.driveTitle.toLowerCase().includes(search) ||
        a.company.toLowerCase().includes(search)
    );
  }

  if (status && status !== "ALL") {
    apps = apps.filter((a) => a.status.toUpperCase() === status);
  }

  if (company && company !== "all") {
    apps = apps.filter((a) => a.company.toLowerCase().includes(company));
  }

  return NextResponse.json({
    success: true,
    count: apps.length,
    applications: apps,
  });
}
