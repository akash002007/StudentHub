import {
  getCodeforcesConnection,
  saveCodeforcesConnection,
  saveCodeforcesDNA,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CodeforcesEngine } from "@/lib/codeforces-engine";
import { CareerDNABuilder } from "@/lib/career-dna";
import { CodeforcesConnection } from "@/types";

/**
 * Non-blocking background worker for Codeforces integration:
 * 1. Calls official Codeforces Public API (user.info, user.rating, user.status)
 * 2. Runs Codeforces Intelligence Engine (deduplication, difficulty brackets, tag frequency, rating trend)
 * 3. Saves CodeforcesConnection & CodeforcesDNA
 * 4. Recalculates Overall Career DNA
 */
export async function syncCodeforcesAccount(
  userId: string,
  handle: string
): Promise<CodeforcesConnection> {
  const normalizedHandle = CodeforcesEngine.normalizeHandle(handle);

  let conn = getCodeforcesConnection(userId);
  const now = new Date().toISOString();

  if (!conn) {
    conn = {
      id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      handle: normalizedHandle,
      rating: 0,
      maxRating: 0,
      rank: "unrated",
      maxRank: "unrated",
      avatar: "",
      contestsCount: 0,
      totalSubmissions: 0,
      solvedProblemsCount: 0,
      strongestTags: [],
      difficultyDistribution: {},
      languages: {},
      ratingTrend: "Stable",
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
    conn.handle = normalizedHandle;
    conn.syncStatus = "SYNCING";
    conn.error = null;
  }

  saveCodeforcesConnection(userId, conn);

  try {
    // 1. Fetch live data from official Codeforces Public API
    const userInfo = await CodeforcesEngine.fetchUserInfo(normalizedHandle);
    const ratings = await CodeforcesEngine.fetchUserRating(normalizedHandle);
    const submissions = await CodeforcesEngine.fetchUserStatus(normalizedHandle);

    // 2. Codeforces Intelligence Analysis
    const { connectionData, dna } = CodeforcesEngine.analyzeData(
      normalizedHandle,
      userInfo,
      ratings,
      submissions
    );

    // 3. Save Connection & Codeforces DNA
    const updatedConn: CodeforcesConnection = {
      ...conn,
      ...connectionData,
      status: "VERIFIED",
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
      error: null,
    };

    saveCodeforcesConnection(userId, updatedConn);
    saveCodeforcesDNA(userId, dna);

    // 4. Automatically recalculate Overall Career DNA
    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    console.log(`Codeforces sync COMPLETED for user ${userId}, handle @${normalizedHandle}, rating ${updatedConn.rating}`);
    return updatedConn;
  } catch (err: any) {
    console.error(`Codeforces sync FAILED for user ${userId}, handle @${normalizedHandle}:`, err);

    if (conn) {
      conn.syncStatus = "FAILED";
      conn.error = err.message || "Failed to fetch or process Codeforces data.";
      saveCodeforcesConnection(userId, conn);
      return conn;
    }

    throw err;
  }
}
