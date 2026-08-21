import { NextRequest, NextResponse } from "next/server";
import { getCodeforcesConnection, getCodeforcesDNA } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const connection = getCodeforcesConnection(userId);
  const dna = getCodeforcesDNA(userId);

  return NextResponse.json({
    success: true,
    connected: Boolean(connection && connection.syncStatus !== "FAILED"),
    connection,
    dna,
  });
}
