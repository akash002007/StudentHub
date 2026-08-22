import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUserId = searchParams.get("userId");

  const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
  const userId = authUser?.userId || rawUserId || "std_default_01";

  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `${appUrl}/api/integrations/github/callback`;

  if (!clientId || clientId === "YOUR_GITHUB_CLIENT_ID_HERE") {
    console.error(
      "GitHub OAuth error: GITHUB_CLIENT_ID is missing or using placeholder in .env.local"
    );
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=missing_client_id`
    );
  }

  // 1. Generate new cryptographically secure random state token for fresh transaction
  const randomToken = crypto.randomBytes(32).toString("hex");
  const state = `${randomToken}:${userId}`;

  // 2. Construct GitHub OAuth Authorization URL with prompt=select_account for explicit account interaction
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=read:user,repo&state=${encodeURIComponent(state)}&prompt=select_account`;

  console.log(
    `[GitHub OAuth] action: connect, newOAuthState: generated, redirectStarted: true, userId: ${userId}`
  );

  const response = NextResponse.redirect(githubAuthUrl);

  // 3. Store state token in secure HTTP-only cookie for callback verification (10 minutes max age)
  response.cookies.set("studenthub_gh_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
