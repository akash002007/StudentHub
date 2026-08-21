import { NextRequest, NextResponse } from "next/server";
import { getGitHubConnection, getGitHubRepositories } from "@/lib/server-store";
import { isGitHubSyncRunning } from "@/lib/github-sync-worker";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const connection = getGitHubConnection(userId);
  if (!connection) {
    return NextResponse.json({
      connected: false,
      connection: null,
    });
  }

  const isRunning = isGitHubSyncRunning(userId);
  const repositories = getGitHubRepositories(userId);

  return NextResponse.json({
    connected: true,
    connection: {
      id: connection.id,
      userId: connection.userId,
      githubUserId: connection.githubUserId,
      githubUsername: connection.githubUsername,
      githubDisplayName: connection.githubDisplayName,
      githubAvatarUrl: connection.githubAvatarUrl,
      githubProfileUrl: connection.githubProfileUrl,
      syncStatus: isRunning ? "SYNCING" : connection.syncStatus || "CONNECTED",
      syncStartedAt: connection.syncStartedAt || null,
      syncCompletedAt: connection.syncCompletedAt || null,
      syncError: connection.syncError || null,
      repositoriesCount: repositories.length || connection.repositoriesCount || 0,
      projectsDetectedCount: connection.projectsDetectedCount || 0,
      skillsDetectedCount: connection.skillsDetectedCount || 0,
      connectedAt: connection.connectedAt,
      updatedAt: connection.updatedAt,
    },
  });
}
