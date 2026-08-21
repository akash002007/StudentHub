import { getGitHubConnection, updateGitHubSyncStatus, saveGitHubRepositories } from "@/lib/server-store";
import { GitHubAPIClient } from "@/lib/github-api-client";
import { ProjectIntelligenceEngine } from "@/lib/project-intelligence";
import { SkillIntelligenceEngine } from "@/lib/skill-intelligence";
import { CareerDNABuilder } from "@/lib/career-dna";

const activeSyncsSet = new Set<string>();

/**
 * Checks if a background GitHub sync job is currently running for a user
 */
export function isGitHubSyncRunning(userId: string): boolean {
  return activeSyncsSet.has(userId);
}

/**
 * Enqueues a non-blocking background GitHub synchronization job for a student
 */
export function enqueueGitHubSync(userId: string): void {
  if (activeSyncsSet.has(userId)) {
    console.log(`[GitHubSyncWorker] Sync job already in progress for user ${userId}.`);
    return;
  }

  activeSyncsSet.add(userId);
  const now = new Date().toISOString();

  // Mark connection status as SYNCING immediately
  updateGitHubSyncStatus(userId, "SYNCING", {
    syncStartedAt: now,
    syncError: null,
  });

  // Execute job asynchronously in background (non-blocking for HTTP response)
  setTimeout(async () => {
    try {
      console.log(`[GitHubSyncWorker] Starting GitHub background sync for user ${userId}...`);
      const connection = getGitHubConnection(userId);
      if (!connection || !connection.accessTokenEncrypted) {
        throw new Error("INVALID_TOKEN: No GitHub access token found for user.");
      }

      // 1. Fetch & normalize GitHub repositories
      const apiClient = new GitHubAPIClient(connection.accessTokenEncrypted);
      const repositories = await apiClient.fetchAndNormalizeAll(userId);
      saveGitHubRepositories(userId, repositories);

      // 2. Project Intelligence Extraction
      const projects = ProjectIntelligenceEngine.extractProjects(repositories);

      // 3. Skill Intelligence Extraction
      const skillEvidences = SkillIntelligenceEngine.extractSkillEvidences(userId, repositories);

      // 4. Career DNA Synthesis
      CareerDNABuilder.compileCareerDNA(userId, projects, skillEvidences, repositories);

      // 5. Update Connection Sync Metadata
      const completedAt = new Date().toISOString();
      updateGitHubSyncStatus(userId, "SYNCED", {
        syncCompletedAt: completedAt,
        repositoriesCount: repositories.length,
        projectsDetectedCount: projects.length,
        skillsDetectedCount: skillEvidences.length,
        syncError: null,
      });

      console.log(
        `[GitHubSyncWorker] Sync completed for ${userId}: ${repositories.length} repos, ${projects.length} projects, ${skillEvidences.length} skills.`
      );
    } catch (error: any) {
      console.error(`[GitHubSyncWorker] Sync failed for user ${userId}:`, error?.message || error);
      const errorMessage = error?.message?.includes("INVALID_TOKEN")
        ? "GitHub authorization token is invalid or expired. Please reconnect GitHub."
        : error?.message || "Failed to synchronize GitHub data.";

      updateGitHubSyncStatus(userId, "FAILED", {
        syncError: errorMessage,
      });
    } finally {
      activeSyncsSet.delete(userId);
    }
  }, 10);
}
