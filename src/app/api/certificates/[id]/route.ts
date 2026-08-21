import { NextRequest, NextResponse } from "next/server";
import {
  getCertificateById,
  deleteCertificate,
  getCertificates,
  saveCertificateDNA,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CertificateDNAEngine } from "@/lib/certificate-dna-engine";
import { CareerDNABuilder } from "@/lib/career-dna";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";
    const certId = params.id;

    const cert = getCertificateById(userId, certId);
    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: cert,
    });
  } catch (err: any) {
    console.error("Get Certificate API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";
    const certId = params.id;

    const cert = getCertificateById(userId, certId);
    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate record not found." },
        { status: 404 }
      );
    }

    deleteCertificate(userId, certId);

    // Re-compile CertificateDNA & CareerDNA
    const remainingCerts = getCertificates(userId);
    const certDNA = CertificateDNAEngine.compileCertificateDNA(remainingCerts);
    saveCertificateDNA(userId, certDNA);

    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully. Certificate DNA updated.",
    });
  } catch (err: any) {
    console.error("Delete Certificate API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate." },
      { status: 500 }
    );
  }
}
