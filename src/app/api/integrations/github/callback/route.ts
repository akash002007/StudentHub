import { NextRequest, NextResponse } from "next/server";
import { encryptToken } from "@/lib/encryption";
import {
  getGitHubConnectionByGithubId,
  saveGitHubConnection,
} from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `${appUrl}/api/integrations/github/callback`;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // 1. Handle OAuth cancellation or access rejection
  if (errorParam === "access_denied" || searchParams.has("error")) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=github_cancelled`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=missing_code`
    );
  }

  // 2. Validate OAuth state parameter against HTTP-only cookie (CSRF & state replay protection)
  const savedStateCookie = request.cookies.get("studenthub_gh_state")?.value;
  if (!savedStateCookie || savedStateCookie !== state) {
    console.error("[GitHub OAuth Callback] state mismatch error");
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=invalid_state`
    );
  }

  // Extract userId from verified state token (format: "randomHex:userId")
  const stateParts = state.split(":");
  const userId = stateParts[1] || "std_default_01";

  try {
    // 3. Exchange authorization code for GitHub access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || "",
        client_secret: process.env.GITHUB_CLIENT_SECRET || "",
        code,
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=oauth_exchange_failed`
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken || tokenData.error) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=invalid_token`
      );
    }

    // 4. Fetch authenticated GitHub user identity (server-side verification)
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "StudentHub-OAuth",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=github_profile_failed`
      );
    }

    const githubUser = await userRes.json();
    const githubUserId = String(githubUser.id); // Immutable numeric GitHub User ID
    const githubUsername = githubUser.login;
    const githubDisplayName = githubUser.name || null;
    const githubAvatarUrl = githubUser.avatar_url || null;
    const githubProfileUrl = githubUser.html_url || `https://github.com/${githubUsername}`;

    // 5. Prevent linking the same numeric GitHub account to multiple different StudentHub users
    const existingConn = getGitHubConnectionByGithubId(githubUserId);
    if (existingConn && existingConn.userId !== userId) {
      const response = NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=account_already_linked`
      );
      response.cookies.delete("studenthub_gh_state");
      return response;
    }

    // 6. Encrypt token server-side
    const accessTokenEncrypted = encryptToken(accessToken);

    // 7. Save / replace connection cleanly for current user
    saveGitHubConnection({
      userId,
      githubUserId,
      githubUsername,
      githubDisplayName,
      githubAvatarUrl,
      githubProfileUrl,
      accessTokenEncrypted,
    });

    // 8. Enqueue background sync for new account
    const { enqueueGitHubSync } = await import("@/lib/github-sync-worker");
    enqueueGitHubSync(userId);

    console.log(
      `[GitHub OAuth Callback] stateValid: true, authorizationCodePresent: true, providerIdentityFetched: true, connectionCreated: true, userId: ${userId}`
    );

    // 9. Redirect back to Connected Accounts page with success status
    const response = NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?status=github_connected`
    );

    // Single-use state cleanup
    response.cookies.delete("studenthub_gh_state");

    return response;
  } catch (err: unknown) {
    console.error("[GitHub OAuth Callback] error:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=callback_error`
    );
  }
}
