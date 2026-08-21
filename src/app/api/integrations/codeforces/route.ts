import { NextRequest, NextResponse } from "next/server";
import { deleteCodeforcesConnection, getGitHubRepositories, getCareerDNA } from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "std_default_01";

    const deleted = deleteCodeforcesConnection(userId);

    if (deleted) {
      // Recalculate Career DNA after Codeforces is disconnected
      const repos = getGitHubRepositories(userId);
      const existingDNA = getCareerDNA(userId);
      const featuredProjects = existingDNA?.featuredProjects || [];
      const skillEvidences = existingDNA?.skillEvidences || [];

      CareerDNABuilder.compileCareerDNA(userId, featuredProjects, skillEvidences, repos);
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
