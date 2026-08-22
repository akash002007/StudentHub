import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { LeetCodeEngine } from "@/lib/leetcode-engine";
import { saveLeetCodeConnection, getLeetCodeConnection } from "@/lib/server-store";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";
import { LeetCodeConnection } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request, body.userId);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const rawLeetCodeId = body.leetcodeId || body.handle;

    if (!rawLeetCodeId || typeof rawLeetCodeId !== "string" || rawLeetCodeId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid LeetCode ID." },
        { status: 400 }
      );
    }

    // 1. Normalize LeetCode ID (supports pasted profile URLs and @ prefixes)
    const normalizedId = LeetCodeEngine.normalizeLeetCodeId(rawLeetCodeId);

    if (normalizedId.length < 2) {
      return NextResponse.json(
        { success: false, error: "LeetCode ID is too short." },
        { status: 400 }
      );
    }

    // 2. Validate Public LeetCode Profile Existence via Official GraphQL API
    let profileData: any;
    try {
      profileData = await LeetCodeEngine.fetchUserProfile(normalizedId);
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          error:
            err.message ||
            `LeetCode profile "${normalizedId}" not found. Please check your LeetCode ID.`,
        },
        { status: err.kind === "NOT_FOUND" ? 404 : 400 }
      );
    }

    // 3. Generate Single-Use Ownership Verification Token (15-min TTL)
    const verificationToken = `STUDENTHUB-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const existingConn = getLeetCodeConnection(authUser.userId);

    const matchedUser = profileData.matchedUser || {};
    const profile = matchedUser.profile || {};

    const connectionRecord: LeetCodeConnection = {
      id: existingConn?.id || `lc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: authUser.userId,
      leetcodeId: normalizedId,
      ranking: profile.ranking || existingConn?.ranking || 0,
      totalProblemsSolved: existingConn?.totalProblemsSolved || 0,
      easySolved: existingConn?.easySolved || 0,
      mediumSolved: existingConn?.mediumSolved || 0,
      hardSolved: existingConn?.hardSolved || 0,
      contestRating: existingConn?.contestRating || 0,
      contestRank: existingConn?.contestRank || "Unrated",
      contestsCount: existingConn?.contestsCount || 0,
      avatar: profile.userAvatar || existingConn?.avatar || "",
      status: "PENDING_VERIFICATION",
      syncStatus: "CONNECTED",
      verificationToken,
      verificationExpiresAt: expiresAt,
      verifiedAt: null,
      lastSyncedAt: existingConn?.lastSyncedAt || null,
      connectedAt: existingConn?.connectedAt || now.toISOString(),
      error: null,
    };

    saveLeetCodeConnection(authUser.userId, connectionRecord);

    console.log(
      `[LeetCode Connect] authenticated: true, connectionCreated: true, userId: ${authUser.userId}, leetcodeId: ${normalizedId}`
    );

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      leetcodeId: normalizedId,
      verificationToken,
      expiresAt,
      message: `LeetCode account @${normalizedId} found! Please complete account ownership verification.`,
      connection: connectionRecord,
    });
  } catch (err: any) {
    console.error("[LeetCode Connect] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process LeetCode connection request." },
      { status: 500 }
    );
  }
}
