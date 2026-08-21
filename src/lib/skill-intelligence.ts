import { GitHubRepository, SkillEvidence } from "@/types";

export class SkillIntelligenceEngine {
  /**
   * Normalizes technology names across repository languages and topics into standardized SkillEvidence records
   */
  static extractSkillEvidences(userId: string, repositories: GitHubRepository[]): SkillEvidence[] {
    const skillMap = new Map<string, { totalBytes: number; repoCount: number; sampleRepo: string }>();

    for (const repo of repositories) {
      // 1. Process repo languages map
      if (repo.languages) {
        for (const [lang, bytes] of Object.entries(repo.languages)) {
          const normalized = this.normalizeSkillName(lang);
          const existing = skillMap.get(normalized) || { totalBytes: 0, repoCount: 0, sampleRepo: repo.name };
          existing.totalBytes += bytes;
          existing.repoCount += 1;
          skillMap.set(normalized, existing);
        }
      } else if (repo.language) {
        const normalized = this.normalizeSkillName(repo.language);
        const existing = skillMap.get(normalized) || { totalBytes: 1000, repoCount: 0, sampleRepo: repo.name };
        existing.totalBytes += 1000;
        existing.repoCount += 1;
        skillMap.set(normalized, existing);
      }

      // 2. Process topics
      if (repo.topics) {
        for (const topic of repo.topics) {
          const normalized = this.normalizeSkillName(topic);
          if (normalized) {
            const existing = skillMap.get(normalized) || { totalBytes: 500, repoCount: 0, sampleRepo: repo.name };
            existing.totalBytes += 500;
            existing.repoCount += 1;
            skillMap.set(normalized, existing);
          }
        }
      }
    }

    const evidences: SkillEvidence[] = [];
    const now = new Date().toISOString();

    for (const [skill, stats] of Array.from(skillMap.entries())) {
      // Calculate confidence score (range 50 - 98 based on usage bytes and repository frequency)
      const baseConfidence = 50;
      const repoBonus = Math.min(stats.repoCount * 12, 35);
      const byteBonus = Math.min(Math.floor(Math.log10(stats.totalBytes + 1) * 3), 13);
      const confidence = Math.min(baseConfidence + repoBonus + byteBonus, 98);

      evidences.push({
        id: `sk_ev_${userId}_${skill.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        skill,
        confidence,
        source: "github",
        sourceId: `gh_repos_${userId}`,
        repoName: stats.sampleRepo,
        languageBytes: stats.totalBytes,
        detectedAt: now,
      });
    }

    // Sort by confidence descending
    return evidences.sort((a, b) => b.confidence - a.confidence);
  }

  private static normalizeSkillName(input: string): string {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    const dictionary: Record<string, string> = {
      ts: "TypeScript",
      typescript: "TypeScript",
      js: "JavaScript",
      javascript: "JavaScript",
      py: "Python",
      python: "Python",
      rb: "Ruby",
      ruby: "Ruby",
      go: "Go",
      golang: "Go",
      rs: "Rust",
      rust: "Rust",
      java: "Java",
      cpp: "C++",
      "c++": "C++",
      cs: "C#",
      csharp: "C#",
      php: "PHP",
      html: "HTML5",
      html5: "HTML5",
      css: "CSS3",
      css3: "CSS3",
      scss: "Sass",
      sass: "Sass",
      sql: "SQL",
      postgres: "PostgreSQL",
      postgresql: "PostgreSQL",
      mysql: "MySQL",
      mongodb: "MongoDB",
      react: "React",
      reactjs: "React",
      next: "Next.js",
      nextjs: "Next.js",
      vue: "Vue.js",
      vuejs: "Vue.js",
      node: "Node.js",
      nodejs: "Node.js",
      express: "Express.js",
      expressjs: "Express.js",
      tailwind: "TailwindCSS",
      tailwindcss: "TailwindCSS",
      docker: "Docker",
      kubernetes: "Kubernetes",
      k8s: "Kubernetes",
      aws: "AWS",
      gcp: "Google Cloud",
    };

    if (dictionary[lower]) return dictionary[lower];
    // Capitalize generic skill names
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
}
