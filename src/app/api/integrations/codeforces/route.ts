import { NextRequest, NextResponse } from "next/server";
import {
  deleteCodeforcesConnection,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-server";
import { requireVerifiedStudent } from "@/lib/student-access-server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return unauthorizedResponse();
    }

    const verificationCheck = await requireVerifiedStudent(request, authUser.userId);
    if (!verificationCheck.authorized) {
      return verificationCheck.errorResponse;
    }

    const deleted = deleteCodeforcesConnection(authUser.userId);

    if (deleted) {
      // Recalculate Career DNA after Codeforces is disconnected
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

    return NextResponse.json({
      success: true,
      message: "Codeforces account disconnected successfully.",
    });
  } catch (err: any) {
    console.error("Codeforces Disconnect API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect Codeforces account." },
      { status: 500 }
    );
  }
}
