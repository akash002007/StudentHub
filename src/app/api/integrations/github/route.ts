import { NextRequest, NextResponse } from "next/server";
import {
  getGitHubConnection,
  deleteGitHubConnection,
} from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "std_default_01";

  const record = getGitHubConnection(userId);

  if (!record) {
    return NextResponse.json({
      connected: false,
      connection: null,
    });
  }

  // Sanitized connection object for frontend (Never exposes accessTokenEncrypted)
  const connection = {
    id: record.id,
    userId: record.userId,
    githubUserId: record.githubUserId,
    githubUsername: record.githubUsername,
    githubDisplayName: record.githubDisplayName,
    githubAvatarUrl: record.githubAvatarUrl,
    githubProfileUrl: record.githubProfileUrl,
    connectedAt: record.connectedAt,
    updatedAt: record.updatedAt,
  };

  return NextResponse.json({
    connected: true,
    connection,
  });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let userId = searchParams.get("userId");

  if (!userId) {
    try {
      const body = await request.json();
      userId = body.userId;
    } catch {
      // Ignore body parsing error
    }
  }

  if (!userId) {
    userId = "std_default_01";
  }

  const deleted = deleteGitHubConnection(userId);

  return NextResponse.json({
    success: true,
    deleted,
    message: deleted
      ? "GitHub account disconnected successfully."
      : "No active GitHub connection found.",
  });
}
