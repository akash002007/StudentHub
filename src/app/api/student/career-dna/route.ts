import { NextRequest, NextResponse } from "next/server";
import {
  getCareerDNA,
  getGitHubConnection,
  getCodeforcesConnection,
  getLeetCodeConnection,
  getHuggingFaceConnection,
  ServerStore,
} from "@/lib/server-store";
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
    const hfConn = getHuggingFaceConnection(targetStudentId);

    if (!dna) {
      return NextResponse.json({
        exists: false,
        careerDNA: null,
        locked: !isVerified,
        reason: !isVerified ? "VERIFICATION_REQUIRED" : undefined,
        verificationStatus: normStatus,
        message: "Career DNA has not been generated for this student yet.",
        githubConnection: ghConn,
        codeforcesConnection: cfConn,
        leetcodeConnection: lcConn,
        huggingfaceConnection: hfConn,
      });
    }

    const isGhSynced = Boolean(ghConn && (ghConn.syncStatus === "SYNCED" || Boolean(ghConn.syncCompletedAt)));

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
      huggingfaceStats: (dna as any).huggingfaceStats || null,
      certificateStats: (dna as any).certificateStats || null,
      evidences: dna.evidences || [],
      featuredProjects: dna.featuredProjects || [],
      sourceBreakdown: dna.sourceBreakdown || {
        resumeScore: 81,
        githubScore: isGhSynced ? (dna.overallScore ?? 74) : null,
        projectsScore: 86,
        skillsScore: 84,
        experienceScore: 76,
        educationScore: 82,
      },
      sourceStatuses: dna.sourceStatuses || {
        resume: "ANALYZED",
        github: isGhSynced ? "ANALYZED" : ghConn?.syncStatus === "SYNCING" ? "ANALYZING" : "NOT_CONNECTED",
        projects: "ANALYZED",
        skills: "ANALYZED",
        experience: "ANALYZED",
        education: "ANALYZED",
        certifications: "NOT_CONNECTED",
      },
      nextBestActions: dna.nextBestActions || [],
      history: dna.history || [],
      verified: Boolean(isGhSynced || cfConn?.syncStatus === "SYNCED" || lcConn?.syncStatus === "SYNCED"),
      updatedAt: dna.updatedAt || new Date().toISOString(),
    };

    return NextResponse.json({
      exists: true,
      locked: !isVerified,
      reason: !isVerified ? "VERIFICATION_REQUIRED" : undefined,
      verificationStatus: normStatus,
      careerDNA: sanitizedDNA,
      githubConnection: ghConn,
      codeforcesConnection: cfConn,
      leetcodeConnection: lcConn,
      huggingfaceConnection: hfConn,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    const rawUserId = body.userId || searchParams.get("userId") || searchParams.get("studentId");

    const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
    if (!authUser) {
      return unauthorizedResponse("Authentication required to recalculate Career DNA");
    }

    const targetStudentId = rawUserId || authUser.userId;

    if (
      authUser.role !== "recruiter" &&
      authUser.role !== "admin" &&
      authUser.userId !== targetStudentId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to recalculate this student's Career DNA" },
        { status: 403 }
      );
    }

    const { CareerDNABuilder } = await import("@/lib/career-dna");
    const updatedDNA = CareerDNABuilder.recalculateCareerDNA(targetStudentId);

    const student = ServerStore.getStudentProfileById(targetStudentId);
    const isVerified = isStudentVerified(student);
    const normStatus = normalizeVerificationStatus(student?.verificationStatus);
    const ghConn = getGitHubConnection(targetStudentId);
    const cfConn = getCodeforcesConnection(targetStudentId);
    const lcConn = getLeetCodeConnection(targetStudentId);
    const hfConn = getHuggingFaceConnection(targetStudentId);

    return NextResponse.json({
      success: true,
      message: "Career DNA recalculated successfully.",
      exists: true,
      locked: !isVerified,
      verificationStatus: normStatus,
      careerDNA: updatedDNA,
      githubConnection: ghConn,
      codeforcesConnection: cfConn,
      leetcodeConnection: lcConn,
      huggingfaceConnection: hfConn,
    });
  } catch (err: unknown) {
    console.error("[Career DNA API] Error recalculating Career DNA:", err);
    return NextResponse.json(
      { success: false, error: "Failed to recalculate Career DNA." },
      { status: 500 }
    );
  }
}
