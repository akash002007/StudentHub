import { NextRequest, NextResponse } from "next/server";
import { getLeetCodeConnection } from "@/lib/server-store";
import { syncLeetCodeAccount } from "@/lib/leetcode-sync-worker";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request, body.userId);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const connection = getLeetCodeConnection(authUser.userId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: "No LeetCode account connected for this user." },
        { status: 404 }
      );
    }

    if (connection.status !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "LeetCode account ownership is not verified yet. Please complete ownership verification.",
        },
        { status: 403 }
      );
    }

    console.log(
      `[LeetCode Sync] authenticated: true, connectionFound: true, connectionVerified: true, leetcodeId: ${connection.leetcodeId}`
    );

    // Run sync and wait for completion to provide instant refreshed stats
    const updatedConn = await syncLeetCodeAccount(authUser.userId, connection.leetcodeId);

    if (updatedConn.syncStatus === "FAILED") {
      return NextResponse.json(
        {
          success: false,
          error: updatedConn.error || "LeetCode synchronization encountered an error. Previous statistics preserved.",
          connection: updatedConn,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "LeetCode account synchronized successfully.",
      leetcodeId: connection.leetcodeId,
      connection: updatedConn,
    });
  } catch (err: any) {
    console.error("[LeetCode Sync] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to trigger LeetCode synchronization." },
      { status: 500 }
    );
  }
}
