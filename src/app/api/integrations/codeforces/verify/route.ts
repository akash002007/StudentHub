import { NextRequest, NextResponse } from "next/server";
import { getCodeforcesConnection, saveCodeforcesConnection } from "@/lib/server-store";
import { CodeforcesApiError, CodeforcesEngine } from "@/lib/codeforces-engine";
import { syncCodeforcesAccount } from "@/lib/codeforces-sync-worker";

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
    const userId = body.userId || "std_default_01";
    const requestedHandle = body.handle ? CodeforcesEngine.normalizeHandle(body.handle) : null;

    const connection = getCodeforcesConnection(userId);

    if (!connection || (requestedHandle && connection.handle.toLowerCase() !== requestedHandle.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "No pending Codeforces verification found for this handle." },
        { status: 404 }
      );
    }

    if (connection.status === "VERIFIED") {
      return NextResponse.json({
        success: true,
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
        saveCodeforcesConnection(userId, connection);

        return NextResponse.json(
          { success: false, error: "Your verification code has expired. Please generate a new code." },
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

    console.log(`[Codeforces Verification] started for handle @${connection.handle}`);

    // A single profile lookup is the normal path. Retry once only to cover profile propagation.
    let userInfo: any;
    const normalizedToken = normalizeValue(token);
    let isMatch = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const apiStartedAt = Date.now();
      try {
        userInfo = await CodeforcesEngine.fetchUserInfo(connection.handle, true);
        console.log(`[Codeforces Verification] profile response received in ${Date.now() - apiStartedAt}ms`);
      } catch (error) {
        const apiError = error instanceof CodeforcesApiError
          ? error
          : new CodeforcesApiError("UNAVAILABLE", "Unable to reach Codeforces right now. Please try again in a moment.");
        if (apiError.kind === "NOT_FOUND") {
          return NextResponse.json({ success: false, error: apiError.message }, { status: 404 });
        }
        if (apiError.kind === "TIMEOUT") {
          console.warn("[Codeforces Verification] API timeout");
          return NextResponse.json({ success: false, error: apiError.message }, { status: 504 });
        }
        console.warn("[Codeforces Verification] API unavailable");
        return NextResponse.json({ success: false, error: apiError.message }, { status: 502 });
      }

      if (!userInfo?.handle || userInfo.handle.toLowerCase() !== connection.handle.toLowerCase()) {
        return NextResponse.json({ success: false, error: "We couldn't find this Codeforces account." }, { status: 404 });
      }

      const fieldsToInspect = [userInfo.firstName, userInfo.lastName, userInfo.organization].map(normalizeValue);
      isMatch = fieldsToInspect.some((field) => field === normalizedToken);
      if (isMatch || attempt === 2) break;
      await delay(350);
    }

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token was not found on your Codeforces profile. Make sure the token is visible and try again.",
        },
        { status: 400 }
      );
    }

    console.log(`[Codeforces Verification] token matching completed in ${Date.now() - startedAt}ms`);

    // SUCCESSFUL OWNERSHIP VERIFICATION: Mark status VERIFIED and clear token
    const now = new Date().toISOString();
    connection.status = "VERIFIED";
    connection.verifiedAt = now;
    connection.verificationToken = null; // Single-use token invalidated
    connection.error = null;

    saveCodeforcesConnection(userId, connection);

    // Trigger initial sync without delaying the verification response.
    syncCodeforcesAccount(userId, connection.handle).catch((err) => {
      console.error("Post-verification sync error:", err);
    });

    return NextResponse.json({
      success: true,
      message: `Codeforces account verified. @${connection.handle}. Syncing Codeforces data...`,
      connection,
    });
  } catch (err: any) {
    console.error("Codeforces Verify API Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error verifying Codeforces ownership." },
      { status: 500 }
    );
  }
}
