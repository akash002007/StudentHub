import {
  getHuggingFaceConnection,
  saveHuggingFaceConnection,
  saveHuggingFaceDNA,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { HuggingFaceEngine } from "@/lib/huggingface-engine";
import { CareerDNABuilder } from "@/lib/career-dna";

/**
 * Non-blocking background worker for Hugging Face data synchronization & DNA extraction.
 */
export async function enqueueHuggingFaceSync(userId: string): Promise<void> {
  const conn = getHuggingFaceConnection(userId);
  if (!conn) {
    console.warn(`Hugging Face sync skipped: Connection record not found for user "${userId}".`);
    return;
  }

  const now = new Date().toISOString();

  // Set status to SYNCING
  conn.syncStatus = "SYNCING";
  conn.error = null;
  saveHuggingFaceConnection(conn);

  try {
    // 1. Fetch public Hugging Face repositories (Models, Datasets, Spaces)
    const rawData = await HuggingFaceEngine.fetchUserPublicData(conn.username);

    // 2. Analyze & compile Hugging Face DNA
    const hfDNA = HuggingFaceEngine.analyzeData(conn.username, rawData);

    // 3. Update connection record
    conn.modelsCount = hfDNA.modelsCount;
    conn.datasetsCount = hfDNA.datasetsCount;
    conn.spacesCount = hfDNA.spacesCount;
    conn.totalLikes = hfDNA.totalLikes;
    conn.syncStatus = "SYNCED";
    conn.lastSyncedAt = now;
    conn.error = null;

    saveHuggingFaceConnection(conn);
    saveHuggingFaceDNA(userId, hfDNA);

    // 4. Automatically recalculate Overall Career DNA
    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    console.log(`Hugging Face background sync COMPLETED for user ${userId} (@${conn.username}): ${hfDNA.modelsCount} models, ${hfDNA.datasetsCount} datasets, ${hfDNA.spacesCount} spaces.`);
  } catch (err: any) {
    console.error(`Hugging Face background sync FAILED for user ${userId}:`, err);
    conn.syncStatus = "FAILED";
    conn.error = err.message || "Failed to synchronize Hugging Face repositories.";
    saveHuggingFaceConnection(conn);
  }
}
