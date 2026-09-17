"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  CheckCircle2,
  ExternalLink,
  User,
  Layers,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Share2,
  Sparkles,
  CalendarPlus,
  RefreshCw,
  Ban,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CalendarEvent } from "@/types";
import { generateGoogleCalendarUrl } from "@/lib/calendar-utils";
import Link from "next/link";

interface CalendarEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onReschedule?: (event: CalendarEvent, newDate: string, newTime: string, reason?: string) => void;
  onCancel?: (event: CalendarEvent, reason: string) => void;
  userRole?: "student" | "recruiter";
}

export function CalendarEventDetailModal({
  isOpen,
  onClose,
  event,
  onReschedule,
  onCancel,
  userRole = "student",
}: CalendarEventDetailModalProps) {
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  if (!event) return null;

  const isInterview = event.type === "INTERVIEW";
  const isAssessment = event.type === "ASSESSMENT";
  const isMeeting = event.type === "MEETING";
  const isFinalRound = event.metadata?.isFinalRound;

  const handleStartReschedule = () => {
    setNewDate(event.date);
    setNewTime(event.startTime);
    setRescheduleReason("");
    setRescheduleMode(true);
    setCancelMode(false);
  };

  const handleStartCancel = () => {
    setCancelReason("");
    setCancelMode(true);
    setRescheduleMode(false);
  };

  const submitReschedule = () => {
    if (!newDate || !newTime) return;
    if (onReschedule) {
      onReschedule(event, newDate, newTime, rescheduleReason);
    }
    setRescheduleMode(false);
  };

  const submitCancel = () => {
    if (!cancelReason.trim()) return;
    if (onCancel) {
      onCancel(event, cancelReason);
    }
    setCancelMode(false);
  };

  const googleCalUrl = generateGoogleCalendarUrl(event);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        {/* Header with Type & Status */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner shrink-0 ${
                isInterview
                  ? isFinalRound
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : isAssessment
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {isInterview ? "🎥" : isAssessment ? "📋" : "📅"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {event.type}
                </span>

                {/* STRICT DOMAIN HIERARCHY: Final Round is a round/stage, NOT an event type */}
                {isFinalRound && (
                  <Badge variant="rose" className="text-[10px] px-2 py-0.5 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Final Round
                  </Badge>
                )}
                {event.metadata?.roundName && !isFinalRound && (
                  <Badge variant="purple" className="text-[10px]">
                    {event.metadata.roundName}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-foreground mt-0.5 leading-snug">
                {event.title}
              </h2>
            </div>
          </div>

          <Badge
            variant={
              event.status === "COMPLETED"
                ? "emerald"
                : event.status === "CANCELLED"
                ? "rose"
                : event.status === "RESCHEDULED"
                ? "amber"
                : "blue"
            }
            className="text-xs capitalize font-semibold shrink-0"
          >
            {event.status.toLowerCase()}
          </Badge>
        </div>

        {/* Date, Time, Duration & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px]">Date &amp; Schedule</span>
              <span className="font-bold text-foreground">{event.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[10px]">Time &amp; Duration</span>
              <span className="font-bold text-foreground">
                {event.startTime} ({event.duration})
              </span>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-2.5 col-span-full pt-1 border-t border-border/50">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[10px]">Location / Venue</span>
                <span className="font-semibold text-foreground">{event.location}</span>
              </div>
            </div>
          )}
        </div>

        {/* Participant & Host Details */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {userRole === "recruiter" ? "Candidate & Opportunity" : "Interviewer & Company"}
          </h3>

          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-base text-foreground">
                {userRole === "recruiter"
                  ? (event.metadata?.candidateName?.charAt(0) || "C")
                  : (event.company?.charAt(0) || "C")}
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">
                  {userRole === "recruiter"
                    ? event.metadata?.candidateName
                    : event.company}
                </div>
                <div className="text-xs text-muted-foreground">
                  {userRole === "recruiter"
                    ? `${event.metadata?.candidateUniversity || "Candidate"} • ${event.metadata?.position || "Role"}`
                    : `${event.metadata?.interviewerName || "Interviewer"} (${event.metadata?.interviewerRole || "Technical Lead"})`}
                </div>
              </div>
            </div>

            {event.companyLogo && (
              <img
                src={event.companyLogo}
                alt={event.company}
                className="w-7 h-7 object-contain rounded-md"
              />
            )}
          </div>
        </div>

        {/* Instructions / Preparation Notes */}
        {(event.metadata?.instructions || event.description) && (
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-1">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
              Instructions &amp; Preparation:
            </span>
            <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              {event.metadata?.instructions || event.description}
            </p>
          </div>
        )}

        {/* Recruiter Reschedule Inline Panel */}
        {rescheduleMode && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule Interview
              </span>
              <button onClick={() => setRescheduleMode(false)} className="text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold block mb-1">New Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold block mb-1">New Time (e.g. 11:00 AM)</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="11:00 AM"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Reason for Rescheduling</label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Candidate request / interviewer schedule conflict"
                className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setRescheduleMode(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="gradient" className="text-xs h-7" onClick={submitReschedule}>
                Confirm Reschedule
              </Button>
            </div>
          </div>
        )}

        {/* Recruiter Cancel Inline Panel */}
        {cancelMode && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" />
                Cancel Interview Slot
              </span>
              <button onClick={() => setCancelMode(false)} className="text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (will be notified to candidate)..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setCancelMode(false)}>
                Keep Slot
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7 text-rose-600 hover:bg-rose-50" onClick={submitCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons: Join Meeting (strict validation, no fake links) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          {/* Left: Join Meeting or 'Not available' message */}
          <div className="w-full sm:w-auto">
            {event.meetingUrl ? (
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="gradient"
                  className="w-full sm:w-auto text-xs px-5 h-9 gap-2 shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  Join Google Meet
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            ) : isInterview ? (
              <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                Meeting link not available yet.
              </div>
            ) : null}
          </div>

          {/* Right: Secondary Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* 1-Click Add to Google Calendar */}
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Add this event to your Google Calendar"
            >
              <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5">
                <CalendarPlus className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Add to Google Calendar</span>
                <span className="sm:hidden">Google Cal</span>
              </Button>
            </a>

            {/* Recruiter Reschedule & Cancel buttons */}
            {isInterview && userRole === "recruiter" && !rescheduleMode && !cancelMode && event.status !== "CANCELLED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartReschedule}
                  className="text-xs h-9"
                >
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartCancel}
                  className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Cancel
                </Button>
              </>
            )}

            {/* Application / Assessment Flow Link */}
            <Link href={event.actionUrl} onClick={onClose}>
              <Button variant="outline" size="sm" className="text-xs h-9">
                {isInterview ? "View Interview Flow" : isAssessment ? "Open Assessment" : "View Details"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
