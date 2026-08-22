import { NextRequest, NextResponse } from "next/server";
import {
  deleteHuggingFaceConnection,
  getHuggingFaceConnection,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get("userId");

    const authUser = await getAuthenticatedUser(request, rawUserId || undefined);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const userId = authUser.userId;
    const conn = getHuggingFaceConnection(userId);
    if (!conn) {
      return NextResponse.json(
        { success: false, error: "No active Hugging Face connection found to disconnect." },
        { status: 404 }
      );
    }

    // 1. Delete Hugging Face connection and HuggingFaceDNA from server store
    deleteHuggingFaceConnection(userId);

    // 2. Automatically recalculate Overall Career DNA without Hugging Face evidence
    const repos = getGitHubRepositories(userId);
    const existingDNA = getCareerDNA(userId);
    const featuredProjects = existingDNA?.featuredProjects || [];
    const skillEvidences = existingDNA?.skillEvidences || [];

    CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);

    console.log(
      `[Hugging Face Disconnect] authenticated: true, connectionFound: true, tokenRemoved: true, connectionRemoved: true, userId: ${userId}`
    );

    return NextResponse.json({
      success: true,
      message: "Hugging Face account disconnected successfully. Career DNA updated.",
    });
  } catch (err: any) {
    console.error("[Hugging Face Disconnect] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect Hugging Face account." },
      { status: 500 }
    );
  }
}
