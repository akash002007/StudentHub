import { NextRequest, NextResponse } from "next/server";
import {
  deleteHuggingFaceConnection,
  getHuggingFaceConnection,
  getGitHubRepositories,
  getCareerDNA,
} from "@/lib/server-store";
import { CareerDNABuilder } from "@/lib/career-dna";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "std_default_01";

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

    return NextResponse.json({
      success: true,
      message: "Hugging Face account disconnected successfully. Career DNA updated.",
    });
  } catch (err: any) {
    console.error("Hugging Face Disconnect API Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect Hugging Face account." },
      { status: 500 }
    );
  }
}
