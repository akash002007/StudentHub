"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  Video,
  Clock,
  PlusCircle,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { CalendarEventDetailModal } from "@/components/calendar/CalendarEventDetailModal";
import { CalendarEvent } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function RecruiterCalendarPage() {
  const { success, error: toastError } = useToast();
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
      console.error("Failed to load recruiter calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType, timeRange]);

  const handleReschedule = async (
    event: CalendarEvent,
    newDate: string,
    newTime: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/calendar/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESCHEDULE", date: newDate, time: newTime, reason }),
      });
      if (res.ok) {
        success("Interview successfully rescheduled!");
        setSelectedEvent(null);
        fetchEvents();
      } else {
        toastError("Failed to reschedule interview.");
      }
    } catch (err) {
      toastError("Error connecting to server.");
    }
  };

  const handleCancel = async (event: CalendarEvent, reason: string) => {
    try {
      const res = await fetch(`/api/calendar/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", reason }),
      });
      if (res.ok) {
        success("Interview cancelled.");
        setSelectedEvent(null);
        fetchEvents();
      } else {
        toastError("Failed to cancel interview.");
      }
    } catch (err) {
      toastError("Error connecting to server.");
    }
  };

  const todayCount = events.filter((e) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return e.date === todayStr;
  }).length;

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <CalendarIcon className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Recruitment Pipeline Schedule
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Recruiter Interview Calendar
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
                Coordinate upcoming candidate screenings, technical evaluations, final executive rounds, and committee meetings in one unified timeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-xl font-black block">{events.length}</span>
                <span className="text-[10px] text-purple-200 uppercase font-semibold">Total Slotted</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-xl font-black block">{todayCount}</span>
                <span className="text-[10px] text-purple-200 uppercase font-semibold">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Calendar Workspace */}
        <CalendarWorkspace
          events={events}
          isLoading={loading}
          userRole="recruiter"
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          filterType={filterType}
          setFilterType={setFilterType}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        {/* Event Detail Modal with Reschedule and Cancellation */}
        <CalendarEventDetailModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          userRole="recruiter"
        />
      </div>
    </RoleGuard>
  );
}
