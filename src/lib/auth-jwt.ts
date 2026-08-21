import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { UserRole } from "@/types";

const DEFAULT_JWT_SECRET = "studenthub_jwt_access_secret_super_secure_key_2026";
const DEFAULT_REFRESH_SECRET = "studenthub_jwt_refresh_secret_super_secure_key_2026";

function getSecretKey(secret?: string): Uint8Array {
  return new TextEncoder().encode(secret || DEFAULT_JWT_SECRET);
}

function getRefreshSecretKey(secret?: string): Uint8Array {
  return new TextEncoder().encode(secret || DEFAULT_REFRESH_SECRET);
}

export interface StudentHubTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  googleId?: string;
  authProvider?: "credentials" | "google";
  tokenType?: "access" | "refresh";
}

/**
 * Signs a StudentHub Access Token (default 1 hour expiry)
 */
export async function signAccessToken(
  payload: Omit<StudentHubTokenPayload, "tokenType" | "iat" | "exp">,
  expiresIn = "1h"
): Promise<string> {
  const secret = getSecretKey(process.env.JWT_SECRET);

  return new SignJWT({ ...payload, tokenType: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("studenthub")
    .setAudience("studenthub-users")
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Signs a StudentHub Refresh Token (default 7 days expiry)
 */
export async function signRefreshToken(
  payload: Omit<StudentHubTokenPayload, "tokenType" | "iat" | "exp">,
  expiresIn = "7d"
): Promise<string> {
  const secret = getRefreshSecretKey(process.env.JWT_REFRESH_SECRET);

  return new SignJWT({ ...payload, tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("studenthub")
    .setAudience("studenthub-users")
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Verifies a StudentHub Access Token
 */
export async function verifyAccessToken(token: string): Promise<StudentHubTokenPayload | null> {
  try {
    const secret = getSecretKey(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "studenthub",
      audience: "studenthub-users",
    });

    return payload as StudentHubTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies a StudentHub Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<StudentHubTokenPayload | null> {
  try {
    const secret = getRefreshSecretKey(process.env.JWT_REFRESH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "studenthub",
      audience: "studenthub-users",
    });

    return payload as StudentHubTokenPayload;
  } catch {
    return null;
  }
}
