import { decryptToken } from "@/lib/encryption";
import { GitHubRepository } from "@/types";

export interface GitHubRawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  private: boolean;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
  languages?: Record<string, number>;
  owner: {
    login: string;
  };
}

export class GitHubAPIClient {
  private accessToken: string;

  constructor(encryptedToken: string) {
    const decrypted = decryptToken(encryptedToken);
    if (!decrypted) {
      throw new Error("INVALID_TOKEN: Failed to decrypt GitHub OAuth access token.");
    }
    this.accessToken = decrypted;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "User-Agent": "StudentHub-SyncWorker/1.0",
      Accept: "application/vnd.github.v3+json",
    };
  }

  /**
   * Fetches authenticating user's repositories (up to 100 most recently updated)
   */
  async fetchRepositories(): Promise<GitHubRawRepo[]> {
    const response = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator",
      {
        headers: this.headers,
        next: { revalidate: 0 },
      }
    );

    if (response.status === 401) {
      throw new Error("INVALID_TOKEN: GitHub access token is invalid or revoked.");
    }

    if (response.status === 429 || response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new Error("RATE_LIMIT_EXCEEDED: GitHub API rate limit reached.");
      }
    }

    if (!response.ok) {
      throw new Error(`GITHUB_API_ERROR: HTTP ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRawRepo[] = await response.json();
    return repos;
  }

  /**
   * Fetches detailed breakdown of languages for a specific repository
   */
  async fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
        { headers: this.headers }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Return empty map on non-critical language fetch failure
    }
    return {};
  }

  /**
   * Fetches topics/tags for a specific repository
   */
  async fetchRepoTopics(owner: string, repo: string): Promise<string[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/topics`,
        {
          headers: {
            ...this.headers,
            Accept: "application/vnd.github.mercy-preview+json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.names || [];
      }
    } catch {
      // Return empty topics on non-critical topic fetch failure
    }
    return [];
  }

  /**
   * Normalizes raw GitHub API response objects into StudentHub GitHubRepository records
   */
  async fetchAndNormalizeAll(userId: string): Promise<GitHubRepository[]> {
    const rawRepos = await this.fetchRepositories();
    const normalizedRepos: GitHubRepository[] = [];

    // Filter top 15 most relevant repositories for language & topic details
    const topRepos = rawRepos.slice(0, 15);

    for (const raw of topRepos) {
      const owner = raw.owner.login;
      const repoName = raw.name;

      const [languages, topics] = await Promise.all([
        this.fetchRepoLanguages(owner, repoName),
        this.fetchRepoTopics(owner, repoName),
      ]);

      const record: GitHubRepository = {
        id: `gh_repo_${raw.id}`,
        githubRepositoryId: raw.id,
        userId,
        name: raw.name,
        fullName: raw.full_name,
        description: raw.description,
        htmlUrl: raw.html_url,
        language: raw.language,
        languages: Object.keys(languages).length > 0 ? languages : raw.language ? { [raw.language]: 1000 } : {},
        topics: Array.from(new Set([...(raw.topics || []), ...topics])),
        starsCount: raw.stargazers_count,
        forksCount: raw.forks_count,
        isFork: raw.fork,
        isPrivate: raw.private,
        defaultBranch: raw.default_branch || "main",
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        pushedAt: raw.pushed_at,
      };

      normalizedRepos.push(record);
    }

    return normalizedRepos;
  }
}
