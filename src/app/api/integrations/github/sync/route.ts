import { NextRequest, NextResponse } from "next/server";
import { getGitHubConnection } from "@/lib/server-store";
import { enqueueGitHubSync, isGitHubSyncRunning } from "@/lib/github-sync-worker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    const userId = body.userId || searchParams.get("userId") || "std_default_01";

    const connection = getGitHubConnection(userId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: "GitHub account is not connected." },
        { status: 400 }
      );
    }

    if (isGitHubSyncRunning(userId)) {
      return NextResponse.json({
        success: true,
        status: "SYNC_ALREADY_IN_PROGRESS",
        message: "GitHub synchronization is already running in the background.",
      });
    }

    // Enqueue non-blocking background job
    enqueueGitHubSync(userId);

    return NextResponse.json({
      success: true,
      status: "SYNC_QUEUED",
      message: "GitHub synchronization job queued successfully.",
    });
  } catch (error: any) {
    console.error("Manual GitHub sync trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to queue GitHub sync job." },
      { status: 500 }
    );
  }
}
