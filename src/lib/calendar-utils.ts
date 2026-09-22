import { CalendarEvent } from "@/types";

/**
 * Generates a standard Google Calendar template URL for adding a CommandSkill event.
 * Client-safe helper with no Node.js/server dependencies.
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.subtitle}\n\nCompany: ${event.company}\n${event.description || ""}\n${
      event.meetingUrl ? `Meeting Link: ${event.meetingUrl}` : ""
    }`
  );
  const location = encodeURIComponent(event.meetingUrl || event.location || "Online");
  const dateStr = event.date.replace(/-/g, "");
  const startIso = `${dateStr}T120000Z`;
  const endIso = `${dateStr}T130000Z`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}
