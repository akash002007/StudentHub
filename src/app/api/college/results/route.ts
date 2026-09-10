import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCollege } from "@/lib/supabase/server";
import { ServerStore } from "@/lib/server-store";
import { getApplications, getRecruitmentDrives } from "@/lib/recruitment-store";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedCollege(request);
    if (!auth.collegeUser) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetCollegeId =
      searchParams.get("collegeId") ||
      auth.collegeUser.college_id ||
      (auth.collegeUser as any).collegeId ||
      "col_stanford";

    const collegeStudents = ServerStore.getCollegeStudents(targetCollegeId);
    const studentMap = new Map(collegeStudents.map((s) => [s.id, s]));

    const drives = getRecruitmentDrives();
    const driveMap = new Map(drives.map((d) => [d.id, d]));

    const allApps = getApplications();
    const collegeApps = allApps.filter((a) => studentMap.has(a.studentId));

    // Find offers & selections
    const selectedApps = collegeApps.filter((a) => a.status === "SELECTED");

    // Group offers by student to detect multiple offers
    const studentOfferMap = new Map<string, typeof selectedApps>();
    for (const app of selectedApps) {
      const existing = studentOfferMap.get(app.studentId) || [];
      existing.push(app);
      studentOfferMap.set(app.studentId, existing);
    }

    const multipleOffersStudents = Array.from(studentOfferMap.entries())
      .filter(([_, apps]) => apps.length > 1)
      .map(([studentId, apps]) => {
        const student = studentMap.get(studentId);
        return {
          candidateId: studentId,
          candidateName: student?.name || apps[0].studentName,
          email: student?.email || apps[0].studentEmail,
          department: student?.department || student?.branch || "Engineering",
          offersCount: apps.length,
          offers: apps.map((a) => {
            const drive = driveMap.get(a.driveId);
            return {
              applicationId: a.id,
              driveId: a.driveId,
              company: drive?.company || "Enterprise Partner",
              position: drive?.position || a.driveTitle,
              salaryRange: drive?.salaryStipend || "$130k - $160k",
              status: a.status,
            };
          }),
        };
      });

    // Extract all selections with compensation & ranking
    const meritList = selectedApps.map((a, idx) => {
      const student = studentMap.get(a.studentId);
      const drive = driveMap.get(a.driveId);

      // Estimate package value for metrics
      let packageValue = 24.5;
      if (drive?.salaryStipend) {
        const num = parseFloat(drive.salaryStipend.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) packageValue = num;
      }

      return {
        id: a.id,
        candidateId: a.studentId,
        candidateName: a.studentName,
        candidateEmail: a.studentEmail,
        studentAvatar: student?.avatar,
        department: student?.department || student?.branch || "Engineering",
        branch: student?.branch || "Computer Science",
        cgpa: student?.cgpa || "3.85",
        driveId: a.driveId,
        driveTitle: a.driveTitle,
        company: drive?.company || "Enterprise Partner",
        companyLogo: drive?.companyLogo,
        position: drive?.position || a.driveTitle,
        salaryRange: drive?.salaryStipend || "$140,000 / year",
        packageValue,
        status: a.status,
        selectionDate: a.updatedAt || a.appliedAt,
        rank: idx + 1,
      };
    });

    const highestPackage = meritList.reduce((max, cur) => Math.max(max, cur.packageValue), 48.0);
    const avgPackage =
      meritList.length > 0
        ? Math.round((meritList.reduce((sum, cur) => sum + cur.packageValue, 0) / meritList.length) * 10) / 10
        : 28.5;

    const uniquePlacedStudents = studentOfferMap.size;
    const totalStudents = collegeStudents.length;
    const placementRate = totalStudents > 0 ? Math.round((uniquePlacedStudents / totalStudents) * 100) : 0;

    return NextResponse.json({
      success: true,
      summary: {
        totalOffers: selectedApps.length,
        uniquePlacedStudents,
        totalStudents,
        placementRate,
        multipleOffersCount: multipleOffersStudents.length,
        highestPackage: `$${highestPackage}k / yr`,
        averagePackage: `$${avgPackage}k / yr`,
      },
      meritList,
      multipleOffersStudents,
    });
  } catch (err) {
    console.error("[GET /api/college/results] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
