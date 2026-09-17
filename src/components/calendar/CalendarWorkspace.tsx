"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  List,
  Grid,
  Columns,
  Sun,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CalendarEvent } from "@/types";
import Link from "next/link";

interface CalendarWorkspaceProps {
  events: CalendarEvent[];
  isLoading: boolean;
  userRole?: "student" | "recruiter";
  onSelectEvent: (event: CalendarEvent) => void;
  filterType: "ALL" | "INTERVIEWS" | "ASSESSMENTS" | "MEETINGS";
  setFilterType: (type: "ALL" | "INTERVIEWS" | "ASSESSMENTS" | "MEETINGS") => void;
  timeRange: "UPCOMING" | "TODAY" | "THIS_WEEK" | "ALL";
  setTimeRange: (range: "UPCOMING" | "TODAY" | "THIS_WEEK" | "ALL") => void;
}

export function CalendarWorkspace({
  events,
  isLoading,
  userRole = "student",
  onSelectEvent,
  filterType,
  setFilterType,
  timeRange,
  setTimeRange,
}: CalendarWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"UPCOMING" | "MONTH" | "WEEK" | "DAY">("UPCOMING");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 17)); // Default 17 Sept 2026
  const [userTimeZone, setUserTimeZone] = useState<string>("Local Time");

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimeZone(tz);
    } catch {
      setUserTimeZone("UTC");
    }
  }, []);

  // Format Helper: YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Group events by date category for the upcoming view
  const groupEventsByDate = (items: CalendarEvent[]) => {
    const today = "2026-09-17";
    const tomorrow = "2026-09-18";

    const groups: { label: string; date: string; items: CalendarEvent[] }[] = [];
    const dateMap: Record<string, CalendarEvent[]> = {};

    items.forEach((item) => {
      if (!dateMap[item.date]) dateMap[item.date] = [];
      dateMap[item.date].push(item);
    });

    Object.entries(dateMap).forEach(([date, evts]) => {
      let label = date;
      if (date === today) label = "Today";
      else if (date === tomorrow) label = "Tomorrow";
      else {
        const d = new Date(`${date}T00:00:00.000Z`);
        label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
      groups.push({ label, date, items: evts });
    });

    return groups.sort((a, b) => a.date.localeCompare(b.date));
  };

  const grouped = groupEventsByDate(events);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month Calculations
  const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Week Calculations (7 days starting from Monday of current week)
  const getWeekDays = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };
  const weekDays = getWeekDays(currentDate);

  const prevWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() - 7);
    setCurrentDate(next);
  };
  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  // Day navigation
  const prevDay = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() - 1);
    setCurrentDate(next);
  };
  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    setCurrentDate(next);
  };

  const currentDateKey = formatDateKey(currentDate);
  const dayEvents = events.filter((e) => e.date === currentDateKey);

  return (
    <div className="space-y-6">
      {/* Controls: Type Filter, Timeframe, Views, Timezone */}
      <Card className="p-4 rounded-2xl bg-card border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/70 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === "ALL"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType("INTERVIEWS")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === "INTERVIEWS"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎥 Interviews
          </button>
          {userRole === "student" && (
            <button
              onClick={() => setFilterType("ASSESSMENTS")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "ASSESSMENTS"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📋 Assessments
            </button>
          )}
          <button
            onClick={() => setFilterType("MEETINGS")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === "MEETINGS"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📅 Meetings
          </button>
        </div>

        {/* Right: Time Range, View Switcher & Timezone */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-xs rounded-xl bg-muted/60 border border-border px-3 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="ALL">All Events</option>
          </select>

          {/* 4-View Switcher: Upcoming | Month | Week | Day */}
          <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/70 text-xs">
            <button
              onClick={() => setViewMode("UPCOMING")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === "UPCOMING" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Upcoming Timeline"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upcoming</span>
            </button>
            <button
              onClick={() => setViewMode("MONTH")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === "MONTH" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Month Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Month</span>
            </button>
            <button
              onClick={() => setViewMode("WEEK")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === "WEEK" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Week View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Week</span>
            </button>
            <button
              onClick={() => setViewMode("DAY")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === "DAY" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Day View"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Day</span>
            </button>
          </div>

          {/* Timezone Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-[120px] font-medium" title={userTimeZone}>
              {userTimeZone}
            </span>
          </div>
        </div>
      </Card>

      {/* Main View Container */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
          <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
          <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center rounded-3xl bg-card border border-border space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center text-2xl">
            📅
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">You&apos;re all caught up.</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              No upcoming career activities. Explore recruitment drives or check your applications.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterType("ALL");
                setTimeRange("UPCOMING");
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
            <Link href={userRole === "student" ? "/dashboard/drives" : "/dashboard/recruiter/drives/new"}>
              <Button size="sm" variant="gradient" className="text-xs gap-1.5">
                {userRole === "student" ? "Explore Opportunities" : "Create Recruitment Drive"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === "UPCOMING" ? (
        /* 1. UPCOMING VIEW (Default, Mobile Optimized) */
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {group.items.length} event(s)
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((event) => {
                  const isInterview = event.type === "INTERVIEW";
                  const isFinalRound = event.metadata?.isFinalRound;

                  return (
                    <Card
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                        isFinalRound
                          ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/60 ring-1 ring-rose-500/20"
                          : isInterview
                          ? "bg-card border-border hover:border-indigo-500/50"
                          : event.type === "ASSESSMENT"
                          ? "bg-card border-border hover:border-purple-500/50"
                          : "bg-card border-border hover:border-blue-500/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          {/* Event Type Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${
                              isInterview
                                ? isFinalRound
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : event.type === "ASSESSMENT"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {isInterview ? "🎥" : event.type === "ASSESSMENT" ? "📋" : "📅"}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {event.title}
                              </span>

                              {/* Visual Hierarchy for Final Round (STRICT DOMAIN: round, NOT event type) */}
                              {isFinalRound && (
                                <Badge variant="rose" className="text-[9px] px-2 py-0.5 font-extrabold flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Final Round
                                </Badge>
                              )}
                              {event.metadata?.roundName && !isFinalRound && (
                                <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                                  {event.metadata.roundName}
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {event.subtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                              <span className="font-semibold text-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {event.startTime} ({event.duration})
                              </span>
                              <span>•</span>
                              <span>{event.company}</span>
                              {event.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {event.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:self-center self-end pt-2 sm:pt-0">
                          {event.meetingUrl ? (
                            <a
                              href={event.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                variant="gradient"
                                className="h-8 text-xs gap-1.5 px-3 shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Join
                              </Button>
                            </a>
                          ) : isInterview ? (
                            <span className="text-[11px] text-muted-foreground italic px-2">
                              No link yet
                            </span>
                          ) : null}

                          {event.type === "ASSESSMENT" ? (
                            <Link href="/dashboard/assessments" onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                Open Assessment
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(event);
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "MONTH" ? (
        /* 2. MONTH GRID VIEW */
        <Card className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              {monthName}
            </h3>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1.5 font-bold text-[11px] text-muted-foreground uppercase">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty_${i}`} className="h-20 sm:h-24 p-1 rounded-xl bg-muted/20 opacity-40" />
            ))}

            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayEvts = events.filter((e) => e.date === dateStr);
              const isSelectedDay = dateStr === currentDateKey;

              return (
                <div
                  key={`day_${dayNum}`}
                  onClick={() => {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum));
                  }}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-colors flex flex-col justify-between text-left group cursor-pointer ${
                    isSelectedDay
                      ? "border-indigo-500 bg-indigo-500/5 shadow-xs"
                      : "border-border/50 bg-card hover:bg-muted/30"
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold ${
                      isSelectedDay ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {dayEvts.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-semibold cursor-pointer ${
                          evt.metadata?.isFinalRound
                            ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                            : evt.type === "INTERVIEW"
                            ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                            : evt.type === "ASSESSMENT"
                            ? "bg-purple-500/20 text-purple-700 dark:text-purple-300"
                            : "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                        }`}
                        title={`${evt.title} at ${evt.startTime}`}
                      >
                        {evt.startTime} {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : viewMode === "WEEK" ? (
        /* 3. WEEK VIEW */
        <Card className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Columns className="w-4 h-4 text-indigo-500" />
                Week of {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h3>
              <p className="text-xs text-muted-foreground">7-day timeline view</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={prevWeek} className="h-7 w-7 p-0">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextWeek} className="h-7 w-7 p-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const dateStr = formatDateKey(d);
              const evts = events.filter((e) => e.date === dateStr);
              const isToday = dateStr === "2026-09-17";

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-2xl border flex flex-col min-h-[160px] ${
                    isToday ? "bg-indigo-500/5 border-indigo-500/40" : "bg-muted/20 border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <span className="text-xs font-bold text-foreground">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-extrabold ${
                        isToday ? "bg-indigo-600 text-white" : "text-muted-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 flex-1 overflow-y-auto">
                    {evts.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/60 italic block pt-3 text-center">
                        No events
                      </span>
                    ) : (
                      evts.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className={`p-2 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.02] border ${
                            evt.metadata?.isFinalRound
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                              : evt.type === "INTERVIEW"
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200"
                              : "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200"
                          }`}
                        >
                          <div className="text-[10px] font-bold truncate">{evt.title}</div>
                          <div className="text-[9px] opacity-80 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {evt.startTime}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* 4. DAY VIEW */
        <Card className="p-6 rounded-3xl bg-card border border-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sun className="w-4 h-4 text-indigo-500" />
                {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {dayEvents.length} scheduled career event(s) for this day
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(2026, 8, 17))}
                className="text-xs h-7 px-2.5"
              >
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={prevDay} className="h-7 w-7 p-0">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextDay} className="h-7 w-7 p-0">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {dayEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <div className="text-2xl">☀️</div>
              <p className="font-semibold">No scheduled activities for this date.</p>
              <p className="text-[11px] opacity-70">Use the arrows above to browse other days or switch to the Upcoming view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((evt) => {
                const isInterview = evt.type === "INTERVIEW";
                const isFinal = evt.metadata?.isFinalRound;

                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isFinal
                        ? "bg-rose-500/5 border-rose-500/30 ring-1 ring-rose-500/20"
                        : "bg-card border-border hover:border-indigo-500/50"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isInterview ? "bg-indigo-500/10 text-indigo-600" : "bg-purple-500/10 text-purple-600"
                        }`}
                      >
                        {isInterview ? "🎥" : "📋"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{evt.title}</h4>
                          {isFinal && (
                            <Badge variant="rose" className="text-[9px] px-1.5 py-0 font-bold">
                              Final Round
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{evt.subtitle}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {evt.startTime} ({evt.duration})
                          </span>
                          <span>•</span>
                          <span>{evt.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center self-end">
                      {evt.meetingUrl && (
                        <a
                          href={evt.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1">
                            <Video className="w-3.5 h-3.5" />
                            Join
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
