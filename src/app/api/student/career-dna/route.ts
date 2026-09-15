import { NextRequest, NextResponse } from "next/server";
import { getCareerDNA, getGitHubConnection, getCodeforcesConnection, getLeetCodeConnection, ServerStore } from "@/lib/server-store";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";
import { isStudentVerified, normalizeVerificationStatus } from "@/lib/student-access-policy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawUserId = searchParams.get("userId") || searchParams.get("studentId");

    const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
    if (!authUser) {
      return unauthorizedResponse("Authentication required to view Career DNA");
    }

    const targetStudentId = rawUserId || authUser.userId;

    // Authorization check: User can view if they are a recruiter, an admin, or the student themselves
    if (
      authUser.role !== "recruiter" &&
      authUser.role !== "admin" &&
      authUser.userId !== targetStudentId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to access this student's Career DNA" },
        { status: 403 }
      );
    }

    const student = ServerStore.getStudentProfileById(targetStudentId);
    const isVerified = isStudentVerified(student);
    const normStatus = normalizeVerificationStatus(student?.verificationStatus);

    const dna = getCareerDNA(targetStudentId);
    const ghConn = getGitHubConnection(targetStudentId);
    const cfConn = getCodeforcesConnection(targetStudentId);
    const lcConn = getLeetCodeConnection(targetStudentId);

    if (!dna) {
      return NextResponse.json({
        exists: false,
        careerDNA: null,
        locked: !isVerified,
        reason: !isVerified ? "VERIFICATION_REQUIRED" : undefined,
        verificationStatus: normStatus,
        message: "Career DNA has not been generated for this student yet.",
      });
    }

    // Sanitized Career DNA payload for authorized recruiter/student views
    const sanitizedDNA = {
      overallScore: dna.overallScore ?? 80,
      score: dna.overallScore ?? 80,
      dimensions: dna.dimensions || {},
      dimensionExplanations: dna.dimensionExplanations || {},
      topSkills: dna.topSkills || [],
      verifiedSkillsCount: (dna as any).verifiedSkillsCount ?? (Array.isArray(dna.topSkills) ? dna.topSkills.length : 0),
      potentialCareerDirections: dna.potentialCareerDirections || [],
      skillGaps: dna.skillGaps || [],
      summary: dna.summary || "",
      analysisConfidence: dna.analysisConfidence ?? 90,
      githubStats: dna.githubStats || null,
      codeforcesStats: dna.codeforcesStats || null,
      leetcodeStats: dna.leetcodeStats || null,
      evidences: dna.evidences || [],
      featuredProjects: dna.featuredProjects || [],
      verified: Boolean(ghConn?.syncStatus === "SYNCED" || cfConn?.syncStatus === "SYNCED" || lcConn?.syncStatus === "SYNCED"),
      updatedAt: dna.updatedAt || new Date().toISOString(),
    };

    return NextResponse.json({
      exists: true,
      locked: !isVerified,
      reason: !isVerified ? "VERIFICATION_REQUIRED" : undefined,
      verificationStatus: normStatus,
      careerDNA: sanitizedDNA,
    });
  } catch (err: unknown) {
    console.error("[Career DNA API] Error fetching Career DNA:", err);
    return NextResponse.json(
      {
        exists: false,
        careerDNA: null,
        error: "An unexpected error occurred while loading Career DNA.",
      },
      { status: 500 }
    );
  }
}
