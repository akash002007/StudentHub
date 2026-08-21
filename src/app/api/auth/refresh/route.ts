import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth-jwt";

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RefreshSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid refresh token request",
        },
        { status: 400 }
      );
    }

    const { refreshToken } = parseResult.data;
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired refresh token. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // Generate fresh access token
    const newAccessToken = await signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      googleId: payload.googleId,
      authProvider: payload.authProvider,
    });

    return NextResponse.json(
      {
        success: true,
        token: newAccessToken,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh token",
      },
      { status: 500 }
    );
  }
}
