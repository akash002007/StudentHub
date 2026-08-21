import { NextRequest, NextResponse } from "next/server";
import { getGitHubConnection, getCareerDNA, getGitHubRepositories } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const connection = getGitHubConnection(userId);
  const dna = getCareerDNA(userId);
  const repos = getGitHubRepositories(userId);

  // 1. GitHub Not Connected State
  if (!connection) {
    return NextResponse.json({
      connected: false,
      exists: false,
      message: "GitHub account is not connected.",
    });
  }

  // 2. Connected but Career DNA not generated yet
  if (!dna) {
    return NextResponse.json({
      connected: true,
      exists: false,
      message: "GitHub data synchronized, Career DNA generation pending.",
      lastSyncAt: connection.syncCompletedAt || connection.connectedAt,
    });
  }

  // 3. Compute Score Label
  const score = dna.overallScore;
  let scoreLabel = "Developing";
  if (score >= 90) scoreLabel = "Exceptional";
  else if (score >= 80) scoreLabel = "Strong";
  else if (score >= 70) scoreLabel = "Good";
  else if (score >= 60) scoreLabel = "Developing";
  else scoreLabel = "Needs Improvement";

  // 4. Compute Trend if history exists
  let trendStr: string | null = null;
  if (dna.history && dna.history.length >= 2) {
    const latest = dna.history[dna.history.length - 1].overallScore;
    const prev = dna.history[dna.history.length - 2].overallScore;
    const diff = latest - prev;
    if (diff > 0) trendStr = `+${diff} this month`;
    else if (diff < 0) trendStr = `${diff} this month`;
  }

  // 5. Stale Data Check
  const isStale =
    Boolean(connection.syncCompletedAt) &&
    Boolean(dna.updatedAt) &&
    new Date(connection.syncCompletedAt!).getTime() > new Date(dna.updatedAt).getTime() + 1000;

  // 6. Map Evidence Items (Top 2-3)
  const evidenceItems = (dna.evidences || []).slice(0, 3).map((ev) => ({
    projectName: ev.repositoryName,
    skills: ev.skill ? [ev.skill] : ["Full Stack"],
    description: ev.reason,
    repositoryUrl: `https://github.com/${connection.githubUsername}/${ev.repositoryName}`,
  }));

  // Fallback to featuredProjects if evidences are sparse
  if (evidenceItems.length === 0 && dna.featuredProjects) {
    dna.featuredProjects.slice(0, 3).forEach((p) => {
      evidenceItems.push({
        projectName: p.title,
        skills: p.technologies.slice(0, 3),
        description: p.description,
        repositoryUrl: p.githubUrl || `https://github.com/${connection.githubUsername}`,
      });
    });
  }

  // 7. Map Recommendations / Next Best Actions (Top 2-3)
  const recommendations = (dna.skillGaps || []).slice(0, 3).map((gap, idx) => ({
    id: `rec_${idx}`,
    title: gap.split("(")[0].trim(),
    description: gap,
    priority: idx === 0 ? ("high" as const) : idx === 1 ? ("medium" as const) : ("low" as const),
  }));

  const primaryStrength =
    (dna.potentialCareerDirections && dna.potentialCareerDirections[0]) ||
    (dna.topSkills && dna.topSkills[0] ? `${dna.topSkills[0].name} Engineering` : "Software Development");

  return NextResponse.json({
    connected: true,
    exists: true,
    score: dna.overallScore,
    scoreLabel,
    analysisConfidence: dna.analysisConfidence || 85,
    trend: trendStr,
    projectsAnalyzed: repos.length || dna.githubStats?.totalRepos || 0,
    primaryStrength,
    topSkills: (dna.topSkills || []).slice(0, 4).map((s) => s.name),
    assessment: dna.summary,
    evidence: evidenceItems,
    recommendations,
    isStale,
    lastAnalyzedAt: dna.updatedAt,
  });
}
