import { NextRequest, NextResponse } from "next/server";
import {
  getGitHubConnection,
  deleteGitHubConnection,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUserId = searchParams.get("userId");
  const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
  const userId = authUser?.userId || rawUserId || "std_default_01";

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
  try {
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

    const authUser = await getAuthenticatedUser(request, userId || undefined);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const targetUserId = authUser.userId;
    const existingConn = getGitHubConnection(targetUserId);

    const deleted = deleteGitHubConnection(targetUserId);

    if (deleted) {
      // Recalculate Career DNA after GitHub is disconnected
      const repos = getGitHubRepositories(targetUserId);
      const existingDNA = getCareerDNA(targetUserId);
      const featuredProjects = existingDNA?.featuredProjects || [];
      const skillEvidences = existingDNA?.skillEvidences || [];

      CareerDNABuilder.compileCareerDNA(
        targetUserId,
        featuredProjects,
        skillEvidences,
        repos
      );
    }

    console.log(
      `[GitHub Disconnect] authenticated: true, connectionFound: ${Boolean(
        existingConn
      )}, tokenRemoved: true, connectionRemoved: true, userId: ${targetUserId}`
    );

    return NextResponse.json({
      success: true,
      deleted,
      message: "GitHub account disconnected successfully.",
    });
  } catch (err: any) {
    console.error("GitHub Disconnect API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect GitHub account." },
      { status: 500 }
    );
  }
}
