import { LeetCodeConnection, LeetCodeDNA } from "@/types";

export type LeetCodeApiErrorKind = "NOT_FOUND" | "TIMEOUT" | "UNAVAILABLE" | "GRAPHQL_ERROR";

export class LeetCodeApiError extends Error {
  constructor(public readonly kind: LeetCodeApiErrorKind, message: string) {
    super(message);
    this.name = "LeetCodeApiError";
  }
}

export class LeetCodeEngine {
  /**
   * Normalizes raw user input or pasted profile URL into a clean LeetCode ID.
   */
  static normalizeLeetCodeId(input: string): string {
    if (!input || typeof input !== "string") return "";
    let trimmed = input.trim();

    // Handle full URL forms: https://leetcode.com/u/username or https://leetcode.com/username
    if (trimmed.includes("leetcode.com")) {
      const match = trimmed.match(/leetcode\.com\/(?:u\/)?([A-Za-z0-9_.-]+)/i);
      if (match && match[1]) {
        trimmed = match[1];
      }
    }

    return trimmed.replace(/^@/, "").replace(/\/+$/, "").trim();
  }

  /**
   * Fetches public LeetCode user profile and contest statistics via official GraphQL endpoint.
   * @param leetcodeId LeetCode username / ID
   * @param bypassCache Set true for ownership verification or manual sync to bypass Next.js cache
   */
  static async fetchUserProfile(leetcodeId: string, bypassCache = false): Promise<any> {
    const normalizedId = this.normalizeLeetCodeId(leetcodeId);
    if (!normalizedId) {
      throw new LeetCodeApiError("NOT_FOUND", "Please provide a valid LeetCode ID.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const query = `
      query getUserProfileAndContest($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            aboutMe
            userAvatar
            ranking
            reputation
            countryName
          }
          submitStatsGlobal: submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
      }
    `;

    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { username: normalizedId },
      }),
      signal: controller.signal,
      ...(bypassCache ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
    };

    try {
      const res = await fetch("https://leetcode.com/graphql", fetchOptions);

      if (!res.ok) {
        throw new LeetCodeApiError(
          "UNAVAILABLE",
          "Unable to reach LeetCode right now. Please try again in a moment."
        );
      }

      const json = await res.json();

      if (json.errors && (!json.data || !json.data.matchedUser)) {
        const firstError = json.errors[0]?.message || "";
        if (firstError.toLowerCase().includes("not exist") || firstError.toLowerCase().includes("not found")) {
          throw new LeetCodeApiError("NOT_FOUND", `LeetCode account "${normalizedId}" not found. Please check your LeetCode ID.`);
        }
        throw new LeetCodeApiError("GRAPHQL_ERROR", firstError || "LeetCode API returned an error.");
      }

      if (!json.data || !json.data.matchedUser) {
        throw new LeetCodeApiError(
          "NOT_FOUND",
          `LeetCode account "${normalizedId}" not found. Please check your LeetCode ID.`
        );
      }

      return json.data;
    } catch (error) {
      if (error instanceof LeetCodeApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new LeetCodeApiError("TIMEOUT", "LeetCode is taking too long to respond. Please try again.");
      }
      throw new LeetCodeApiError(
        "UNAVAILABLE",
        "Unable to reach LeetCode right now. Please try again in a moment."
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Analyzes raw LeetCode GraphQL data and produces normalized connection data and LeetCodeDNA.
   */
  static analyzeData(
    leetcodeId: string,
    rawData: any
  ): { connectionData: Partial<LeetCodeConnection>; dna: LeetCodeDNA } {
    const matchedUser = rawData.matchedUser || {};
    const profile = matchedUser.profile || {};
    const submitStats = matchedUser.submitStatsGlobal || matchedUser.submitStats || {};
    const acList: Array<{ difficulty: string; count: number; submissions?: number }> =
      submitStats.acSubmissionNum || [];

    const totalProblemsSolved = acList.find((x) => x.difficulty === "All")?.count ?? 0;
    const easySolved = acList.find((x) => x.difficulty === "Easy")?.count ?? 0;
    const mediumSolved = acList.find((x) => x.difficulty === "Medium")?.count ?? 0;
    const hardSolved = acList.find((x) => x.difficulty === "Hard")?.count ?? 0;

    const ranking = profile.ranking || 0;
    const avatar = profile.userAvatar || "";

    const contestData = rawData.userContestRanking || {};
    const contestRating = Math.round(contestData.rating || 0);
    const contestsCount = contestData.attendedContestsCount || 0;
    const globalRanking = contestData.globalRanking || 0;
    const topPercentage = contestData.topPercentage ? Math.round(contestData.topPercentage * 10) / 10 : 0;
    const contestRank =
      contestData.badge?.name ||
      (contestRating >= 2200
        ? "Guardian"
        : contestRating >= 1800
        ? "Knight"
        : contestRating > 0
        ? "Contestant"
        : "Unrated");

    // 1. Calculate Deterministic LeetCode DNA Score (0 - 100)
    // Solved problems volume (max 35 pts)
    const solvedPts = Math.min(Math.round(totalProblemsSolved / 8), 35);
    // Medium & Hard problem depth (max 35 pts)
    const depthPts = Math.min(Math.round(mediumSolved * 0.3 + hardSolved * 1.2), 35);
    // Contest rating (max 20 pts)
    const contestPts = contestRating > 0 ? Math.min(Math.round(contestRating / 100), 20) : 0;
    // Activity & contest count (max 10 pts)
    const participationPts = Math.min(contestsCount * 2, 10);

    const rawScore = solvedPts + depthPts + contestPts + participationPts;
    const finalScore = Math.min(Math.max(rawScore, 50), 98);

    // 2. Generate Evidence Items for Career DNA
    const evidence: Array<{
      id: string;
      entity: string;
      skill: string;
      text: string;
      confidence: number;
      source: "LeetCode";
    }> = [];

    let evId = 1;

    if (totalProblemsSolved > 0) {
      evidence.push({
        id: `lc_ev_${evId++}`,
        entity: `LeetCode @${leetcodeId}`,
        skill: "Data Structures & Algorithms",
        text: `Solved ${totalProblemsSolved} verified problems on LeetCode (${easySolved} Easy, ${mediumSolved} Medium, ${hardSolved} Hard).`,
        confidence: 96,
        source: "LeetCode",
      });
    }

    if (mediumSolved + hardSolved >= 10) {
      evidence.push({
        id: `lc_ev_${evId++}`,
        entity: `LeetCode @${leetcodeId}`,
        skill: "Complex Problem Solving",
        text: `Completed ${mediumSolved + hardSolved} Medium and Hard algorithmic challenges on LeetCode.`,
        confidence: 93,
        source: "LeetCode",
      });
    }

    if (contestRating > 0) {
      evidence.push({
        id: `lc_ev_${evId++}`,
        entity: `LeetCode @${leetcodeId}`,
        skill: "Competitive Programming",
        text: `Attained a LeetCode contest rating of ${contestRating} (${contestRank}) across ${contestsCount} rated contests.`,
        confidence: 95,
        source: "LeetCode",
      });
    }

    const strengths = [
      `Solved ${totalProblemsSolved} algorithmic problems (${mediumSolved} Medium, ${hardSolved} Hard).`,
      ranking > 0 ? `Global LeetCode user ranking #${ranking.toLocaleString()}.` : "Active problem-solving progression.",
      contestRating > 0
        ? `Contest rating of ${contestRating} (${contestRank}) across ${contestsCount} rated contests.`
        : "Consistent DSA practice and accepted submissions.",
    ];

    const developingAreas = [
      hardSolved < 10
        ? "Increase hard-difficulty problem solving practice (Dynamic Programming, Graph algorithms)."
        : "Maintain continuous daily contest participation to optimize solution speed.",
      contestsCount < 5
        ? "Participate in weekly and biweekly LeetCode contests to build competitive speed under time limits."
        : "Focus on optimizing space-time complexity for advanced data structures.",
    ];

    const dna: LeetCodeDNA = {
      score: finalScore,
      confidence: 95,
      leetcodeId,
      totalSolved: totalProblemsSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestRating,
      ranking,
      strengths,
      developingAreas,
      evidence,
    };

    const connectionData: Partial<LeetCodeConnection> = {
      leetcodeId,
      ranking,
      totalProblemsSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestRating,
      contestRank,
      contestsCount,
      globalRanking,
      topPercentage,
      avatar,
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
      error: null,
    };

    return { connectionData, dna };
  }
}
