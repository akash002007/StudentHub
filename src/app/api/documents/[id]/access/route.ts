import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { DocumentAccessPolicy } from "@/lib/document-access-policy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await getAuthenticatedUser(req);

    const doc = ServerStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    const policyUser = user || { id: "anonymous", role: "GUEST" };

    // 1. Can view/download check
    if (!DocumentAccessPolicy.canDownloadDocument(policyUser, doc)) {
      return NextResponse.json(
        {
          success: false,
          error:
            doc.isSensitive && ["RECRUITER", "COMPANY_ADMIN"].includes((policyUser.role || "").toUpperCase())
              ? "Access denied: Recruiters are not permitted to access student sensitive identity documents."
              : "Unauthorized to access this document.",
        },
        { status: 403 }
      );
    }

    // 2. Generate short-lived signed access token (15 minutes)
    const token = DocumentAccessPolicy.generateAccessToken(id, policyUser, 900);
    const accessUrl = `/api/documents/${id}/download?token=${encodeURIComponent(token)}`;

    // Audit log access
    ServerStore.addAuditLog({
      admin: policyUser.id,
      action: "DOCUMENT_ACCESSED" as any,
      student: doc.studentName || doc.userId,
      previousStatus: doc.verificationStatus,
      newStatus: doc.verificationStatus,
      ipSessionRef: "127.0.0.1 / api_documents_access",
      details: `Generated temporary secure access URL for ${doc.fileName} (${doc.documentType}). Valid for 15 minutes.`,
    });

    return NextResponse.json({
      success: true,
      documentId: id,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      accessUrl,
      token,
      expiresInSeconds: 900,
    });
  } catch (err: any) {
    console.error("Document access API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate document access authorization." },
      { status: 500 }
    );
  }
}
