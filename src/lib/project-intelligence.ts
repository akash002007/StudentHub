import { GitHubRepository, Project, ProjectType } from "@/types";

export class ProjectIntelligenceEngine {
  /**
   * Filters and transforms raw GitHub repositories into structured StudentHub Projects
   */
  static extractProjects(repositories: GitHubRepository[]): Project[] {
    // 1. Filter relevant repositories (exclude non-featured forks without stars)
    const relevantRepos = repositories.filter((repo) => {
      if (repo.isFork && repo.starsCount === 0) return false;
      return true;
    });

    const projects: Project[] = [];

    for (const repo of relevantRepos) {
      const technologies = Array.from(
        new Set([
          ...(repo.language ? [repo.language] : []),
          ...Object.keys(repo.languages || {}),
          ...(repo.topics || []).map((t) => this.capitalizeTopic(t)),
        ])
      );

      // Determine Project Type
      let type: ProjectType = "Personal";
      if (repo.isFork) {
        type = "Open Source";
      } else if (repo.topics.some((t) => t.includes("hackathon"))) {
        type = "Hackathon";
      } else if (repo.topics.some((t) => t.includes("academic") || t.includes("course"))) {
        type = "Academic Project";
      } else if (repo.topics.some((t) => t.includes("capstone"))) {
        type = "Capstone";
      }

      // Determine date string from pushedAt or updatedAt
      const repoDate = repo.pushedAt || repo.updatedAt || repo.createdAt;
      const formattedDate = repoDate ? new Date(repoDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent";

      // Formatted Title
      const formattedTitle = this.formatRepoTitle(repo.name);

      // Description fallback
      const description =
        repo.description ||
        `Open source repository created with ${technologies.slice(0, 3).join(", ") || "software engineering best practices"}.`;

      const project: Project = {
        id: `project_gh_${repo.githubRepositoryId}`,
        title: formattedTitle,
        description,
        technologies: technologies.length > 0 ? technologies : ["Software Development"],
        githubUrl: repo.htmlUrl,
        date: formattedDate,
        type,
        featured: repo.starsCount > 0 || !repo.isFork,
      };

      projects.push(project);
    }

    // Sort by featured status and star count
    return projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  private static formatRepoTitle(repoName: string): string {
    return repoName
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private static capitalizeTopic(topic: string): string {
    const knownMap: Record<string, string> = {
      react: "React",
      reactjs: "React",
      typescript: "TypeScript",
      javascript: "JavaScript",
      nextjs: "Next.js",
      nodejs: "Node.js",
      express: "Express.js",
      tailwindcss: "TailwindCSS",
      python: "Python",
      django: "Django",
      flask: "Flask",
      fastapi: "FastAPI",
      docker: "Docker",
      kubernetes: "Kubernetes",
      mongodb: "MongoDB",
      postgresql: "PostgreSQL",
      graphql: "GraphQL",
    };

    const lower = topic.toLowerCase();
    if (knownMap[lower]) return knownMap[lower];
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }
}
