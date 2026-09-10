import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const platformMetrics = ServerStore.getPlatformInstitutionalMetrics();
    const colleges = ServerStore.getColleges();

    const collegeComparisons = colleges.map((c) => {
      const metrics = ServerStore.getCollegeMetrics(c.id);
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        location: c.location,
        status: c.status,
        enrolledStudents: metrics.totalStudents,
        placedStudents: metrics.studentsPlaced,
        placementRate: metrics.placementRate,
        averagePackage: metrics.averagePackage,
        highestPackage: metrics.highestPackage,
        activeDrives: metrics.activePlacementDrives,
        corporatePartnersCount: metrics.companiesEngaged,
      };
    });

    return NextResponse.json({
      success: true,
      platformMetrics,
      collegeComparisons,
    });
  } catch (err) {
    console.error("[GET /api/admin/college-analytics] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
