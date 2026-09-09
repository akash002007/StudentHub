import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Enforce strictly authorized admin or verification officer access
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;

  // Search in verification requests
  const verificationReq = ServerStore.getVerificationRequestById(id) ||
    ServerStore.getVerificationRequestByStudentId(id);

  if (!verificationReq || !verificationReq.document) {
    return NextResponse.json(
      { success: false, error: "Requested verification document not found or access denied." },
      { status: 404 }
    );
  }

  // Return secure document metadata with authorized download token/reference
  return NextResponse.json({
    success: true,
    document: {
      id: verificationReq.verificationId,
      studentId: verificationReq.studentId,
      studentName: verificationReq.student.fullName,
      fileName: verificationReq.document.fileName,
      fileSize: verificationReq.document.fileSize,
      fileType: (verificationReq.document as any).fileType || "application/pdf",
      uploadDate: verificationReq.document.uploadDate,
      downloadUrl: verificationReq.document.fileUrl || "#",
      verified: verificationReq.status === "Approved",
    },
  });
}
