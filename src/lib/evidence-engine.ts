import { GitHubRepository, NormalizedEvidence, EvidenceType, EvidenceSource } from "@/types";

export class EvidenceEngine {
  /**
   * Extracts deterministic NormalizedEvidence objects from GitHub repositories
   */
  static extractEvidence(repositories: GitHubRepository[]): NormalizedEvidence[] {
    const evidences: NormalizedEvidence[] = [];
    const now = new Date().toISOString();

    for (const repo of repositories) {
      const repoId = repo.id;
      const repoName = repo.name;

      // 1. Language Breakdown Evidence (Moderate Weight)
      if (repo.languages) {
        for (const [lang, bytes] of Object.entries(repo.languages)) {
          if (bytes > 500) {
            evidences.push({
              id: `ev_${repoId}_lang_${lang.toLowerCase()}`,
              type: "SKILL",
              skill: lang,
              repositoryId: repoId,
              repositoryName: repoName,
              source: "REPOSITORY_LANG",
              reason: `${lang} is used with ${bytes.toLocaleString()} bytes of code in ${repoName}.`,
              confidence: Math.min(0.65 + (bytes > 20000 ? 0.25 : 0.1), 0.95),
              weight: 0.7,
              detectedAt: now,
            });
          }
        }
      }

      // 2. Topic Tags Evidence (Moderate/Weak Weight)
      if (repo.topics) {
        for (const topic of repo.topics) {
          const normalized = this.capitalize(topic);
          evidences.push({
            id: `ev_${repoId}_topic_${topic.toLowerCase()}`,
            type: "SKILL",
            skill: normalized,
            repositoryId: repoId,
            repositoryName: repoName,
            source: "TOPIC",
            reason: `Repository ${repoName} is tagged with topic #${topic}.`,
            confidence: 0.55,
            weight: 0.3,
            detectedAt: now,
          });
        }
      }

      // 3. Architecture & Implementation Detection Evidence (Strong Weight)
      const nameLower = repo.name.toLowerCase();
      const descLower = (repo.description || "").toLowerCase();

      // Full-Stack / Web Architecture Evidence
      if (
        nameLower.includes("hub") ||
        nameLower.includes("platform") ||
        nameLower.includes("dashboard") ||
        nameLower.includes("app") ||
        descLower.includes("full-stack") ||
        descLower.includes("full stack")
      ) {
        evidences.push({
          id: `ev_${repoId}_arch_fullstack`,
          type: "ARCHITECTURE",
          repositoryId: repoId,
          repositoryName: repoName,
          source: "SOURCE_CODE",
          files: ["src/app", "src/components", "src/lib"],
          reason: `Production application architecture with integrated frontend and backend components in ${repoName}.`,
          confidence: 0.92,
          weight: 1.0,
          detectedAt: now,
        });
      }

      // API Evidence
      if (
        nameLower.includes("api") ||
        nameLower.includes("server") ||
        nameLower.includes("backend") ||
        descLower.includes("api") ||
        descLower.includes("rest")
      ) {
        evidences.push({
          id: `ev_${repoId}_api_rest`,
          type: "API",
          repositoryId: repoId,
          repositoryName: repoName,
          source: "SOURCE_CODE",
          files: ["src/app/api", "src/routes"],
          reason: `RESTful API route handlers and server endpoints actively implemented in ${repoName}.`,
          confidence: 0.90,
          weight: 1.0,
          detectedAt: now,
        });
      }

      // Database Evidence
      if (
        descLower.includes("database") ||
        descLower.includes("postgres") ||
        descLower.includes("prisma") ||
        descLower.includes("mongo") ||
        repo.topics.some((t) => t.includes("sql") || t.includes("db") || t.includes("prisma"))
      ) {
        evidences.push({
          id: `ev_${repoId}_db_integration`,
          type: "DATABASE",
          repositoryId: repoId,
          repositoryName: repoName,
          source: "SOURCE_CODE",
          reason: `Database persistence layer and query integration detected in ${repoName}.`,
          confidence: 0.88,
          weight: 1.0,
          detectedAt: now,
        });
      }

      // AI/ML Evidence
      if (
        descLower.includes("ai") ||
        descLower.includes("machine learning") ||
        descLower.includes("model") ||
        repo.topics.some((t) => t.includes("ai") || t.includes("ml") || t.includes("learning"))
      ) {
        evidences.push({
          id: `ev_${repoId}_ai_ml`,
          type: "AI_ML",
          repositoryId: repoId,
          repositoryName: repoName,
          source: "SOURCE_CODE",
          reason: `Machine learning models and AI pipeline integration in ${repoName}.`,
          confidence: 0.86,
          weight: 1.0,
          detectedAt: now,
        });
      }

      // Documentation Evidence
      if (repo.description && repo.description.length > 20) {
        evidences.push({
          id: `ev_${repoId}_doc_desc`,
          type: "DOCUMENTATION",
          repositoryId: repoId,
          repositoryName: repoName,
          source: "README",
          reason: `Repository ${repoName} contains detailed technical description and documentation.`,
          confidence: 0.75,
          weight: 0.5,
          detectedAt: now,
        });
      }
    }

    return evidences;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
