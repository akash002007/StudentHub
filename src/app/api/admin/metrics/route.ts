import { NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET() {
  const metrics = ServerStore.getMetrics();
  return NextResponse.json({ success: true, metrics });
}
