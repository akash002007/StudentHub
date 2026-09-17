import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { CalendarEngine, CalendarFilterOptions } from "@/lib/calendar-engine";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.userId || "student_01";
    const role = (authUser?.role || "student").toUpperCase();

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") as CalendarFilterOptions["type"]) || "ALL";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    // Strict UPCOMING timeRange (excludes cancelled, completed, and past events)
    const filters: CalendarFilterOptions = {
      type,
      timeRange: "UPCOMING",
    };

    let events = [];
    if (role === "STUDENT") {
      events = CalendarEngine.getStudentEvents(userId, filters);
    } else {
      events = CalendarEngine.getRecruiterEvents(userId, filters);
    }

    const sliced = limit > 0 ? events.slice(0, limit) : events;

    return NextResponse.json({
      success: true,
      events: sliced,
      totalUpcoming: events.length,
    });
  } catch (err) {
    console.error("[GET /api/calendar/upcoming] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
