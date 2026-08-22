import { NextRequest, NextResponse } from "next/server";
import { getCodeforcesConnection } from "@/lib/server-store";
import { syncCodeforcesAccount } from "@/lib/codeforces-sync-worker";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request, body.userId);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const connection = getCodeforcesConnection(authUser.userId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: "No Codeforces account connected for this user." },
        { status: 404 }
      );
    }

    if (connection.status !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Codeforces account ownership is not verified yet. Please complete ownership verification.",
        },
        { status: 403 }
      );
    }

    // Run sync worker
    const updatedConn = await syncCodeforcesAccount(authUser.userId, connection.handle);

    if (updatedConn.syncStatus === "FAILED") {
      return NextResponse.json(
        {
          success: false,
          error: updatedConn.error || "Codeforces synchronization encountered an error.",
          connection: updatedConn,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Codeforces account synchronized successfully.",
      handle: connection.handle,
      connection: updatedConn,
    });
  } catch (err: any) {
    console.error("Codeforces Sync API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to trigger Codeforces sync." },
      { status: 500 }
    );
  }
}
