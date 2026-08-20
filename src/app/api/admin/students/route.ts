import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || undefined;
  const status = searchParams.get("status") || undefined;

  const students = ServerStore.getAllStudents(query, status);
  return NextResponse.json({ success: true, count: students.length, students });
}
