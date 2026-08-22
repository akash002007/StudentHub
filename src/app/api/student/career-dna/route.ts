import { NextRequest, NextResponse } from "next/server";
import { getCareerDNA, getGitHubConnection, getCodeforcesConnection, getLeetCodeConnection } from "@/lib/server-store";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

  const dna = getCareerDNA(targetStudentId);
  const ghConn = getGitHubConnection(targetStudentId);
  const cfConn = getCodeforcesConnection(targetStudentId);
  const lcConn = getLeetCodeConnection(targetStudentId);

  if (!dna) {
    return NextResponse.json({
      exists: false,
      careerDNA: null,
      message: "Career DNA has not been generated for this student yet.",
    });
  }

  // Sanitized Career DNA payload for authorized recruiter/student views
  const sanitizedDNA = {
    overallScore: dna.overallScore,
    score: dna.overallScore,
    dimensions: dna.dimensions,
    dimensionExplanations: dna.dimensionExplanations,
    topSkills: dna.topSkills,
    verifiedSkillsCount: (dna as any).verifiedSkillsCount ?? (Array.isArray(dna.topSkills) ? dna.topSkills.length : 0),
    potentialCareerDirections: dna.potentialCareerDirections,
    skillGaps: dna.skillGaps,
    summary: dna.summary,
    analysisConfidence: dna.analysisConfidence,
    githubStats: dna.githubStats,
    codeforcesStats: dna.codeforcesStats,
    leetcodeStats: dna.leetcodeStats,
    evidences: dna.evidences,
    featuredProjects: dna.featuredProjects,
    verified: Boolean(ghConn?.syncStatus === "SYNCED" || cfConn?.syncStatus === "SYNCED" || lcConn?.syncStatus === "SYNCED"),
    updatedAt: dna.updatedAt,
  };

  return NextResponse.json({
    exists: true,
    careerDNA: sanitizedDNA,
  });
}
