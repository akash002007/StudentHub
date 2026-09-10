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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "ALL";
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  let colleges = ServerStore.getColleges();

  if (status !== "ALL") {
    colleges = colleges.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    colleges = colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        (c.location && c.location.toLowerCase().includes(search)) ||
        (c.placementOfficer?.name && c.placementOfficer.name.toLowerCase().includes(search)) ||
        (c.placementOfficer?.email && c.placementOfficer.email.toLowerCase().includes(search))
    );
  }

  // Enrich with live student count & placement rate from metrics
  const enriched = colleges.map((c) => {
    const metrics = ServerStore.getCollegeMetrics(c.id);
    return {
      ...c,
      enrolledStudentsCount: metrics.totalStudents,
      placedCount: metrics.studentsPlaced,
      placementRate: metrics.placementRate,
      activeDrivesCount: metrics.activePlacementDrives,
    };
  });

  return NextResponse.json({
    success: true,
    count: enriched.length,
    colleges: enriched,
  });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, code, domain, location, adminName, adminEmail } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Institution name and code are required" }, { status: 400 });
    }

    const collegeId = `col_${code.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`;
    const newCollege = {
      id: collegeId,
      name,
      code: code.toUpperCase(),
      slug: code.toLowerCase(),
      logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80",
      location: location || "Campus",
      website: `https://${domain || code.toLowerCase() + ".edu"}`,
      establishedYear: new Date().getFullYear(),
      status: "PENDING" as const,
      verificationStatus: "PENDING" as const,
      placementOfficer: {
        name: adminName || "Placement Coordinator",
        email: adminEmail || `placement@${code.toLowerCase()}.edu`,
        designation: "Head of Training & Placement",
      },
      departments: [],
      batches: [],
      placementPolicy: {
        minAttendancePercentage: 75,
        maxOffersAllowed: 2,
        dreamTierThresholdLpa: 18,
        allowSimultaneousInterview: true,
        rules: ["Standard campus placement policy"],
      },
      stats: {
        totalStudents: 0,
        eligibleStudents: 0,
        placedStudents: 0,
        placementRate: 0,
        activeDrivesCount: 0,
        averagePackageLpa: 0,
        highestPackageLpa: 0,
      },
    };

    const created = ServerStore.updateCollege(collegeId, newCollege as any);

    return NextResponse.json({
      success: true,
      college: created,
      message: "Institution created successfully and queued for approval",
    });
  } catch (err) {
    console.error("[POST /api/admin/colleges] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
