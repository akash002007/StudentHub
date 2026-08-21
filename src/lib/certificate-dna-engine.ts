import { CertificateRecord, CertificateDNA } from "@/types";

export class CertificateDNAEngine {
  /**
   * Synthesizes student's verified certificate records into structured CertificateDNA.
   */
  static compileCertificateDNA(certificates: CertificateRecord[]): CertificateDNA {
    const totalCertificates = certificates.length;

    let verifiedCount = 0;
    let partiallyVerifiedCount = 0;
    let unableToVerifyCount = 0;
    let suspiciousCount = 0;

    const skillCounts: Record<string, number> = {};
    const evidenceList: CertificateDNA["evidence"] = [];

    for (const cert of certificates) {
      if (cert.status !== "COMPLETED") continue;

      if (cert.verificationStatus === "VERIFIED") {
        verifiedCount++;
      } else if (cert.verificationStatus === "PARTIALLY_VERIFIED") {
        partiallyVerifiedCount++;
      } else if (cert.verificationStatus === "UNABLE_TO_VERIFY") {
        unableToVerifyCount++;
      } else if (cert.verificationStatus === "SUSPICIOUS") {
        suspiciousCount++;
        continue; // SUSPICIOUS certificates do NOT contribute to skills or evidence
      }

      // Aggregate skills from VERIFIED and PARTIALLY_VERIFIED certificates
      if (cert.verificationStatus === "VERIFIED" || cert.verificationStatus === "PARTIALLY_VERIFIED") {
        for (const skill of cert.skills) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;

          evidenceList.push({
            id: `ev_cert_${cert.id}_${skill.toLowerCase().replace(/\s+/g, "_")}`,
            entity: cert.courseName || cert.certificateTitle,
            skill,
            text: `Verified ${cert.verificationStatus === "VERIFIED" ? "credential" : "certificate"} issued by ${cert.issuerName} (${cert.courseName})`,
            confidence: cert.verificationConfidence === "HIGH" ? 95 : 80,
            source: "Certificate",
          });
        }
      }
    }

    // Top verified skills
    const topVerifiedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, certificateCount: count }));

    // Deterministic Certificate DNA score (0 - 100)
    // Verified cert = 25 pts each (max 75 pts), Partially verified cert = 15 pts each (max 45 pts), Skill breadth bonus (max 25 pts)
    const rawScore =
      verifiedCount * 25 +
      partiallyVerifiedCount * 15 +
      Math.min(Object.keys(skillCounts).length * 5, 25);

    const score = totalCertificates === 0 ? 0 : Math.min(Math.max(rawScore, 40), 98);

    return {
      score,
      totalCertificates,
      verifiedCount,
      partiallyVerifiedCount,
      unableToVerifyCount,
      suspiciousCount,
      topVerifiedSkills,
      evidence: evidenceList,
    };
  }
}
