import {
  GitHubRepository,
  NormalizedEvidence,
  CareerDNAScoreDimensions,
} from "@/types";

export const SCORING_WEIGHTS = {
  technicalDepth: 0.25,
  projectComplexity: 0.20,
  technicalBreadth: 0.15,
  engineeringQuality: 0.15,
  projectCompleteness: 0.10,
  problemSolving: 0.10,
  consistency: 0.05,
};

export class DeterministicScoringEngine {
  /**
   * Deterministically calculates score dimensions, overall score, and analysis confidence percentage
   * strictly from extracted evidence metrics without LLM subjectivity.
   */
  static calculateScores(
    repositories: GitHubRepository[],
    evidences: NormalizedEvidence[]
  ): {
    overallScore: number;
    analysisConfidence: number;
    dimensions: CareerDNAScoreDimensions;
    scoringWeights: Record<string, number>;
    scoringVersion: string;
    analysisVersion: string;
  } {
    const nonForkRepos = repositories.filter((r) => !r.isFork);
    const repoCount = repositories.length;
    const nonForkCount = nonForkRepos.length;

    // 1. Technical Depth (25% Weight)
    // Evaluates implementation-level source code evidence weight and depth
    const sourceCodeEvidences = evidences.filter((e) => e.source === "SOURCE_CODE");
    const depthBase = Math.min(sourceCodeEvidences.length * 15, 60);
    const langMaxBytes = Math.max(
      ...repositories.map((r) =>
        r.languages ? Math.max(...Object.values(r.languages), 0) : 0
      ),
      1000
    );
    const depthByteBonus = Math.min(Math.floor(Math.log10(langMaxBytes + 1) * 8), 35);
    const technicalDepth = Math.min(Math.round(depthBase + depthByteBonus), 98);

    // 2. Technical Breadth (15% Weight)
    // Evaluates unique programming languages and frameworks across repos
    const uniqueSkills = new Set(evidences.filter((e) => e.skill).map((e) => e.skill));
    const technicalBreadth = Math.min(Math.round(uniqueSkills.size * 14 + 30), 96);

    // 3. Project Complexity (20% Weight)
    // Evaluates architecture, database, API, AI/ML evidences and star/fork signals
    const archEvidences = evidences.filter(
      (e) =>
        e.type === "ARCHITECTURE" ||
        e.type === "DATABASE" ||
        e.type === "API" ||
        e.type === "AI_ML"
    );
    const totalStars = repositories.reduce((sum, r) => sum + r.starsCount, 0);
    const complexityBase = Math.min(archEvidences.length * 20, 70);
    const starBonus = Math.min(totalStars * 2, 25);
    const projectComplexity = Math.min(Math.round(complexityBase + starBonus + 10), 95);

    // 4. Engineering Quality (15% Weight)
    // Evaluates non-fork ratio, documentation evidence, and clean descriptions
    const docEvidences = evidences.filter((e) => e.type === "DOCUMENTATION");
    const nonForkRatio = repoCount > 0 ? nonForkCount / repoCount : 1;
    const qualityBase = Math.round(nonForkRatio * 50);
    const docBonus = Math.min(docEvidences.length * 12, 45);
    const engineeringQuality = Math.min(Math.round(qualityBase + docBonus + 5), 95);

    // 5. Project Completeness (10% Weight)
    // Evaluates description presence and updated activity
    const describedCount = repositories.filter(
      (r) => r.description && r.description.trim().length > 10
    ).length;
    const completenessRatio = repoCount > 0 ? describedCount / repoCount : 0.5;
    const projectCompleteness = Math.min(Math.round(completenessRatio * 60 + 35), 95);

    // 6. Problem Solving (10% Weight)
    // Evaluates AI/ML, algorithmic topics, and complex architecture
    const problemSolvingEvidences = evidences.filter(
      (e) => e.type === "AI_ML" || e.type === "API" || e.type === "ARCHITECTURE"
    );
    const problemSolving = Math.min(
      Math.round(problemSolvingEvidences.length * 22 + 40),
      95
    );

    // 7. Consistency (5% Weight)
    // Evaluates activity across multiple repos
    const consistency = Math.min(Math.round(repoCount * 8 + 45), 95);

    const dimensions: CareerDNAScoreDimensions = {
      technicalDepth,
      technicalBreadth,
      projectComplexity,
      engineeringQuality,
      problemSolving,
      projectCompleteness,
      consistency,
    };

    // Calculate Overall Deterministic Score
    const overallScore = Math.round(
      dimensions.technicalDepth * SCORING_WEIGHTS.technicalDepth +
        dimensions.technicalBreadth * SCORING_WEIGHTS.technicalBreadth +
        dimensions.projectComplexity * SCORING_WEIGHTS.projectComplexity +
        dimensions.engineeringQuality * SCORING_WEIGHTS.engineeringQuality +
        dimensions.problemSolving * SCORING_WEIGHTS.problemSolving +
        dimensions.projectCompleteness * SCORING_WEIGHTS.projectCompleteness +
        dimensions.consistency * SCORING_WEIGHTS.consistency
    );

    // Calculate Analysis Confidence Score (0 - 100%)
    // Based on quantity, quality, and source diversity of extracted evidence
    const evidenceVolume = evidences.length;
    const confidenceBase = Math.min(evidenceVolume * 6, 60);
    const sourceTypes = new Set(evidences.map((e) => e.source)).size;
    const sourceDiversityBonus = sourceTypes * 10;
    const analysisConfidence = Math.min(
      Math.round(confidenceBase + sourceDiversityBonus + (repoCount > 0 ? 15 : 0)),
      95
    );

    return {
      overallScore,
      analysisConfidence,
      dimensions,
      scoringWeights: SCORING_WEIGHTS,
      scoringVersion: "1.0",
      analysisVersion: "1.0",
    };
  }
}
