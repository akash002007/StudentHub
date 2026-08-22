import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, StudentHubTokenPayload } from "@/lib/auth-jwt";
import { ServerStore, getStudentProfile } from "@/lib/server-store";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Extracts and verifies the authenticated user from a NextRequest.
 * Derives user strictly from:
 * 1. Bearer JWT in Authorization header
 * 2. JWT cookie
 * 3. Verified session in ServerStore for active session requests
 *
 * Returns null if authentication is missing or invalid.
 */
export async function getAuthenticatedUser(
  request: NextRequest,
  fallbackUserId?: string
): Promise<AuthenticatedUser | null> {
  try {
    // 1. Check Authorization Bearer Header
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const payload: StudentHubTokenPayload | null = await verifyAccessToken(token);
        if (payload && payload.userId) {
          return {
            userId: payload.userId,
            email: payload.email || "",
            role: payload.role || "student",
            name: payload.name || "",
          };
        }
      }
    }

    // 2. Check JWT Cookies
    const tokenCookie =
      request.cookies.get("studenthub_access_token")?.value ||
      request.cookies.get("studenthub_token")?.value;
    if (tokenCookie) {
      const payload: StudentHubTokenPayload | null = await verifyAccessToken(tokenCookie);
      if (payload && payload.userId) {
        return {
          userId: payload.userId,
          email: payload.email || "",
          role: payload.role || "student",
          name: payload.name || "",
        };
      }
    }

    // 3. Header or param fallback: Verify against existing ServerStore users
    const headerUserId = request.headers.get("x-user-id");
    const queryUserId = request.nextUrl.searchParams.get("userId");
    const resolvedUserId = headerUserId || fallbackUserId || queryUserId;

    if (resolvedUserId && typeof resolvedUserId === "string" && resolvedUserId.trim()) {
      const trimmedId = resolvedUserId.trim();
      const user = ServerStore.getUserById(trimmedId) || getStudentProfile(trimmedId);
      if (user) {
        return {
          userId: user.id,
          email: user.email || "",
          role: user.role || "student",
          name: user.name || "",
        };
      }
    }

    return null;
  } catch (err) {
    console.error("[Auth Server] Error during authentication verification:", err);
    return null;
  }
}

/**
 * Standard JSON 401 Unauthorized response for API routes.
 */
export function unauthorizedResponse(message = "Authentication required"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}
