"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { CalendarEventDetailModal } from "@/components/calendar/CalendarEventDetailModal";
import { CalendarEvent } from "@/types";

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<"ALL" | "INTERVIEWS" | "ASSESSMENTS" | "MEETINGS">("ALL");
  const [timeRange, setTimeRange] = useState<"UPCOMING" | "TODAY" | "THIS_WEEK" | "ALL">("UPCOMING");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filterType,
        timeRange,
      });
      const res = await fetch(`/api/calendar?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events || []);
      }
    } catch (err) {
      console.error("Failed to load student calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType, timeRange]);

  const upcomingInterviewsCount = events.filter((e) => e.type === "INTERVIEW").length;
  const upcomingAssessmentsCount = events.filter((e) => e.type === "ASSESSMENT").length;

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <CalendarIcon className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Career Activity Timeline &amp; Schedule
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                My Recruitment Calendar
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
                Keep track of scheduled technical interviews, final leadership rounds, proctored assessments, and placement cell mentorship sessions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-xl font-black block">{upcomingInterviewsCount}</span>
                <span className="text-[10px] text-indigo-200 uppercase font-semibold">Interviews</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-xl font-black block">{upcomingAssessmentsCount}</span>
                <span className="text-[10px] text-indigo-200 uppercase font-semibold">Tests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Calendar Workspace */}
        <CalendarWorkspace
          events={events}
          isLoading={loading}
          userRole="student"
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          filterType={filterType}
          setFilterType={setFilterType}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        {/* Event Detail Modal */}
        <CalendarEventDetailModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          userRole="student"
        />
      </div>
    </RoleGuard>
  );
}
