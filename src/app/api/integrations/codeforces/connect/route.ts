import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { CodeforcesEngine } from "@/lib/codeforces-engine";
import { saveCodeforcesConnection, getCodeforcesConnection } from "@/lib/server-store";
import { CodeforcesConnection } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId = "std_default_01", handle } = body;

    if (!handle || typeof handle !== "string" || handle.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Codeforces handle." },
        { status: 400 }
      );
    }

    // 1. Normalize Handle (support pasted profile URLs)
    const normalizedHandle = CodeforcesEngine.normalizeHandle(handle);

    if (normalizedHandle.length < 2) {
      return NextResponse.json(
        { success: false, error: "Codeforces handle is too short." },
        { status: 400 }
      );
    }

    // 2. Live Handle Existence Verification via official Codeforces user.info API
    let userInfo: any;
    try {
      userInfo = await CodeforcesEngine.fetchUserInfo(normalizedHandle);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || `Codeforces profile "${normalizedHandle}" not found. Please check your handle.` },
        { status: 400 }
      );
    }

    // 3. Generate Single-Use Ownership Verification Token (15-min Expiration)
    const verificationToken = `STUDENTHUB-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins TTL

    const existingConn = getCodeforcesConnection(userId);

    const connectionRecord: CodeforcesConnection = {
      id: existingConn?.id || `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      handle: normalizedHandle,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || "unrated",
      maxRank: userInfo.maxRank || "unrated",
      avatar: userInfo.avatar || userInfo.titlePhoto || "",
      contestsCount: existingConn?.contestsCount || 0,
      totalSubmissions: existingConn?.totalSubmissions || 0,
      solvedProblemsCount: existingConn?.solvedProblemsCount || 0,
      strongestTags: existingConn?.strongestTags || [],
      difficultyDistribution: existingConn?.difficultyDistribution || {},
      languages: existingConn?.languages || {},
      ratingTrend: existingConn?.ratingTrend || "Stable",
      status: "PENDING_VERIFICATION",
      syncStatus: "CONNECTED",
      verificationToken,
      verificationExpiresAt: expiresAt,
      verifiedAt: null,
      lastSyncedAt: existingConn?.lastSyncedAt || null,
      connectedAt: existingConn?.connectedAt || now.toISOString(),
      error: null,
    };

    saveCodeforcesConnection(userId, connectionRecord);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      handle: normalizedHandle,
      verificationToken,
      expiresAt,
      message: `Codeforces handle @${normalizedHandle} found! Please complete account ownership verification.`,
      connection: connectionRecord,
    });
  } catch (err: any) {
    console.error("Codeforces Connect API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process Codeforces connection request." },
      { status: 500 }
    );
  }
}
