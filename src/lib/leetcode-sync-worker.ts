import {
  getLeetCodeConnection,
  saveLeetCodeConnection,
  saveLeetCodeDNA,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { LeetCodeEngine } from "@/lib/leetcode-engine";
import { CareerDNABuilder } from "@/lib/career-dna";
import { LeetCodeConnection } from "@/types";

/**
 * Synchronizes a user's verified LeetCode profile:
 * 1. Fetches public LeetCode profile & contest stats via official GraphQL
 * 2. Runs LeetCode Intelligence Engine (problem solve counts, difficulty distribution, contest rating)
 * 3. Saves LeetCodeConnection & LeetCodeDNA
 * 4. Recalculates Overall Career DNA
 *
 * CRITICAL RULE: In case of API failure, previous valid statistics are PRESERVED and never replaced by zeros.
 */
export async function syncLeetCodeAccount(
  userId: string,
  leetcodeId: string
): Promise<LeetCodeConnection> {
  const normalizedId = LeetCodeEngine.normalizeLeetCodeId(leetcodeId);

  let conn = getLeetCodeConnection(userId);
  const now = new Date().toISOString();

  if (!conn) {
    conn = {
      id: `lc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      leetcodeId: normalizedId,
      ranking: 0,
      totalProblemsSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      contestRating: 0,
      contestRank: "Unrated",
      contestsCount: 0,
      avatar: "",
      status: "VERIFIED",
      syncStatus: "SYNCING",
      verificationToken: null,
      verificationExpiresAt: null,
      verifiedAt: now,
      lastSyncedAt: null,
      connectedAt: now,
      error: null,
    };
  } else {
    conn.leetcodeId = normalizedId;
    conn.syncStatus = "SYNCING";
    conn.error = null;
  }

  saveLeetCodeConnection(userId, conn);

  try {
    // 1. Fetch live data from public LeetCode GraphQL API
    const rawData = await LeetCodeEngine.fetchUserProfile(normalizedId, true);

    // 2. LeetCode Intelligence Analysis
    const { connectionData, dna } = LeetCodeEngine.analyzeData(normalizedId, rawData);

    // 3. Save Connection & LeetCode DNA
    const updatedConn: LeetCodeConnection = {
      ...conn,
      ...connectionData,
      status: "VERIFIED",
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
      error: null,
    };

    saveLeetCodeConnection(userId, updatedConn);
    saveLeetCodeDNA(userId, dna);

    // 4. Automatically recalculate Overall Career DNA
    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    console.log(
      `[LeetCode Sync] COMPLETED for user ${userId}, leetcodeId @${normalizedId}, solved ${updatedConn.totalProblemsSolved}`
    );
    return updatedConn;
  } catch (err: any) {
    console.error(`[LeetCode Sync] FAILED for user ${userId}, leetcodeId @${normalizedId}:`, err);

    if (conn) {
      conn.syncStatus = "FAILED";
      conn.error = err.message || "Failed to fetch or process LeetCode data. Please try again.";
      saveLeetCodeConnection(userId, conn);
      return conn;
    }

    throw err;
  }
}
