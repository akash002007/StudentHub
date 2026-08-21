import { NextRequest, NextResponse } from "next/server";
import { getCertificates, getCertificateDNA } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";

    const certificates = getCertificates(userId);
    const certificateDNA = getCertificateDNA(userId);

    return NextResponse.json({
      success: true,
      certificates,
      certificateDNA,
    });
  } catch (err: any) {
    console.error("Fetch Certificates API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates." },
      { status: 500 }
    );
  }
}
