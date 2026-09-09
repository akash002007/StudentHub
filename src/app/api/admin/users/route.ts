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
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;

  const users = ServerStore.getAllUsers({ search, role, status });

  return NextResponse.json({
    success: true,
    count: users.length,
    users,
  });
}
