import crypto from "crypto";

const ENCRYPTION_SECRET =
  process.env.ENCRYPTION_KEY ||
  process.env.JWT_SECRET ||
  "studenthub_secure_encryption_key_32bytes_long_2026!";

function getDerivedKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a sensitive string (e.g. OAuth access token) using AES-256-GCM.
 * Never returns raw tokens.
 */
export function encryptToken(plainTextToken: string): string {
  if (!plainTextToken) return "";
  const key = getDerivedKey(ENCRYPTION_SECRET);
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM mode
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plainTextToken, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token string (Server-side use only).
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(":")) return "";
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return "";

    const [ivHex, authTagHex, encryptedText] = parts;
    const key = getDerivedKey(ENCRYPTION_SECRET);
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}
