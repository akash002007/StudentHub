import { NextRequest, NextResponse } from "next/server";
import { getGitHubConnection, getGitHubRepositories, getCareerDNA } from "@/lib/server-store";
import { ProjectIntelligenceEngine } from "@/lib/project-intelligence";
import { isGitHubSyncRunning } from "@/lib/github-sync-worker";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  "C++": "#f34b7d",
  "C#": "#178600",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  HTML5: "#e34c26",
  CSS: "#563d7c",
  CSS3: "#563d7c",
  Sass: "#a57199",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  PowerShell: "#012456",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const connection = getGitHubConnection(userId);
  if (!connection) {
    return NextResponse.json({
      connected: false,
      profile: null,
      sync: null,
      overview: {
        totalRepositories: 0,
        totalLanguages: 0,
        totalStars: 0,
        totalForks: 0,
      },
      languages: [],
      repositories: [],
      projects: [],
      activity: null,
    });
  }

  const isRunning = isGitHubSyncRunning(userId);
  const rawRepos = getGitHubRepositories(userId);
  const careerDNA = getCareerDNA(userId);

  // 1. Overview Metrics Calculation
  let totalStars = 0;
  let totalForks = 0;
  const languageBytesMap: Record<string, number> = {};

  for (const repo of rawRepos) {
    totalStars += repo.starsCount || 0;
    totalForks += repo.forksCount || 0;

    if (repo.languages && Object.keys(repo.languages).length > 0) {
      for (const [lang, bytes] of Object.entries(repo.languages)) {
        languageBytesMap[lang] = (languageBytesMap[lang] || 0) + bytes;
      }
    } else if (repo.language) {
      languageBytesMap[repo.language] = (languageBytesMap[repo.language] || 0) + 1000;
    }
  }

  // 2. Top Languages Breakdown
  const totalLanguageBytes = Object.values(languageBytesMap).reduce((sum, b) => sum + b, 0);

  const languagesList = Object.entries(languageBytesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => {
      const percentage = totalLanguageBytes > 0 ? Math.round((bytes / totalLanguageBytes) * 100) : 0;
      return {
        name,
        bytes,
        percentage,
        color: LANGUAGE_COLORS[name] || "#8b5cf6", // Default purple fallback
      };
    });

  // 3. Extracted Projects (Project Intelligence)
  const projects = ProjectIntelligenceEngine.extractProjects(rawRepos);

  const syncStatus = isRunning ? "SYNCING" : connection.syncStatus || "CONNECTED";

  return NextResponse.json({
    connected: true,
    profile: {
      username: connection.githubUsername,
      displayName: connection.githubDisplayName,
      avatarUrl: connection.githubAvatarUrl,
      profileUrl: connection.githubProfileUrl,
    },
    sync: {
      status: syncStatus,
      syncStartedAt: connection.syncStartedAt || null,
      syncCompletedAt: connection.syncCompletedAt || null,
      syncError: connection.syncError || null,
      repositoriesCount: rawRepos.length,
      projectsDetectedCount: projects.length,
      skillsDetectedCount: careerDNA?.skillEvidences?.length || languagesList.length,
    },
    overview: {
      totalRepositories: rawRepos.length,
      totalLanguages: Object.keys(languageBytesMap).length,
      totalStars,
      totalForks,
    },
    languages: languagesList,
    repositories: rawRepos,
    projects,
    activity: careerDNA?.githubStats || {
      totalRepos: rawRepos.length,
      primaryLanguages: languagesList.slice(0, 5).map((l) => l.name),
      topRepoName: rawRepos[0] ? rawRepos[0].name : "N/A",
      totalStars,
      lastSyncAt: connection.syncCompletedAt || connection.connectedAt,
    },
  });
}
