import { StudentProfile, User, AccountAccessStatus } from "@/types";

export type NormalizedVerificationState =
  | "UNVERIFIED"
  | "PROCESSING"
  | "VERIFICATION_FAILED"
  | "MANUAL_REVIEW_REQUESTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

/**
 * Normalizes any legacy or case-variant verification status into one of the 7 canonical states.
 */
export function normalizeVerificationStatus(
  rawStatus?: string | null
): NormalizedVerificationState {
  if (!rawStatus) return "UNVERIFIED";

  const s = rawStatus.trim().toLowerCase();

  if (s === "approved" || s === "verified" || s === "auto_verified") {
    return "VERIFIED";
  }
  if (s === "under_review") {
    return "UNDER_REVIEW";
  }
  if (s === "manual_review_requested" || s === "pending") {
    return "MANUAL_REVIEW_REQUESTED";
  }
  if (s === "verification_failed" || s === "reupload_required") {
    return "VERIFICATION_FAILED";
  }
  if (s === "rejected") {
    return "REJECTED";
  }
  if (s === "processing") {
    return "PROCESSING";
  }

  return "UNVERIFIED";
}

/**
 * Authoritative Account Access Status
 * Returns 'ACTIVE' if student is verified, otherwise 'RESTRICTED'.
 * Non-student roles always have 'ACTIVE' access for their respective portals.
 */
export function getStudentAccessStatus(
  user: StudentProfile | User | null | undefined
): AccountAccessStatus {
  if (!user) return "RESTRICTED";

  // Recruiter, Admin, College have their own RBAC and are not restricted by student verification
  const role = ((user as any).role || "").toLowerCase();
  if (role && role !== "student") {
    return "ACTIVE";
  }

  // Check explicit override if set
  const student = user as StudentProfile;
  if (student.accountAccessStatus === "RESTRICTED") {
    return "RESTRICTED";
  }

  const norm = normalizeVerificationStatus(student.verificationStatus);
  if (norm === "VERIFIED") {
    return "ACTIVE";
  }

  return "RESTRICTED";
}

/**
 * Returns true if student is verified and has ACTIVE account access.
 */
export function isStudentVerified(
  user: StudentProfile | User | null | undefined
): boolean {
  if (!user) return false;
  const role = ((user as any).role || "").toLowerCase();
  if (role && role !== "student") return true;

  const student = user as StudentProfile;
  const norm = normalizeVerificationStatus(student.verificationStatus);
  return norm === "VERIFIED" && getStudentAccessStatus(student) === "ACTIVE";
}

/**
 * Verification Access Matrix Checks (Section 24)
 */

export function canAccessStudentWorkspace(
  user: StudentProfile | User | null | undefined
): boolean {
  // Always allow entry to workspace; dashboard layout renders restricted UI / banner if not verified
  return Boolean(user);
}

export function canAccessCareerDNA(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canEditCareerDNA(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canAccessConnectedAccounts(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canModifyConnectedAccounts(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canApplyForInternship(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canApplyForJob(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canAccessRecruitment(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canAccessStudentFeatures(
  user: StudentProfile | User | null | undefined
): boolean {
  return isStudentVerified(user);
}

export function canAccessDocuments(
  user: StudentProfile | User | null | undefined
): boolean {
  // Always allowed so students can see submitted documents and receipts
  return Boolean(user);
}

export function canAccessVerification(
  user: StudentProfile | User | null | undefined
): boolean {
  // Always allowed
  return Boolean(user);
}

export function canEditProfile(
  user: StudentProfile | User | null | undefined
): boolean {
  // Safe / basic profile editing allowed
  return Boolean(user);
}

