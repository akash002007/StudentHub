import { NextRequest, NextResponse } from "next/server";
import { saveCertificate, getCertificates } from "@/lib/server-store";
import { enqueueCertificateAnalysis } from "@/lib/certificate-analysis-worker";
import { CertificateRecord } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "std_default_01";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a certificate file to upload." },
        { status: 400 }
      );
    }

    const fileName = file.name || "Certificate.pdf";
    const fileType = file.type || "application/pdf";
    const fileSize = file.size;

    // 1. Extension Validation
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const isExtensionValid = validExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext)
    );

    // 2. MIME Validation
    const validMimes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    const isMimeValid = validMimes.includes(fileType);

    if (!isExtensionValid && !isMimeValid) {
      return NextResponse.json(
        { success: false, error: "Please upload a valid PDF, PNG, JPG, or JPEG certificate." },
        { status: 400 }
      );
    }

    // 3. Size Validation (10MB limit)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Certificate file size must be less than 10 MB." },
        { status: 400 }
      );
    }

    if (fileSize === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded certificate file is empty." },
        { status: 400 }
      );
    }

    // 4. Duplicate Check
    const existingCerts = getCertificates(userId);
    const isDuplicate = existingCerts.some(
      (c) => c.fileName === fileName && c.fileSizeBytes === fileSize
    );
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: "This certificate already exists in your profile." },
        { status: 400 }
      );
    }

    // Convert file to Buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const now = new Date().toISOString();
    const sizeStr = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    const certId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create new CertificateRecord in PROCESSING state
    const newRecord: CertificateRecord = {
      id: certId,
      userId,
      fileName,
      fileType,
      fileSizeBytes: fileSize,
      fileSize: sizeStr,
      fileUrl: `#${certId}`,
      recipientName: "Extracting...",
      certificateTitle: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      courseName: "Analyzing Certificate Document...",
      issuerName: "Pending Verification",
      issueDate: null,
      expiryDate: null,
      certificateId: null,
      credentialId: null,
      verificationUrl: null,
      qrData: null,
      skills: [],
      identityMatchStatus: "UNKNOWN",
      issuerVerificationStatus: "UNRECOGNIZED",
      credentialVerificationStatus: "UNAVAILABLE",
      documentIntegrityStatus: "INSUFFICIENT_EVIDENCE",
      digitalSignatureStatus: "NO_DIGITAL_SIGNATURE",
      verificationStatus: "UNABLE_TO_VERIFY",
      verificationConfidence: "LOW",
      evidenceStatements: ["Processing document text & verification evidence..."],
      status: "PROCESSING",
      uploadedAt: now,
      analyzedAt: null,
      error: null,
    };

    saveCertificate(userId, newRecord);

    // 5. Enqueue Non-Blocking Background Analysis
    enqueueCertificateAnalysis(userId, certId, buffer).catch((err) => {
      console.error("Background certificate analysis error:", err);
    });

    return NextResponse.json({
      success: true,
      certId,
      status: "PROCESSING",
      message: "Certificate uploaded successfully. Certificate Intelligence analysis is processing in the background.",
      record: newRecord,
    });
  } catch (err: any) {
    console.error("Certificate Upload API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload certificate document." },
      { status: 500 }
    );
  }
}
