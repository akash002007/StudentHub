import { NextRequest, NextResponse } from "next/server";
import { encryptToken } from "@/lib/encryption";
import {
  saveHuggingFaceConnection,
  getHuggingFaceConnection,
} from "@/lib/server-store";
import { HuggingFaceEngine } from "@/lib/huggingface-engine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl =
    process.env.HUGGINGFACE_CALLBACK_URL ||
    `${appUrl}/api/integrations/huggingface/callback`;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // 1. Handle OAuth rejection or cancellation
  if (errorParam === "access_denied" || searchParams.has("error")) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=hf_access_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=hf_missing_code`
    );
  }

  // 2. Validate OAuth state parameter against HTTP-only cookie
  const savedStateCookie = request.cookies.get("studenthub_hf_state")?.value;
  if (!savedStateCookie || savedStateCookie !== state) {
    console.error("Hugging Face OAuth Callback state mismatch:", { savedStateCookie, state });
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=invalid_state`
    );
  }

  // Extract userId from state token (format: "randomHex:userId")
  const stateParts = state.split(":");
  const userId = stateParts[1] || "std_default_01";

  try {
    const clientId = process.env.HUGGINGFACE_CLIENT_ID || "";
    const clientSecret = process.env.HUGGINGFACE_CLIENT_SECRET || "";

    // Basic Auth header for Hugging Face token endpoint
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // 3. Exchange authorization code for Hugging Face access token
    const tokenRes = await fetch("https://huggingface.co/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl,
      }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Hugging Face token exchange failed:", errText);
      return NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=hf_token_exchange_failed`
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/connected-accounts?error=hf_invalid_token`
      );
    }

    // 4. Retrieve authenticated Hugging Face identity
    const hfUser = await HuggingFaceEngine.fetchUserInfo(accessToken);

    // 5. Encrypt access token server-side
    const accessTokenEncrypted = encryptToken(accessToken);
    const now = new Date().toISOString();

    // 6. Save Hugging Face Connection
    saveHuggingFaceConnection({
      id: `hf_conn_${userId}`,
      userId,
      hfUserId: hfUser.id,
      username: hfUser.username,
      fullname: hfUser.fullname,
      avatarUrl: hfUser.avatarUrl,
      profileUrl: `https://huggingface.co/${hfUser.username}`,
      accessTokenEncrypted,
      modelsCount: 0,
      datasetsCount: 0,
      spacesCount: 0,
      totalLikes: 0,
      syncStatus: "CONNECTED",
      lastSyncedAt: null,
      connectedAt: now,
      error: null,
    });

    // 7. Enqueue background sync for Hugging Face models, datasets, spaces
    const { enqueueHuggingFaceSync } = await import("@/lib/huggingface-sync-worker");
    enqueueHuggingFaceSync(userId).catch((err) => {
      console.error("Hugging Face initial background sync error:", err);
    });

    // 8. Redirect back to Connected Accounts page
    const response = NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?status=huggingface_connected`
    );

    // Single-use state token cleanup
    response.cookies.delete("studenthub_hf_state");

    return response;
  } catch (err: any) {
    console.error("Hugging Face OAuth Callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/connected-accounts?error=hf_callback_error`
    );
  }
}
