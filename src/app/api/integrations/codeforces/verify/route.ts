import { NextRequest, NextResponse } from "next/server";
import { getCodeforcesConnection, saveCodeforcesConnection } from "@/lib/server-store";
import { CodeforcesApiError, CodeforcesEngine } from "@/lib/codeforces-engine";
import { syncCodeforcesAccount } from "@/lib/codeforces-sync-worker";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/**
 * Normalizes string values for robust token comparison:
 * - Handles null/undefined safely
 * - Trims leading/trailing whitespace
 * - Normalizes multiple spaces to single space
 * - Converts to lowercase for comparison
 */
function normalizeValue(val: string | undefined | null): string {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/\s+/g, " ").toLowerCase();
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request, body.userId);

    // Genuine Authentication check — ONLY return 401 when StudentHub session is invalid
    if (!authUser) {
      console.warn("[Codeforces Verification] authenticated: false, verificationStatus: AUTHENTICATION_REQUIRED");
      return unauthorizedResponse();
    }

    const requestedHandle = body.handle ? CodeforcesEngine.normalizeHandle(body.handle) : null;
    const connection = getCodeforcesConnection(authUser.userId);

    if (
      !connection ||
      (requestedHandle && connection.handle.toLowerCase() !== requestedHandle.toLowerCase())
    ) {
      console.warn(`[Codeforces Verification] authenticated: true, connectionFound: false, userId: ${authUser.userId}`);
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error: "No pending Codeforces verification found for this account.",
        },
        { status: 404 }
      );
    }

    if (connection.status === "VERIFIED") {
      console.log(`[Codeforces Verification] authenticated: true, alreadyVerified: true, handle: @${connection.handle}`);
      return NextResponse.json({
        success: true,
        status: "VERIFIED",
        message: "Codeforces account is already verified.",
        connection,
      });
    }

    // 1. Expiration Check
    if (connection.verificationExpiresAt) {
      const expiresAtMs = new Date(connection.verificationExpiresAt).getTime();
      if (Date.now() > expiresAtMs) {
        connection.status = "VERIFICATION_FAILED";
        connection.error = "Verification code expired. Please generate a new code.";
        saveCodeforcesConnection(authUser.userId, connection);

        console.warn(`[Codeforces Verification] authenticated: true, verificationExpired: true, handle: @${connection.handle}`);
        return NextResponse.json(
          {
            success: false,
            status: "FAILED",
            error: "Your verification code has expired. Please generate a new code.",
          },
          { status: 400 }
        );
      }
    }

    const token = connection.verificationToken;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error: "No verification token found for this connection.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[Codeforces Verification] authenticated: true, connectionFound: true, handlePresent: true, verificationStarted: true, handle: @${connection.handle}`
    );

    // Fetch public profile and verify token
    let userInfo: any;
    const normalizedToken = normalizeValue(token);
    let isMatch = false;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const apiStartedAt = Date.now();
      try {
        console.log(
          `[Codeforces Verification] profileFetchStarted: true, attempt: ${attempt}, handle: @${connection.handle}`
        );
        userInfo = await CodeforcesEngine.fetchUserInfo(connection.handle, true);
        console.log(
          `[Codeforces Verification] profileFetchStatus: 200, duration: ${Date.now() - apiStartedAt}ms`
        );
      } catch (error) {
        const apiError =
          error instanceof CodeforcesApiError
            ? error
            : new CodeforcesApiError(
                "UNAVAILABLE",
                "Unable to reach Codeforces right now. Please try again in a moment.",
                true
              );

        if (apiError.kind === "NOT_FOUND") {
          console.warn(`[Codeforces Verification] profileFetchStatus: NOT_FOUND, verificationStatus: FAILED`);
          return NextResponse.json(
            { success: false, status: "FAILED", error: apiError.message },
            { status: 404 }
          );
        }

        if (apiError.kind === "TIMEOUT") {
          console.warn(
            `[Codeforces Verification] authenticated: true, connectionFound: true, profileFetchStarted: true, profileFetchStatus: TIMEOUT, verificationStatus: TEMPORARY_ERROR`
          );
          return NextResponse.json(
            {
              success: false,
              status: "TEMPORARY_ERROR",
              retryable: true,
              error: "Codeforces is taking longer than expected. Please try again.",
            },
            { status: 504 }
          );
        }

        console.warn(
          `[Codeforces Verification] authenticated: true, connectionFound: true, profileFetchStarted: true, profileFetchStatus: 502, verificationStatus: TEMPORARY_ERROR`
        );
        return NextResponse.json(
          {
            success: false,
            status: "TEMPORARY_ERROR",
            retryable: true,
            error: "Codeforces is temporarily unavailable. Please try again in a moment.",
          },
          { status: 502 }
        );
      }

      if (!userInfo?.handle || userInfo.handle.toLowerCase() !== connection.handle.toLowerCase()) {
        return NextResponse.json(
          { success: false, status: "FAILED", error: "We couldn't find this Codeforces account." },
          { status: 404 }
        );
      }

      const fieldsToInspect = [
        userInfo.firstName,
        userInfo.lastName,
        userInfo.organization,
      ].map(normalizeValue);

      isMatch = fieldsToInspect.some((field) => field === normalizedToken || (field && field.includes(normalizedToken)));
      if (isMatch || attempt === 2) break;
      await delay(350);
    }

    if (!isMatch) {
      console.log(
        `[Codeforces Verification] authenticated: true, connectionFound: true, handlePresent: true, verificationStarted: true, profileFetchStarted: true, profileFetchStatus: 200, verificationCodeFound: false, verificationStatus: FAILED`
      );
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error:
            "Verification code was not found on your Codeforces profile. Please save the profile changes and try again.",
        },
        { status: 400 }
      );
    }

    console.log(
      `[Codeforces Verification] authenticated: true, connectionFound: true, handlePresent: true, verificationStarted: true, profileFetchStarted: true, profileFetchStatus: 200, verificationCodeFound: true, verificationStatus: VERIFIED in ${
        Date.now() - startedAt
      }ms`
    );

    // SUCCESSFUL OWNERSHIP VERIFICATION: Mark status VERIFIED and clear token
    const now = new Date().toISOString();
    connection.status = "VERIFIED";
    connection.verifiedAt = now;
    connection.verificationToken = null; // Single-use token invalidated
    connection.error = null;

    saveCodeforcesConnection(authUser.userId, connection);

    // Trigger initial sync non-blocking
    syncCodeforcesAccount(authUser.userId, connection.handle).catch((err) => {
      console.error("[Codeforces Verification] Post-verification sync error:", err);
    });

    return NextResponse.json({
      success: true,
      status: "VERIFIED",
      message: `Codeforces account verified. @${connection.handle}. Syncing Codeforces data...`,
      connection,
    });
  } catch (err: any) {
    console.error("[Codeforces Verification] Verify API Error:", err);
    return NextResponse.json(
      {
        success: false,
        status: "TEMPORARY_ERROR",
        retryable: true,
        error: "Server error verifying Codeforces ownership. Please try again.",
      },
      { status: 500 }
    );
  }
}
