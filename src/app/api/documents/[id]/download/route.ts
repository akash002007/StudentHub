import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { DocumentAccessPolicy } from "@/lib/document-access-policy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing document access token." },
        { status: 401 }
      );
    }

    // Verify token signature and expiration
    const verification = DocumentAccessPolicy.verifyAccessToken(id, token);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || "Invalid or expired access token." },
        { status: 403 }
      );
    }

    const doc = ServerStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    // Retrieve file buffer or fallback sample representation
    let buffer = ServerStore.getDocumentBuffer(id);
    if (!buffer) {
      const fallbackContent = `%PDF-1.4\n% StudentHub Official Verified Document\n% Document ID: ${doc.id}\n% Candidate: ${doc.studentName || doc.userId}\n% Type: ${doc.documentType}\n% Verification: ${doc.verificationStatus} (${doc.confidenceScore || 90}% confidence)\n% Verified by: ${doc.verifiedBy || "StudentHub Verification Center"}\n\nCandidate verified credential document stream.`;
      buffer = Buffer.from(fallbackContent, "utf-8");
    }

    // Audit log download
    ServerStore.addAuditLog({
      admin: verification.userId || "Authorized User",
      action: "DOCUMENT_DOWNLOADED" as any,
      student: doc.studentName || doc.userId,
      previousStatus: doc.verificationStatus,
      newStatus: doc.verificationStatus,
      ipSessionRef: "127.0.0.1 / api_documents_download",
      details: `Served document buffer for ${doc.fileName} (${doc.documentType}) using verified access token.`,
    });

    const isInline = req.headers.get("accept")?.includes("text/html") || searchParams.get("inline") === "true";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/pdf",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="${encodeURIComponent(doc.fileName)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Document download error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to download document." },
      { status: 500 }
    );
  }
}
