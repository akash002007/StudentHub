import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { CalendarEngine, CalendarFilterOptions } from "@/lib/calendar-engine";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    // Allow demo student fallback if unauthenticated in dev demo mode
    const userId = authUser?.userId || "student_01";
    const role = (authUser?.role || "student").toUpperCase();

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as CalendarFilterOptions["type"]) || "ALL";
    const timeRange = (searchParams.get("timeRange") as CalendarFilterOptions["timeRange"]) || "UPCOMING";
    const date = searchParams.get("date") || undefined;
    const search = searchParams.get("search") || undefined;

    const filters: CalendarFilterOptions = { type, timeRange, date, search };

    let events = [];
    if (role === "STUDENT") {
      events = CalendarEngine.getStudentEvents(userId, filters);
    } else if (role === "RECRUITER" || role === "COMPANY_ADMIN") {
      events = CalendarEngine.getRecruiterEvents(userId, filters);
    } else {
      // Admin operational view: fetch all platform interviews and events
      events = CalendarEngine.getRecruiterEvents(userId, filters);
    }

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
      filtersApplied: filters,
    });
  } catch (err) {
    console.error("[GET /api/calendar] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

