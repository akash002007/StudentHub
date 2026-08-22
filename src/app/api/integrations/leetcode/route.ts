import { NextRequest, NextResponse } from "next/server";
import {
  deleteLeetCodeConnection,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const deleted = deleteLeetCodeConnection(authUser.userId);

    if (deleted) {
      // Recalculate Career DNA after LeetCode is disconnected
      const repos = getGitHubRepositories(authUser.userId);
      const existingDNA = getCareerDNA(authUser.userId);
      const featuredProjects = existingDNA?.featuredProjects || [];
      const skillEvidences = existingDNA?.skillEvidences || [];

      CareerDNABuilder.compileCareerDNA(
        authUser.userId,
        featuredProjects,
        skillEvidences,
        repos
      );
    }

    console.log(
      `[LeetCode Disconnect] authenticated: true, connectionFound: true, databaseUpdated: true, success: true, userId: ${authUser.userId}`
    );

    return NextResponse.json({
      success: true,
      message: "LeetCode account disconnected successfully.",
    });
  } catch (err: any) {
    console.error("[LeetCode Disconnect] API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect LeetCode account." },
      { status: 500 }
    );
  }
}
