import { NextRequest, NextResponse } from "next/server";
import { getCareerDNA } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const dna = getCareerDNA(userId);
  if (!dna) {
    return NextResponse.json({
      exists: false,
      careerDNA: null,
    });
  }

  return NextResponse.json({
    exists: true,
    careerDNA: dna,
  });
}
