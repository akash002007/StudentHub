import { NextRequest, NextResponse } from "next/server";
import { getCodeforcesConnection } from "@/lib/server-store";
import { syncCodeforcesAccount } from "@/lib/codeforces-sync-worker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || "std_default_01";

    const connection = getCodeforcesConnection(userId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: "No Codeforces account connected for this user." },
        { status: 404 }
      );
    }

    if (connection.status !== "VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Codeforces account ownership is not verified yet. Please complete ownership verification." },
        { status: 403 }
      );
    }

    // Trigger non-blocking sync worker
    syncCodeforcesAccount(userId, connection.handle).catch((err) => {
      console.error("Codeforces manual sync error:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Codeforces sync job queued in background.",
      handle: connection.handle,
    });
  } catch (err: any) {
    console.error("Codeforces Sync API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to trigger Codeforces sync." },
      { status: 500 }
    );
  }
}
