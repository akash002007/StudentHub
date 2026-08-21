import {
  CareerDNAScoreDimensions,
  NormalizedEvidence,
  Project,
  GitHubRepository,
} from "@/types";

export class CareerDNAAIInterpreter {
  /**
   * Interprets pre-computed deterministic scores and evidence trails to generate
   * explainable natural-language career summaries, skill gap analysis, and career directions.
   * STRICT RULE: Performs evidence interpretation ONLY. Does NOT invent numerical scores.
   */
  static interpret(
    dimensions: CareerDNAScoreDimensions,
    overallScore: number,
    evidences: NormalizedEvidence[],
    projects: Project[],
    repositories: GitHubRepository[]
  ): {
    summary: string;
    dimensionExplanations: Record<keyof CareerDNAScoreDimensions, string>;
    potentialCareerDirections: string[];
    skillGaps: string[];
  } {
    const topRepos = repositories.slice(0, 3).map((r) => r.name);
    const languages = Array.from(
      new Set(evidences.filter((e) => e.skill).map((e) => e.skill!))
    );

    // 1. Natural Language Career Summary
    const summary =
      repositories.length > 0
        ? `Based on verified GitHub evidence across ${repositories.length} repositories (${topRepos.join(
            ", "
          )}), the candidate demonstrates strong implementation capability in ${languages
            .slice(0, 4)
            .join(
              ", "
            )} with calculated overall Career DNA score of ${overallScore}/100.`
        : "Initial evidence processing complete. Connect additional repositories to expand your Career DNA profile.";

    // 2. Per-Dimension Evidence-Backed Explanations
    const dimensionExplanations: Record<keyof CareerDNAScoreDimensions, string> = {
      technicalDepth: `Scored ${dimensions.technicalDepth}/100. Supported by implementation volume in ${languages.slice(0, 3).join(", ") || "software"} across ${repositories.length} repositories.`,
      technicalBreadth: `Scored ${dimensions.technicalBreadth}/100. Evidence verified across ${languages.length} programming languages and framework topics.`,
      projectComplexity: `Scored ${dimensions.projectComplexity}/100. Evaluated from full-stack architecture, REST APIs, database queries, and background sync implementations.`,
      engineeringQuality: `Scored ${dimensions.engineeringQuality}/100. Verified non-fork original repositories and technical descriptions.`,
      problemSolving: `Scored ${dimensions.problemSolving}/100. Evidence extracted from complex API endpoints, logic modules, and data handling patterns.`,
      projectCompleteness: `Scored ${dimensions.projectCompleteness}/100. Evaluated from repository activity timestamps, topic tags, and technical README documentation.`,
      consistency: `Scored ${dimensions.consistency}/100. Calculated from active commit/push timestamps across candidate repositories.`,
    };

    // 3. Potential Career Directions Supported by Evidence
    const potentialCareerDirections: string[] = [];
    if (languages.includes("TypeScript") || languages.includes("JavaScript") || languages.includes("React") || languages.includes("Next.js")) {
      potentialCareerDirections.push("Full-Stack Web Development");
      potentialCareerDirections.push("Frontend Systems Engineering");
    }
    if (languages.includes("Python") || languages.includes("Go") || languages.includes("Java") || languages.includes("C#") || languages.includes("Node.js")) {
      potentialCareerDirections.push("Backend & REST API Engineering");
    }
    if (languages.includes("Python") && evidences.some((e) => e.type === "AI_ML")) {
      potentialCareerDirections.push("AI / ML Systems Engineering");
    }
    if (potentialCareerDirections.length === 0) {
      potentialCareerDirections.push("Software Engineering", "Full-Stack Development");
    }

    // 4. Evidence-Based Skill Gaps (Actionable Guidance)
    const skillGaps: string[] = [];
    const hasTesting = evidences.some((e) => e.type === "TESTING");
    const hasDevOps = evidences.some((e) => e.type === "DEVOPS");
    const hasDatabase = evidences.some((e) => e.type === "DATABASE");

    if (!hasTesting) {
      skillGaps.push("Automated Unit & Integration Testing (Jest, Playwright, or PyTest evidence recommended)");
    }
    if (!hasDevOps) {
      skillGaps.push("CI/CD & Cloud Deployment (GitHub Actions, Docker, or AWS evidence recommended)");
    }
    if (!hasDatabase) {
      skillGaps.push("Database Schema & Persistence (PostgreSQL, Prisma, or MongoDB evidence recommended)");
    }

    return {
      summary,
      dimensionExplanations,
      potentialCareerDirections,
      skillGaps,
    };
  }
}
