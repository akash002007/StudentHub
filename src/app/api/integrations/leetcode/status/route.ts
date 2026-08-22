import { NextRequest, NextResponse } from "next/server";
import { getLeetCodeConnection, getLeetCodeDNA } from "@/lib/server-store";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const connection = getLeetCodeConnection(authUser.userId);
    const dna = getLeetCodeDNA(authUser.userId);

    return NextResponse.json({
      success: true,
      connected: Boolean(connection && connection.status === "VERIFIED"),
      connection,
      dna,
    });
  } catch (err: any) {
    console.error("[LeetCode Status] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch LeetCode status." },
      { status: 500 }
    );
  }
}
