import { TrustSafetyEntityType, ReportPriority } from "@/types";

export const CATEGORIES_BY_ENTITY_TYPE: Record<TrustSafetyEntityType, string[]> = {
  RECRUITER: [
    "Scam / Fraud",
    "Asking for money / fees",
    "Fake job or internship",
    "Misleading opportunity details",
    "Harassment / Inappropriate conduct",
    "Spam / Unsolicited messages",
    "Impersonation / Fake recruiter",
    "Unprofessional behavior",
    "Other",
  ],
  COMPANY: [
    "Fraudulent / Shell company",
    "Asking for payment / deposits",
    "Fake listings",
    "Deceptive working conditions",
    "Harassment / Labor law violation",
    "Impersonation of real enterprise",
    "Unresponsive / Ghosting drives",
    "Other",
  ],
  OPPORTUNITY: [
    "Fake opportunity",
    "Scam / Pyramid scheme",
    "Asking for payment / course purchase",
    "Misleading role / salary information",
    "Duplicate opportunity",
    "Inappropriate content",
    "Unsafe work environment",
    "Other",
  ],
  JOB: [
    "Fake job",
    "Scam / Money extraction",
    "Asking for payment / deposits",
    "Misleading compensation",
    "Inappropriate content",
    "Other",
  ],
  INTERNSHIP: [
    "Fake internship",
    "Unpaid bond / Contract trapping",
    "Asking for certificate fee",
    "Misleading learning scope",
    "Inappropriate content",
    "Other",
  ],
  STUDENT: [
    "Fake profile / identity fraud",
    "Fake certificate or credential",
    "Application fraud / Plagiarism",
    "Misrepresentation of qualifications",
    "Harassment / Threatening messages",
    "Spam / Bot behavior",
    "Other",
  ],
  PROFILE: [
    "Impersonation",
    "Fake bio / Credentials",
    "Offensive material",
    "Spam",
    "Other",
  ],
  MESSAGE: [
    "Harassment / Threatening language",
    "Payment / Scam solicitation",
    "Offensive / Inappropriate content",
    "Phishing link / Malware",
    "Spam",
    "Other",
  ],
  CERTIFICATE: [
    "Forged / Fake document",
    "Tampered verification hash",
    "Misrepresented issuer",
    "Duplicate submission",
    "Other",
  ],
  REVIEW: [
    "Fake / Manipulated review",
    "Defamatory content",
    "Harassment",
    "Spam",
    "Other",
  ],
  OTHER: [
    "Platform abuse",
    "Security vulnerability attempt",
    "Terms of service violation",
    "Other",
  ],
};

export function determineInitialPriority(category: string, entityType: TrustSafetyEntityType): ReportPriority {
  const catLower = category.toLowerCase();
  if (
    catLower.includes("asking for money") ||
    catLower.includes("payment") ||
    catLower.includes("fee") ||
    catLower.includes("deposit") ||
    catLower.includes("threat") ||
    catLower.includes("harass") ||
    catLower.includes("shell company") ||
    catLower.includes("pyramid")
  ) {
    return "CRITICAL";
  }
  if (
    catLower.includes("fake") ||
    catLower.includes("fraud") ||
    catLower.includes("forged") ||
    catLower.includes("phishing") ||
    catLower.includes("impersonat") ||
    catLower.includes("tampered")
  ) {
    return "HIGH";
  }
  if (catLower.includes("spam") || catLower.includes("mislead") || catLower.includes("duplicate")) {
    return "MEDIUM";
  }
  return "LOW";
}
