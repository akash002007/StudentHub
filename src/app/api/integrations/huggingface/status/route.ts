import { NextRequest, NextResponse } from "next/server";
import { getHuggingFaceConnection, getHuggingFaceDNA } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";

    const connection = getHuggingFaceConnection(userId);
    const dna = getHuggingFaceDNA(userId);

    if (!connection) {
      return NextResponse.json({
        success: true,
        connected: false,
        connection: null,
        dna: null,
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      connection: {
        id: connection.id,
        username: connection.username,
        fullname: connection.fullname,
        avatarUrl: connection.avatarUrl,
        profileUrl: connection.profileUrl,
        modelsCount: connection.modelsCount,
        datasetsCount: connection.datasetsCount,
        spacesCount: connection.spacesCount,
        totalLikes: connection.totalLikes,
        syncStatus: connection.syncStatus,
        lastSyncedAt: connection.lastSyncedAt,
        connectedAt: connection.connectedAt,
        error: connection.error,
      },
      dna,
    });
  } catch (err: any) {
    console.error("Fetch Hugging Face Status API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Hugging Face connection status." },
      { status: 500 }
    );
  }
}
