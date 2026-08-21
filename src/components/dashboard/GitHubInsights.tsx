"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Github,
  Star,
  GitFork,
  Code2,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  Sparkles,
  AlertCircle,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface InsightsData {
  connected: boolean;
  profile: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileUrl: string;
  } | null;
  sync: {
    status: "CONNECTED" | "SYNCING" | "SYNCED" | "FAILED";
    syncStartedAt: string | null;
    syncCompletedAt: string | null;
    syncError: string | null;
    repositoriesCount: number;
    projectsDetectedCount: number;
    skillsDetectedCount: number;
  } | null;
  overview: {
    totalRepositories: number;
    totalLanguages: number;
    totalStars: number;
    totalForks: number;
  };
  languages: Array<{
    name: string;
    bytes: number;
    percentage: number;
    color: string;
  }>;
  repositories: Array<{
    id: string;
    githubRepositoryId: number;
    name: string;
    fullName: string;
    description: string | null;
    htmlUrl: string;
    language: string | null;
    topics: string[];
    starsCount: number;
    forksCount: number;
    isFork: boolean;
    pushedAt: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    date: string;
    type: string;
    featured?: boolean;
  }>;
  activity: {
    totalRepos: number;
    primaryLanguages: string[];
    topRepoName: string;
    totalStars: number;
    lastSyncAt: string;
  } | null;
}

interface GitHubInsightsProps {
  userId: string;
  onSyncClick?: () => void;
  isSyncingManual?: boolean;
}

export function GitHubInsights({ userId, onSyncClick, isSyncingManual }: GitHubInsightsProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch(`/api/integrations/github/insights?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json: InsightsData = await res.json();
        setData(json);
      }
    } catch {
      console.warn("Failed to fetch GitHub insights");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Poll when status is SYNCING
  useEffect(() => {
    if (!data?.sync || data.sync.status !== "SYNCING") return;
    const interval = setInterval(() => {
      fetchInsights();
    }, 3000);
    return () => clearInterval(interval);
  }, [data?.sync, fetchInsights]);

  if (isLoading) {
    return (
      <Card className="p-8 border-border/80 bg-card flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Loading GitHub insights &amp; repository data...</p>
      </Card>
    );
  }

  if (!data || !data.connected) {
    return null; // Render nothing if not connected
  }

  const { sync, overview, languages, repositories, projects, profile } = data;
  const isSyncing = sync?.status === "SYNCING" || isSyncingManual;
  const isFailed = sync?.status === "FAILED";
  const hasRepos = repositories.length > 0;

  return (
    <div className="space-y-6 pt-4 border-t border-border/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-10 h-10 rounded-full border border-border/80 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Github className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">GitHub Insights &amp; Analytics</h2>
              <Badge
                variant={isSyncing ? "purple" : isFailed ? "rose" : "emerald"}
                size="sm"
                className="font-semibold"
              >
                {isSyncing ? "Syncing..." : isFailed ? "Sync Failed" : "Synced"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Connected as <span className="font-semibold text-foreground">@{profile?.username}</span> •{" "}
              {sync?.syncCompletedAt
                ? `Last synced ${new Date(sync.syncCompletedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Initial sync pending"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSyncClick}
          disabled={isSyncing}
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync GitHub Data"}
        </Button>
      </div>

      {/* STATE 1: SYNCING BANNER */}
      {isSyncing && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-4 text-xs text-purple-600 dark:text-purple-300">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-purple-500 animate-spin shrink-0" />
            <div>
              <span className="font-bold text-foreground">Synchronizing GitHub Repositories...</span>
              <p className="text-muted-foreground mt-0.5">
                Fetching repositories, extracting topics, and building Skill Intelligence in background.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: FAILED BANNER */}
      {isFailed && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-xs text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold text-foreground">GitHub Sync Failed</span>
              <p className="text-muted-foreground mt-0.5">
                {sync?.syncError || "An error occurred while synchronizing your GitHub account."}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onSyncClick} className="text-xs shrink-0 border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            Retry Sync
          </Button>
        </div>
      )}

      {/* STATE 3: NO DATA / EMPTY STATE */}
      {!hasRepos && !isSyncing && (
        <Card className="p-8 border-border/80 bg-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">Your GitHub data hasn't been synchronized yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Click the sync button to fetch your public repositories, analyze code languages, and extract Project Intelligence for your candidate profile.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onSyncClick} className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync GitHub Data
          </Button>
        </Card>
      )}

      {/* STATE 4: FULL DATA DASHBOARD */}
      {hasRepos && (
        <>
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Repositories</span>
                <FolderGit2 className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{overview.totalRepositories}</p>
              <p className="text-[11px] text-muted-foreground">Synchronized repos</p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Languages</span>
                <Code2 className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{overview.totalLanguages}</p>
              <p className="text-[11px] text-muted-foreground">Detected stacks</p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Stars</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{overview.totalStars}</p>
              <p className="text-[11px] text-muted-foreground">Repository stars</p>
            </Card>

            <Card hoverEffect className="p-4 border-border/80 bg-card space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Forks</span>
                <GitFork className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{overview.totalForks}</p>
              <p className="text-[11px] text-muted-foreground">Community forks</p>
            </Card>
          </div>

          {/* Top Languages Section */}
          <Card hoverEffect className="p-6 border-border/80 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">Top Languages Breakdown</h3>
                <p className="text-xs text-muted-foreground">Calculated from repository language composition</p>
              </div>
              <Badge variant="secondary" size="sm">
                {languages.length} Languages
              </Badge>
            </div>

            {languages.length > 0 ? (
              <div className="space-y-4">
                {/* Multi-segmented Progress Bar */}
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                  {languages.map((lang) => (
                    <div
                      key={lang.name}
                      style={{
                        width: `${Math.max(lang.percentage, 2)}%`,
                        backgroundColor: lang.color,
                      }}
                      className="h-full transition-all duration-500"
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                {/* Language Legend Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40 border border-border/40">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lang.color }}
                        />
                        <span className="font-medium text-foreground truncate">{lang.name}</span>
                      </div>
                      <span className="font-bold text-muted-foreground shrink-0 ml-1">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No language data available yet.</p>
            )}
          </Card>

          {/* Project Intelligence Section */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Detected Projects (Project Intelligence)
                  </h3>
                  <p className="text-xs text-muted-foreground">Automated project extraction based on repository activity and topics</p>
                </div>
                <Badge variant="purple" size="sm">
                  {projects.length} Projects
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} hoverEffect className="p-5 border-border/80 bg-card flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">{project.title}</h4>
                        <Badge variant="secondary" size="sm" className="text-[10px] shrink-0 font-medium">
                          {project.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/40">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold border border-purple-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" /> {project.date}
                        </span>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            View on GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Synchronized Repositories Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-purple-500" /> Synchronized Repositories
                </h3>
                <p className="text-xs text-muted-foreground">Public repositories fetched from @{profile?.username}</p>
              </div>
              <Badge variant="secondary" size="sm">
                {repositories.length} Repositories
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <Card key={repo.id} hoverEffect className="p-5 border-border/80 bg-card flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-sm text-foreground hover:text-purple-500 hover:underline flex items-center gap-1.5 truncate"
                      >
                        <FolderGit2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{repo.name}</span>
                      </a>
                      {repo.isFork && (
                        <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                          Fork
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {repo.description || "No repository description provided."}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/40 text-xs">
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium border border-border/60"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="flex items-center gap-1 font-medium text-foreground text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-purple-500" /> {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px]">
                          <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.starsCount}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <GitFork className="w-3.5 h-3.5 text-emerald-500" /> {repo.forksCount}
                        </span>
                      </div>

                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
