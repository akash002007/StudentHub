import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";
import { CompanyStatus } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const company = ServerStore.getCompanyById(id);

  if (!company) {
    return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, company });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: actor, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, reason, name, website, industry, size, location, description, verificationTier } = body;

  const actorInfo = {
    id: actor.id,
    name: actor.name || "Platform Admin",
    role: actor.role,
  };

  if (status) {
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "A justification reason is required for company status modifications." },
        { status: 400 }
      );
    }

    const validStatuses: CompanyStatus[] = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
    }

    const res = ServerStore.updateCompanyStatus(actorInfo, id, status, reason.trim());
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      company: res.company,
      message: `Company status updated to ${status}`,
    });
  }

  // Update general metadata
  const res = ServerStore.updateCompany(actorInfo, id, {
    ...(name && { name: name.trim() }),
    ...(website && { website: website.trim() }),
    ...(industry && { industry: industry.trim() }),
    ...(size && { size: size.trim() }),
    ...(location && { location: location.trim() }),
    ...(description && { description: description.trim() }),
    ...(verificationTier && { verificationTier }),
  });

  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    company: res.company,
    message: "Company details updated successfully",
  });
}
