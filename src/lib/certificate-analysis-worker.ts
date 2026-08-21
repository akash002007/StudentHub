import {
  getCertificateById,
  saveCertificate,
  getCertificates,
  saveCertificateDNA,
  getStudentProfile,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CertificateParser } from "@/lib/certificate-parser";
import { CertificateVerificationEngine } from "@/lib/certificate-verification-engine";
import { CertificateDNAEngine } from "@/lib/certificate-dna-engine";
import { CareerDNABuilder } from "@/lib/career-dna";
import { CertificateRecord } from "@/types";

/**
 * Non-blocking background worker for Certificate Intelligence & Verification:
 * 1. Extracts PDF/Image document text & metadata
 * 2. Evaluates 9 independent verification evidence dimensions
 * 3. Saves CertificateRecord with verification status
 * 4. Compiles CertificateDNA
 * 5. Synthesizes into Overall Career DNA
 */
export async function enqueueCertificateAnalysis(
  userId: string,
  certId: string,
  buffer: Buffer
): Promise<CertificateRecord> {
  const record = getCertificateById(userId, certId);
  if (!record) {
    throw new Error(`Certificate record "${certId}" not found for user "${userId}".`);
  }

  const studentProfile = getStudentProfile(userId);
  const now = new Date().toISOString();

  try {
    // 1. Document Text & Metadata Extraction
    const extractedText = await CertificateParser.extractText(buffer, record.fileName, record.fileType);
    const parsedData = CertificateParser.parseCertificateMetadata(extractedText, record.fileName, studentProfile?.name);

    // 2. Multi-Dimensional Verification Evaluation
    const verificationResult = CertificateVerificationEngine.evaluateCertificate(
      parsedData,
      record.fileName,
      buffer,
      studentProfile
    );

    // 3. Update CertificateRecord
    const updatedRecord: CertificateRecord = {
      ...record,
      recipientName: parsedData.recipientName,
      certificateTitle: parsedData.certificateTitle,
      courseName: parsedData.courseName,
      issuerName: parsedData.issuerName,
      issueDate: parsedData.issueDate,
      expiryDate: parsedData.expiryDate,
      certificateId: parsedData.certificateId,
      credentialId: parsedData.credentialId,
      verificationUrl: parsedData.verificationUrl,
      qrData: parsedData.qrData,
      skills: parsedData.skills,
      identityMatchStatus: verificationResult.identityMatchStatus,
      issuerVerificationStatus: verificationResult.issuerVerificationStatus,
      credentialVerificationStatus: verificationResult.credentialVerificationStatus,
      documentIntegrityStatus: verificationResult.documentIntegrityStatus,
      digitalSignatureStatus: verificationResult.digitalSignatureStatus,
      verificationStatus: verificationResult.verificationStatus,
      verificationConfidence: verificationResult.verificationConfidence,
      evidenceStatements: verificationResult.evidenceStatements,
      status: "COMPLETED",
      analyzedAt: now,
      error: null,
    };

    saveCertificate(userId, updatedRecord);

    // 4. Compile CertificateDNA
    const allCertificates = getCertificates(userId);
    const certificateDNA = CertificateDNAEngine.compileCertificateDNA(allCertificates);
    saveCertificateDNA(userId, certificateDNA);

    // 5. Automatically recalculate Overall Career DNA
    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    console.log(`Certificate analysis COMPLETED for user ${userId}, cert ${certId}, status: ${updatedRecord.verificationStatus}`);
    return updatedRecord;
  } catch (err: any) {
    console.error(`Certificate analysis FAILED for user ${userId}, cert ${certId}:`, err);

    record.status = "FAILED";
    record.error = err.message || "Failed to analyze certificate document.";
    saveCertificate(userId, record);

    return record;
  }
}
