"use client";

import React from "react";
import { mockUpcomingEvents } from "@/data/mockDiscover";
import { Calendar as CalendarIcon, Clock, Users, ArrowRight } from "lucide-react";

export function EventList({ searchQuery }: { searchQuery: string }) {
  const filtered = mockUpcomingEvents.filter(e => 
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {filtered.map(event => (
        <div 
          key={event.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20 rounded-2xl p-4 transition-all group"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-black/40 border border-white/10 shadow-inner">
              <span className="text-xs text-white/60 uppercase">{event.date.split(" ")[0]}</span>
              <span className="text-lg font-bold text-white">{event.date.split(" ")[1]}</span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1 sm:hidden">
                <CalendarIcon size={14} className="text-pink-400" />
                <span className="text-xs text-white/80">{event.date}</span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-pink-400 transition-colors mb-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <img src={event.speakerAvatar} alt={event.speaker} className="w-5 h-5 rounded-full bg-white/10" />
                <span>{event.speaker}</span>
                <span className="hidden sm:inline text-white/30">•</span>
                <span className="hidden sm:inline line-clamp-1">{event.speakerRole}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/60 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {event.attendees}</span>
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white group-hover:bg-pink-500 group-hover:border-pink-400 group-hover:text-black transition-all">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
