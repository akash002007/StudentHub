import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "COLLEGE_ADMIN",
    "VERIFICATION_OFFICER",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  const companies = ServerStore.getAllCompanies({ search, status });

  return NextResponse.json({
    success: true,
    count: companies.length,
    companies,
  });
}

export async function POST(req: NextRequest) {
  const { user: actor, errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, website, industry, size, location, description, status = "PENDING", verificationTier = "UNVERIFIED" } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, error: "Company name is required." }, { status: 400 });
  }

  const actorInfo = {
    id: actor.id,
    name: actor.name || "Platform Admin",
    role: actor.role,
  };

  const res = ServerStore.createCompany(actorInfo, {
    name: name.trim(),
    website: website?.trim() || "",
    industry: industry?.trim() || "Technology",
    size: size?.trim() || "10-50 employees",
    location: location?.trim() || "Remote",
    description: description?.trim() || "",
    status,
    verificationTier,
  });

  return NextResponse.json({ success: true, company: res.company }, { status: 201 });
}
