import { NextRequest, NextResponse } from "next/server";
import { getLeetCodeConnection, saveLeetCodeConnection } from "@/lib/server-store";
import { LeetCodeApiError, LeetCodeEngine } from "@/lib/leetcode-engine";
import { syncLeetCodeAccount } from "@/lib/leetcode-sync-worker";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

function normalizeValue(val: string | undefined | null): string {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/\s+/g, " ").toLowerCase();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request, body.userId);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const requestedId = body.leetcodeId || body.handle
      ? LeetCodeEngine.normalizeLeetCodeId(body.leetcodeId || body.handle)
      : null;

    const connection = getLeetCodeConnection(authUser.userId);

    if (
      !connection ||
      (requestedId && connection.leetcodeId.toLowerCase() !== requestedId.toLowerCase())
    ) {
      return NextResponse.json(
        { success: false, error: "No pending LeetCode verification found for this account." },
        { status: 404 }
      );
    }

    if (connection.status === "VERIFIED") {
      return NextResponse.json({
        success: true,
        message: "LeetCode account is already verified.",
        connection,
      });
    }

    // 1. Expiration Check
    if (connection.verificationExpiresAt) {
      const expiresAtMs = new Date(connection.verificationExpiresAt).getTime();
      if (Date.now() > expiresAtMs) {
        connection.status = "VERIFICATION_FAILED";
        connection.error = "Verification code expired. Please generate a new code.";
        saveLeetCodeConnection(authUser.userId, connection);

        return NextResponse.json(
          {
            success: false,
            error: "Your verification code has expired. Please generate a new code.",
          },
          { status: 400 }
        );
      }
    }

    const token = connection.verificationToken;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "No verification token found for this connection." },
        { status: 400 }
      );
    }

    console.log(`[LeetCode Verify] Checking profile for @${connection.leetcodeId}`);

    // Inspect live profile (retry once to account for profile propagation)
    let profileData: any;
    const normalizedToken = normalizeValue(token);
    let isMatch = false;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        profileData = await LeetCodeEngine.fetchUserProfile(connection.leetcodeId, true);
      } catch (error) {
        const apiError =
          error instanceof LeetCodeApiError
            ? error
            : new LeetCodeApiError(
                "UNAVAILABLE",
                "Unable to reach LeetCode right now. Please try again in a moment."
              );

        if (apiError.kind === "NOT_FOUND") {
          return NextResponse.json({ success: false, error: apiError.message }, { status: 404 });
        }
        if (apiError.kind === "TIMEOUT") {
          return NextResponse.json({ success: false, error: apiError.message }, { status: 504 });
        }
        return NextResponse.json({ success: false, error: apiError.message }, { status: 502 });
      }

      const matchedUser = profileData?.matchedUser;
      if (!matchedUser) {
        return NextResponse.json(
          { success: false, error: "We couldn't find this LeetCode account." },
          { status: 404 }
        );
      }

      const profile = matchedUser.profile || {};
      const fieldsToInspect = [
        profile.aboutMe,
        profile.realName,
        profile.location,
        ...(Array.isArray(profile.websites) ? profile.websites : []),
      ].map(normalizeValue);

      isMatch = fieldsToInspect.some((field) => field && field.includes(normalizedToken));

      if (isMatch || attempt === 2) break;
      await delay(350);
    }

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification code was not found on your public LeetCode profile. Make sure the code is saved in your 'About Me' / summary and try again.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[LeetCode Verify] connectionFound: true, verificationResult: true in ${
        Date.now() - startedAt
      }ms`
    );

    // SUCCESSFUL VERIFICATION: Mark status VERIFIED and clear token
    const now = new Date().toISOString();
    connection.status = "VERIFIED";
    connection.verifiedAt = now;
    connection.verificationToken = null; // Token invalidated after successful verification
    connection.error = null;

    saveLeetCodeConnection(authUser.userId, connection);

    // Trigger non-blocking initial sync
    syncLeetCodeAccount(authUser.userId, connection.leetcodeId).catch((err) => {
      console.error("[LeetCode Verify] Post-verification sync error:", err);
    });

    return NextResponse.json({
      success: true,
      message: `LeetCode account verified. @${connection.leetcodeId}. Syncing LeetCode data...`,
      connection,
    });
  } catch (err: any) {
    console.error("[LeetCode Verify] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error verifying LeetCode ownership." },
      { status: 500 }
    );
  }
}
