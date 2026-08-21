import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `${appUrl}/api/integrations/github/callback`;

  if (!clientId || clientId === "YOUR_GITHUB_CLIENT_ID_HERE") {
    console.error("GitHub OAuth error: GITHUB_CLIENT_ID is missing or using placeholder in .env.local");
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=missing_client_id`
    );
  }

  // 1. Generate cryptographically secure random state token to prevent CSRF & state replay
  const randomToken = crypto.randomBytes(24).toString("hex");
  const state = `${randomToken}:${userId}`;

  // 2. Construct GitHub OAuth Authorization URL with prompt=login to force fresh account authentication
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=read:user,repo&state=${encodeURIComponent(state)}&prompt=login`;

  const response = NextResponse.redirect(githubAuthUrl);

  // 3. Store state token in secure HTTP-only cookie for state verification (10 minutes max age)
  response.cookies.set("studenthub_gh_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
