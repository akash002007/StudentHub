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
  const method = searchParams.get("method") || undefined;
  const risk = searchParams.get("risk") || undefined;
  const sort = searchParams.get("sort") || undefined;

  const requests = ServerStore.getAllVerificationRequests({
    search,
    status,
    method,
    risk,
    sort,
  });

  return NextResponse.json({ success: true, count: requests.length, requests });
}
