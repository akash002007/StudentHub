import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { CalendarEngine } from "@/lib/calendar-engine";
import { getInterviews, getAssessments } from "@/lib/recruitment-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.userId || request.headers.get("x-user-id") || "student_01";
    const role = (authUser?.role || request.headers.get("x-user-role") || "student").toUpperCase();

    const { id } = await params;

    // 1. Search across interviews
    const allInterviews = getInterviews("all");
    const intRecord = allInterviews.find((i) => i.id === id);

    if (intRecord) {
      // RBAC check: Student can only view their own interview
      if (role === "STUDENT" && intRecord.studentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const event = CalendarEngine.mapInterviewToCalendarEvent(intRecord, {
        userRole: role === "STUDENT" ? "student" : "recruiter",
      });
      return NextResponse.json({ success: true, event });
    }

    // 2. Search across assessments
    const allAssessments = getAssessments("all");
    const assessRecord = allAssessments.find((a) => a.id === id);
    if (assessRecord) {
      if (role === "STUDENT" && assessRecord.studentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const event = CalendarEngine.mapAssessmentToCalendarEvent(assessRecord);
      return NextResponse.json({ success: true, event });
    }

    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  } catch (err) {
    console.error("[GET /api/calendar/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const role = (authUser?.role || "recruiter").toUpperCase();

    // Students are not permitted to reschedule/cancel official company interview rounds directly
    if (role === "STUDENT") {
      return NextResponse.json(
        { error: "Forbidden: Candidates cannot directly reschedule corporate interview slots." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, date, time, reason } = body;

    if (action === "RESCHEDULE") {
      if (!date || !time) {
        return NextResponse.json({ error: "date and time are required for rescheduling" }, { status: 400 });
      }
      const updated = CalendarEngine.rescheduleInterview(id, date, time, reason);
      if (!updated) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, interview: updated, message: "Interview rescheduled successfully" });
    } else if (action === "CANCEL") {
      const updated = CalendarEngine.cancelInterview(id, reason);
      if (!updated) {
        return NextResponse.json({ error: "Interview not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, interview: updated, message: "Interview cancelled successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/calendar/[id]] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

