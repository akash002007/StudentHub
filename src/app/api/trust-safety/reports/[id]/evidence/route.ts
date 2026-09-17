import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { getAuthenticatedUser } from "@/lib/auth-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const report = TrustSafetyEngine.getReportById(id);
  if (!report) {
    return NextResponse.json({ success: false, error: `Report ${id} not found` }, { status: 404 });
  }

  const roleUpper = (user.role || "").toUpperCase();
  const isAdmin = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER"].includes(roleUpper);

  // Non-admins can only add evidence to their own reports
  if (!isAdmin && report.reporterId !== user.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type, fileUrl, fileName, fileSize, description } = body;

    if (!type || (!fileUrl && !description)) {
      return NextResponse.json(
        { success: false, error: "Evidence type and either file URL or description are required." },
        { status: 400 }
      );
    }

    const res = TrustSafetyEngine.addEvidence(
      id,
      {
        type,
        fileUrl,
        fileName,
        fileSize,
        description,
        uploadedBy: user.name || "Reporter",
      },
      user.name || "Reporter"
    );

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Evidence attached successfully.",
      evidence: res.evidence,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to attach evidence" }, { status: 500 });
  }
}
