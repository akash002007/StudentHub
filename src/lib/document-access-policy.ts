import crypto from "crypto";
import { DocumentRecord, UserRole } from "@/types";

const TOKEN_SECRET = process.env.DOCUMENT_SIGNING_SECRET || "studenthub_doc_sec_key_2026_x89a1";

export interface PolicyUser {
  id: string;
  role: UserRole | string;
  email?: string;
  collegeId?: string;
}

export class DocumentAccessPolicy {
  /**
   * Checks whether the user is authorized to view document metadata.
   */
  static canViewDocument(user: PolicyUser | null, doc: DocumentRecord): boolean {
    if (!user) return false;
    const role = (user.role || "").toUpperCase();

    // Admins and Verification Officers have unrestricted administrative access
    if (this.isStaffOrAdmin(role)) {
      return true;
    }

    // Students can view their own documents
    if (user.id === doc.userId) {
      return true;
    }

    // Recruiters can only view documents marked as shareable (e.g., Resume)
    if (this.isRecruiter(role)) {
      return doc.isShareableWithRecruiters && !doc.isSensitive;
    }

    return false;
  }

  /**
   * Checks whether the user is authorized to download or preview the actual document content.
   */
  static canDownloadDocument(user: PolicyUser | null, doc: DocumentRecord): boolean {
    return this.canViewDocument(user, doc);
  }

  /**
   * Checks whether the user has permission to verify or approve documents.
   */
  static canVerifyDocument(user: PolicyUser | null): boolean {
    if (!user) return false;
    const role = (user.role || "").toUpperCase();
    return [
      "PLATFORM_ADMIN",
      "SUPER_ADMIN",
      "ADMIN",
      "VERIFICATION_OFFICER",
      "COLLEGE_ADMIN",
    ].includes(role);
  }

  /**
   * Checks whether the user has permission to reject or request re-upload.
   */
  static canRejectDocument(user: PolicyUser | null): boolean {
    return this.canVerifyDocument(user);
  }

  /**
   * Checks whether the user is permitted to view sensitive identity documents
   * (e.g. Government ID, College ID).
   * Recruiters are strictly blocked.
   */
  static canAccessSensitiveDocument(user: PolicyUser | null, doc: DocumentRecord): boolean {
    if (!user) return false;
    const role = (user.role || "").toUpperCase();

    // Sensitive documents are NEVER accessible to recruiters
    if (this.isRecruiter(role)) {
      return false;
    }

    // Only the student owner and verified staff/admins may access sensitive docs
    if (user.id === doc.userId || this.isStaffOrAdmin(role)) {
      return true;
    }

    return false;
  }

  /**
   * Generates a tamper-proof, short-lived HMAC signed token for authorized document access.
   * Default validity: 15 minutes (900 seconds).
   */
  static generateAccessToken(
    docId: string,
    user: PolicyUser,
    expiresInSeconds: number = 900
  ): string {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = `${docId}:${user.id}:${(user.role || "").toUpperCase()}:${expiresAt}`;
    const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    const token = Buffer.from(JSON.stringify({ payload, sig: hmac })).toString("base64url");
    return token;
  }

  /**
   * Validates a temporary access token and checks its signature and expiration.
   */
  static verifyAccessToken(
    docId: string,
    token: string
  ): { valid: boolean; userId?: string; userRole?: string; error?: string } {
    try {
      if (!token) {
        return { valid: false, error: "Access token is missing." };
      }

      const decodedStr = Buffer.from(token, "base64url").toString("utf-8");
      const { payload, sig } = JSON.parse(decodedStr);

      const expectedHmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
      if (sig !== expectedHmac) {
        return { valid: false, error: "Invalid token signature." };
      }

      const [tokenDocId, userId, userRole, expiresAtStr] = payload.split(":");
      if (tokenDocId !== docId) {
        return { valid: false, error: "Token does not match requested document." };
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Math.floor(Date.now() / 1000);
      if (now > expiresAt) {
        return { valid: false, error: "Document access token has expired." };
      }

      return { valid: true, userId, userRole };
    } catch {
      return { valid: false, error: "Malformed document access token." };
    }
  }

  private static isStaffOrAdmin(role: string): boolean {
    return [
      "PLATFORM_ADMIN",
      "SUPER_ADMIN",
      "ADMIN",
      "VERIFICATION_OFFICER",
      "COLLEGE_ADMIN",
      "COLLEGE_PLACEMENT_OFFICER",
    ].includes(role);
  }

  private static isRecruiter(role: string): boolean {
    return ["RECRUITER", "COMPANY_ADMIN"].includes(role);
  }
}
