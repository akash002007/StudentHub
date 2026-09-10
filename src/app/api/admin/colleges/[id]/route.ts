import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { requireRole } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  const { id: collegeId } = await params;
  const college = ServerStore.getCollegeById(collegeId);
  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 404 });
  }

  const metrics = ServerStore.getCollegeMetrics(collegeId);
  const departments = ServerStore.getCollegeDepartments(collegeId);
  const batches = ServerStore.getCollegeBatches(collegeId);
  const students = ServerStore.getCollegeStudents(collegeId);

  return NextResponse.json({
    success: true,
    college,
    metrics,
    departments,
    batches,
    studentCount: students.length,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole(req, [
    "PLATFORM_ADMIN",
    "SUPER_ADMIN",
    "ADMIN",
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id: collegeId } = await params;
    const body = await req.json();

    const existing = ServerStore.getCollegeById(collegeId);
    if (!existing) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const updated = ServerStore.updateCollege(collegeId, body);

    return NextResponse.json({
      success: true,
      college: updated,
      message: "College details updated successfully",
    });
  } catch (err) {
    console.error("[PATCH /api/admin/colleges/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
