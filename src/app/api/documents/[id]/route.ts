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

    // Role-based document access check
    if (!DocumentAccessPolicy.canViewDocument(user, doc)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Access to this document is restricted." },
        { status: 403 }
      );
    }

    const attempts = ServerStore.getVerificationAttempts(id);

    return NextResponse.json({
      success: true,
      document: {
        ...doc,
        attempts,
      },
    });
  } catch (err: any) {
    console.error("Document GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load document details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const userRole = (user?.role || "STUDENT").toUpperCase();
    const isStaff = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER"].includes(userRole);

    // Student can only delete own document
    if (!isStaff && user?.id !== doc.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only delete your own documents." },
        { status: 403 }
      );
    }

    const deleted = ServerStore.deleteDocument(doc.userId, id);
    if (deleted) {
      ServerStore.addAuditLog({
        admin: user?.name || userRole,
        action: "STUDENT_UPDATED_PROFILE" as any,
        student: doc.studentName || doc.userId,
        previousStatus: doc.verificationStatus,
        newStatus: "DELETED",
        ipSessionRef: "127.0.0.1 / api_documents_delete",
        details: `Deleted document ${doc.fileName} (${doc.documentType}).`,
      });

      return NextResponse.json({
        success: true,
        message: "Document deleted successfully.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete document." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Document DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
