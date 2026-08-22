import { CodeforcesConnection, CodeforcesDNA } from "@/types";

export type CodeforcesApiErrorKind = "NOT_FOUND" | "TIMEOUT" | "UNAVAILABLE";

export class CodeforcesApiError extends Error {
  public readonly retryable: boolean;
  constructor(
    public readonly kind: CodeforcesApiErrorKind,
    message: string,
    retryable = false
  ) {
    super(message);
    this.name = "CodeforcesApiError";
    this.retryable = retryable;
  }
}

export class CodeforcesEngine {
  /**
   * Normalizes raw user handle input or pasted profile URL into a clean Codeforces handle string.
   */
  static normalizeHandle(input: string): string {
    if (!input) return "";
    let trimmed = input.trim();
    if (trimmed.includes("codeforces.com/profile/")) {
      const match = trimmed.match(/profile\/([A-Za-z0-9_.-]+)/i);
      if (match && match[1]) {
        trimmed = match[1];
      }
    }
    return trimmed.replace(/^@/, "").trim();
  }

  /**
   * Fetches user profile information from official Codeforces API (server-side)
   * @param handle Codeforces username
   * @param bypassCache Set true for ownership verification or manual sync to bypass Next.js fetch cache
   */
  static async fetchUserInfo(handle: string, bypassCache = false): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout for resilient public profile fetching
    const fetchOptions: RequestInit = bypassCache
      ? { cache: "no-store", headers: { "User-Agent": "StudentHub-CareerDNA/1.0" } }
      : { headers: { "User-Agent": "StudentHub-CareerDNA/1.0" }, next: { revalidate: 3600 } };

    try {
      const res = await fetch(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
        { ...fetchOptions, signal: controller.signal }
      );

      if (!res.ok) {
        throw new CodeforcesApiError(
          "UNAVAILABLE",
          "Codeforces is temporarily unavailable. Please try again in a moment.",
          true
        );
      }

      const data = await res.json();
      if (data.status !== "OK" || !data.result || data.result.length === 0) {
        const comment = typeof data.comment === "string" ? data.comment.toLowerCase() : "";
        if (comment.includes("not found") || comment.includes("not exist")) {
          throw new CodeforcesApiError("NOT_FOUND", `Codeforces account "${handle}" was not found.`, false);
        }
        throw new CodeforcesApiError(
          "UNAVAILABLE",
          "Codeforces is temporarily unavailable. Please try again in a moment.",
          true
        );
      }

      return data.result[0];
    } catch (error) {
      if (error instanceof CodeforcesApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new CodeforcesApiError(
          "TIMEOUT",
          "Codeforces is taking longer than expected. Please try again.",
          true
        );
      }
      throw new CodeforcesApiError(
        "UNAVAILABLE",
        "Unable to reach Codeforces right now. Please try again in a moment.",
        true
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fetches user contest rating history from official Codeforces API
   */
  static async fetchUserRating(handle: string): Promise<any[]> {
    try {
      const res = await fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, {
        headers: { "User-Agent": "StudentHub-CareerDNA/1.0" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.status === "OK" ? data.result || [] : [];
    } catch {
      return [];
    }
  }

  /**
   * Fetches user submission history from official Codeforces API
   */
  static async fetchUserStatus(handle: string): Promise<any[]> {
    try {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`, {
        headers: { "User-Agent": "StudentHub-CareerDNA/1.0" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.status === "OK" ? data.result || [] : [];
    } catch {
      return [];
    }
  }

  /**
   * Analyzes profile info, contest history, and submission logs to produce structured CodeforcesDNA.
   */
  static analyzeData(
    handle: string,
    userInfo: any,
    ratings: any[],
    submissions: any[]
  ): { connectionData: Partial<CodeforcesConnection>; dna: CodeforcesDNA } {
    const currentRating = userInfo.rating || 0;
    const maxRating = userInfo.maxRating || currentRating;
    const rank = userInfo.rank || "unrated";
    const maxRank = userInfo.maxRank || rank;
    const avatar = userInfo.avatar || userInfo.titlePhoto || "https://codeforces.org/s/0/images/codeforces-logo-with-telegram.png";

    // 1. Process Submissions & Deduplicate Solved Problems
    const solvedSet = new Set<string>();
    const difficultyBrackets: Record<string, number> = {
      "800-999": 0,
      "1000-1199": 0,
      "1200-1399": 0,
      "1400-1599": 0,
      "1600-1799": 0,
      "1800+": 0,
    };

    const tagCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};

    let totalSubmissions = submissions.length;

    for (const sub of submissions) {
      if (sub.programmingLanguage) {
        languageCounts[sub.programmingLanguage] = (languageCounts[sub.programmingLanguage] || 0) + 1;
      }

      if (sub.verdict === "OK" && sub.problem) {
        const prob = sub.problem;
        const problemKey = `${prob.contestId || 0}_${prob.index || ""}`;

        if (!solvedSet.has(problemKey)) {
          solvedSet.add(problemKey);

          // Difficulty distribution
          const r = prob.rating || 800;
          if (r < 1000) difficultyBrackets["800-999"]++;
          else if (r < 1200) difficultyBrackets["1000-1199"]++;
          else if (r < 1400) difficultyBrackets["1200-1399"]++;
          else if (r < 1600) difficultyBrackets["1400-1599"]++;
          else if (r < 1800) difficultyBrackets["1600-1799"]++;
          else difficultyBrackets["1800+"]++;

          // Tag analysis
          if (Array.isArray(prob.tags)) {
            for (const t of prob.tags) {
              const formattedTag = t.replace(/-/g, " ");
              tagCounts[formattedTag] = (tagCounts[formattedTag] || 0) + 1;
            }
          }
        }
      }
    }

    const solvedProblemsCount = solvedSet.size;

    // Sort strongest tags
    const strongestTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 2. Contest Rating Progression & Trend
    const contestsCount = ratings.length;
    let ratingTrend: "Improving" | "Stable" | "Declining" = "Stable";
    if (contestsCount >= 2) {
      const recent = ratings.slice(-3);
      const first = recent[0].newRating;
      const last = recent[recent.length - 1].newRating;
      if (last > first + 15) ratingTrend = "Improving";
      else if (last < first - 15) ratingTrend = "Declining";
    }

    // 3. Deterministic Codeforces DNA Score (0 - 100)
    // Rating (max 40 pts)
    const ratingPts = Math.min(Math.round(currentRating / 45), 40);
    // Solved problems volume (max 30 pts)
    const solvedPts = Math.min(Math.round(solvedProblemsCount / 4), 30);
    // Hard problems (1400+) exposure (max 15 pts)
    const hardCount = difficultyBrackets["1400-1599"] + difficultyBrackets["1600-1799"] + difficultyBrackets["1800+"];
    const hardPts = Math.min(hardCount * 2, 15);
    // Contest participation (max 15 pts)
    const contestPts = Math.min(Math.round(contestsCount * 1.2), 15);

    const rawScore = ratingPts + solvedPts + hardPts + contestPts;
    const finalScore = Math.min(Math.max(rawScore, 50), 98);

    // 4. Evidence Generation
    const evidence: Array<{ id: string; entity: string; skill: string; text: string; confidence: number; source: "Codeforces" }> = [];
    let evId = 1;

    if (strongestTags.length > 0) {
      evidence.push({
        id: `cf_ev_${evId++}`,
        entity: `Codeforces @${handle}`,
        skill: strongestTags[0].tag,
        text: `${strongestTags[0].count} accepted problems in ${strongestTags[0].tag} algorithms on Codeforces.`,
        confidence: 95,
        source: "Codeforces",
      });
    }

    if (hardCount > 0) {
      evidence.push({
        id: `cf_ev_${evId++}`,
        entity: `Codeforces @${handle}`,
        skill: "Advanced Problem Solving",
        text: `${hardCount} accepted problems rated 1400+ on Codeforces.`,
        confidence: 92,
        source: "Codeforces",
      });
    }

    if (contestsCount > 0) {
      evidence.push({
        id: `cf_ev_${evId++}`,
        entity: `Codeforces @${handle}`,
        skill: "Competitive Programming",
        text: `Participated in ${contestsCount} rated Codeforces contests with maximum rating ${maxRating} (${maxRank}).`,
        confidence: 94,
        source: "Codeforces",
      });
    }

    const strengths = [
      `Official Codeforces rating of ${currentRating} (${rank}) with peak rating ${maxRating}.`,
      `Solved ${solvedProblemsCount} unique competitive programming problems across ${contestsCount} rated contests.`,
      strongestTags.length > 0 ? `Strongest problem tags: ${strongestTags.slice(0, 3).map((t) => t.tag).join(", ")}.` : "Consistent problem submission activity.",
    ];

    const developingAreas = [
      hardCount < 5 ? "Limited exposure to 1600+ hard difficulty problems." : "Continue practicing complex dynamic programming and graph algorithms.",
      contestsCount < 5 ? "Participate in more live rated Div. 2 / Div. 3 contests to improve speed under pressure." : "Maintain rating consistency across consecutive contest rounds.",
    ];

    const dna: CodeforcesDNA = {
      score: finalScore,
      confidence: 95,
      handle,
      rating: currentRating,
      maxRating,
      rank,
      maxRank,
      solvedProblemsCount,
      contestsCount,
      strongestTags,
      difficultyDistribution: difficultyBrackets,
      languages: languageCounts,
      ratingTrend,
      strengths,
      developingAreas,
      evidence,
    };

    const connectionData: Partial<CodeforcesConnection> = {
      handle,
      rating: currentRating,
      maxRating,
      rank,
      maxRank,
      avatar,
      contestsCount,
      totalSubmissions,
      solvedProblemsCount,
      strongestTags,
      difficultyDistribution: difficultyBrackets,
      languages: languageCounts,
      ratingTrend,
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
      error: null,
    };

    return { connectionData, dna };
  }
}
