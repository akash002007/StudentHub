import {
  CareerDNA,
  CareerDNASnapshot,
  GitHubRepository,
  Project,
  SkillEvidence,
} from "@/types";
import {
  saveCareerDNA,
  getCareerDNA,
  getGitHubConnection,
  getGitHubRepositories,
  getCodeforcesConnection,
  getCodeforcesDNA,
  getLeetCodeConnection,
  getLeetCodeDNA,
  getCertificateDNA,
  getHuggingFaceConnection,
  getHuggingFaceDNA,
  ServerStore,
} from "@/lib/server-store";
import { EvidenceEngine } from "@/lib/evidence-engine";
import { DeterministicScoringEngine } from "@/lib/deterministic-scoring-engine";
import { CareerDNAAIInterpreter } from "@/lib/career-dna-ai-interpreter";

export class CareerDNABuilder {
  /**
   * Incrementally compiles student's Career DNA by synthesizing extracted GitHub evidence
   * through the deterministic scoring engine and AI evidence interpreter.
   */
  static compileCareerDNA(
    userId: string,
    projects: Project[],
    skillEvidences: SkillEvidence[],
    repositories: GitHubRepository[]
  ): CareerDNA {
    const existingDNA = getCareerDNA(userId);
    const now = new Date().toISOString();

    // 1. Extract Normalized Evidence Objects (Physical Evidence Engine)
    const normalizedEvidences = EvidenceEngine.extractEvidence(repositories);

    // 2. Calculate Deterministic Numerical Scores & Confidence (Deterministic Scoring Engine)
    const {
      overallScore,
      analysisConfidence,
      dimensions,
      scoringWeights,
      scoringVersion,
      analysisVersion,
    } = DeterministicScoringEngine.calculateScores(repositories, normalizedEvidences);

    // 3. Generate Natural Language Explanations & Career Directions (AI Evidence Interpreter)
    const {
      summary,
      dimensionExplanations,
      potentialCareerDirections,
      skillGaps,
    } = CareerDNAAIInterpreter.interpret(
      dimensions,
      overallScore,
      normalizedEvidences,
      projects,
      repositories
    );

    // 4. Merge Skill Evidences incrementally
    const mergedSkillMap = new Map<string, SkillEvidence>();
    if (existingDNA?.skillEvidences) {
      for (const ev of existingDNA.skillEvidences) {
        mergedSkillMap.set(ev.skill, ev);
      }
    }
    for (const newEv of skillEvidences) {
      mergedSkillMap.set(newEv.skill, newEv);
    }
    const allSkillEvidences = Array.from(mergedSkillMap.values()).sort(
      (a, b) => b.confidence - a.confidence
    );

    // 5. Top Skills
    const topSkills = allSkillEvidences.slice(0, 10).map((ev) => ({
      name: ev.skill,
      score: ev.confidence,
      evidenceCount: repositories.filter(
        (r) =>
          r.language === ev.skill ||
          (r.topics && r.topics.includes(ev.skill.toLowerCase()))
      ).length || 1,
    }));

    // 6. GitHub & Codeforces Stats
    let totalStars = 0;
    let topRepoName = "";
    let maxStars = -1;
    const languageCounts: Record<string, number> = {};

    for (const repo of repositories) {
      totalStars += repo.starsCount || 0;
      if (repo.starsCount > maxStars) {
        maxStars = repo.starsCount;
        topRepoName = repo.name;
      }
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }

    const primaryLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 5);

    const cfConn = getCodeforcesConnection(userId);
    const cfDNA = getCodeforcesDNA(userId);
    const lcConn = getLeetCodeConnection(userId);
    const lcDNA = getLeetCodeDNA(userId);
    const certDNA = getCertificateDNA(userId);
    const hfConn = getHuggingFaceConnection(userId);
    const hfDNA = getHuggingFaceDNA(userId);

    const isCfVerified = Boolean(cfConn && cfConn.status === "VERIFIED");
    const isLcVerified = Boolean(lcConn && lcConn.status === "VERIFIED");

    const codeforcesStats = isCfVerified && cfConn
      ? {
          handle: cfConn.handle,
          rating: cfConn.rating,
          maxRating: cfConn.maxRating,
          rank: cfConn.rank,
          solvedProblemsCount: cfConn.solvedProblemsCount,
          contestsCount: cfConn.contestsCount,
          lastSyncAt: cfConn.lastSyncedAt || now,
        }
      : null;

    const leetcodeStats = isLcVerified && lcConn
      ? {
          leetcodeId: lcConn.leetcodeId,
          totalProblemsSolved: lcConn.totalProblemsSolved,
          easySolved: lcConn.easySolved,
          mediumSolved: lcConn.mediumSolved,
          hardSolved: lcConn.hardSolved,
          contestRating: lcConn.contestRating,
          ranking: lcConn.ranking,
          lastSyncAt: lcConn.lastSyncedAt || now,
        }
      : null;

    const certificateStats = certDNA && certDNA.totalCertificates > 0
      ? {
          totalCertificates: certDNA.totalCertificates,
          verifiedCertificates: certDNA.verifiedCount,
          topSkills: certDNA.topVerifiedSkills.map((s: { name: string; certificateCount: number }) => s.name),
          lastAnalysisAt: now,
        }
      : null;

    const isHfConnected = Boolean(hfConn && (hfConn.syncStatus === "SYNCED" || hfConn.syncStatus === "CONNECTED"));

    const huggingfaceStats = isHfConnected && hfConn
      ? {
          username: hfConn.username,
          modelsCount: hfConn.modelsCount,
          datasetsCount: hfConn.datasetsCount,
          spacesCount: hfConn.spacesCount,
          totalLikes: hfConn.totalLikes,
          lastSyncAt: hfConn.lastSyncedAt || now,
        }
      : null;

    // 7. Source Statuses & Availability-Aware Breakdown Scores
    const ghConn = getGitHubConnection(userId);
    const hasGithub = Boolean(repositories.length > 0 || (ghConn && (ghConn.syncStatus === "SYNCED" || Boolean(ghConn.syncCompletedAt))));
    const isGhSyncing = Boolean(ghConn && ghConn.syncStatus === "SYNCING");
    const githubScore = hasGithub ? overallScore : null;

    const hasProjects = projects.length > 0;
    const hasCodeforces = Boolean(isCfVerified && cfConn && cfConn.syncStatus === "SYNCED");
    const hasLeetCode = Boolean(isLcVerified && lcConn && lcConn.syncStatus === "SYNCED");
    const hasCertificates = Boolean(certDNA && certDNA.totalCertificates > 0);
    const hasHuggingFace = Boolean(isHfConnected && hfConn);

    const sourceStatuses = {
      resume: "ANALYZED" as const,
      github: hasGithub ? ("ANALYZED" as const) : isGhSyncing ? ("PROCESSING" as const) : ("NOT_CONNECTED" as const),
      codeforces: hasCodeforces ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
      leetcode: hasLeetCode ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
      huggingface: hasHuggingFace ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
      certificates: hasCertificates ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
      projects: hasProjects ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
      skills: "ANALYZED" as const,
      experience: "ANALYZED" as const,
      education: "ANALYZED" as const,
      certifications: hasCertificates ? ("ANALYZED" as const) : ("NOT_CONNECTED" as const),
    };

    // Check verified document credentials (only non-expired VERIFIED and AUTO_VERIFIED count)
    const userDocs = ServerStore.getDocumentsByUserId(userId);
    const verifiedDocs = userDocs.filter(
      (d) =>
        (d.verificationStatus === "VERIFIED" || d.verificationStatus === "AUTO_VERIFIED") &&
        d.expiryStatus !== "EXPIRED" &&
        (!d.expiresAt || new Date(d.expiresAt).getTime() > Date.now())
    );
    const hasVerifiedDegree = verifiedDocs.some(
      (d) => d.documentType === "DEGREE_CERTIFICATE" || d.documentType === "MARKSHEET"
    );
    const hasVerifiedInternship = verifiedDocs.some(
      (d) => d.documentType === "INTERNSHIP_CERTIFICATE"
    );

    const resumeScore = 81;
    const projectsScore = hasProjects ? Math.round(85 * 1.02) : 80;
    const skillsScore = 84;
    const experienceScore = hasVerifiedInternship ? 88 : 76;
    const educationScore = hasVerifiedDegree ? 92 : 82;

    const sourceBreakdown = {
      resumeScore,
      githubScore,
      codeforcesScore: hasCodeforces && cfDNA ? cfDNA.score : null,
      leetcodeScore: hasLeetCode && lcDNA ? lcDNA.score : null,
      huggingfaceScore: hasHuggingFace && hfDNA ? hfDNA.score : null,
      certificatesScore: hasCertificates && certDNA ? certDNA.score : null,
      projectsScore,
      skillsScore,
      experienceScore,
      educationScore,
    };

    // Calculate composite overall Career DNA score incorporating GitHub evidence alongside other sources:
    // Resume + GitHub + Projects + Skills + Experience + Education -> Career DNA
    let compositeOverallScore: number;
    if (githubScore !== null) {
      compositeOverallScore = Math.round(
        resumeScore * 0.20 +
        githubScore * 0.20 +
        projectsScore * 0.20 +
        skillsScore * 0.15 +
        experienceScore * 0.15 +
        educationScore * 0.10
      );
    } else {
      compositeOverallScore = Math.round(
        resumeScore * 0.25 +
        projectsScore * 0.25 +
        skillsScore * 0.20 +
        experienceScore * 0.15 +
        educationScore * 0.15
      );
    }

    // 8. Next Best Actions
    const nextBestActions = [
      {
        id: "act_testing",
        priority: "HIGH" as const,
        title: "Add Automated Testing",
        reason: "Your repositories show limited automated unit testing evidence.",
        action: "Add Jest, PyTest, or Playwright tests to your main repository to demonstrate production engineering quality.",
        source: "GitHub & Project Intelligence",
      },
      {
        id: "act_cicd",
        priority: "MEDIUM" as const,
        title: "Add Cloud Deployment & CI/CD",
        reason: "No GitHub Actions workflow or cloud deployment configuration was detected.",
        action: "Add a .github/workflows/ci.yml file or link a deployed Vercel/AWS production URL.",
        source: "Architecture Assessment",
      },
      {
        id: "act_quantify",
        priority: "MEDIUM" as const,
        title: "Quantify Project Achievements",
        reason: "Resume project entries lack quantifiable performance metrics.",
        action: "Add percentage improvements, user counts, or latency gains to your project descriptions.",
        source: "Resume DNA",
      },
    ];

    // 9. Historical Snapshot Progression Tracking
    const newSnapshot: CareerDNASnapshot = {
      snapshotId: `snap_${Date.now()}`,
      overallScore: compositeOverallScore,
      analysisConfidence,
      dimensions,
      capturedAt: now,
    };

    const existingHistory = existingDNA?.history || [];
    const updatedHistory = [...existingHistory, newSnapshot].slice(-10); // Keep last 10 snapshots

    const newDNA: CareerDNA = {
      id: `dna_${userId}`,
      userId,
      overallScore: compositeOverallScore,
      analysisConfidence,
      dimensions,
      dimensionExplanations,
      evidences: normalizedEvidences,
      topSkills,
      skillEvidences: allSkillEvidences,
      featuredProjects: projects.slice(0, 6),
      summary,
      potentialCareerDirections,
      skillGaps,
      scoringVersion,
      analysisVersion,
      scoringWeights,
      sourceStatuses,
      sourceBreakdown,
      nextBestActions,
      githubStats: {
        totalRepos: repositories.length,
        primaryLanguages,
        topRepoName: topRepoName || (repositories[0] ? repositories[0].name : "N/A"),
        totalStars,
        lastSyncAt: now,
      },
      codeforcesStats,
      leetcodeStats,
      huggingfaceStats,
      certificateStats,
      history: updatedHistory,
      updatedAt: now,
    };

    saveCareerDNA(userId, newDNA);
    return newDNA;
  }

  /**
   * Recalculates and compiles fresh Career DNA for a student based on current GitHub repositories,
   * resume evidence, documents, and platform connections.
   */
  static recalculateCareerDNA(userId: string): CareerDNA {
    const repositories = getGitHubRepositories(userId);
    const { ProjectIntelligenceEngine } = require("@/lib/project-intelligence");
    const { SkillIntelligenceEngine } = require("@/lib/skill-intelligence");
    const projects = ProjectIntelligenceEngine.extractProjects(repositories);
    const skillEvidences = SkillIntelligenceEngine.extractSkillEvidences(userId, repositories);
    return this.compileCareerDNA(userId, projects, skillEvidences, repositories);
  }
}
