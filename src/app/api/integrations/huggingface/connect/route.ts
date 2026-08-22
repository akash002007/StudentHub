import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUserId = searchParams.get("userId");

  const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
  const userId = authUser?.userId || rawUserId || "std_default_01";

  const clientId = process.env.HUGGINGFACE_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.HUGGINGFACE_CALLBACK_URL ||
    `${appUrl}/api/integrations/huggingface/callback`;

  if (!clientId || clientId === "YOUR_HUGGINGFACE_CLIENT_ID_HERE") {
    console.error(
      "Hugging Face OAuth error: HUGGINGFACE_CLIENT_ID is missing or using placeholder in .env.local"
    );
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=missing_hf_client_id`
    );
  }

  // 1. Generate new cryptographically secure random state token for fresh transaction
  const randomToken = crypto.randomBytes(32).toString("hex");
  const state = `${randomToken}:${userId}`;

  // 2. Construct Hugging Face OAuth Authorization URL with prompt=consent to ensure fresh consent interaction
  const hfAuthUrl = `https://huggingface.co/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=openid%20profile%20read-repos&state=${encodeURIComponent(
    state
  )}&response_type=code&prompt=consent`;

  console.log(
    `[Hugging Face OAuth] action: connect, newOAuthState: generated, redirectStarted: true, userId: ${userId}`
  );

  const response = NextResponse.redirect(hfAuthUrl);

  // 3. Store state token in secure HTTP-only cookie for state verification (10 minutes max age)
  response.cookies.set("studenthub_hf_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
