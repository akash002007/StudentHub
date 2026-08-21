import { NextRequest, NextResponse } from "next/server";
import { getHuggingFaceConnection } from "@/lib/server-store";
import { enqueueHuggingFaceSync } from "@/lib/huggingface-sync-worker";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";

    const connection = getHuggingFaceConnection(userId);
    if (!connection) {
      return NextResponse.json(
        { success: false, error: "No active Hugging Face connection found." },
        { status: 404 }
      );
    }

    // Trigger non-blocking sync worker
    enqueueHuggingFaceSync(userId).catch((err) => {
      console.error("Hugging Face manual sync error:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Hugging Face sync started in background.",
      syncStatus: "SYNCING",
    });
  } catch (err: any) {
    console.error("Hugging Face Sync API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to initiate Hugging Face synchronization." },
      { status: 500 }
    );
  }
}
