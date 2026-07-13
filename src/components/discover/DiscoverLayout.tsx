"use client";

import React, { useState, useEffect, useRef } from "react";
import { DiscoverHero } from "./DiscoverHero";
import { RecommendationGrid } from "./RecommendationGrid";
import { CommunityCarousel } from "./CommunityCarousel";
import { EventList } from "./EventList";

export function DiscoverLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.hidden) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col pt-16">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/assets/discover_section_video.mp4" type="video/mp4" />
        </video>
        {/* Subtle Scrim for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />
      </div>

      {/* Main Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
          
          <DiscoverHero 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          
          <section aria-labelledby="for-you-heading">
            <h2 id="for-you-heading" className="text-2xl font-semibold text-white mb-6">Recommended for You</h2>
            <RecommendationGrid searchQuery={searchQuery} activeFilter={activeFilter} />
          </section>
          
          <section aria-labelledby="communities-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="communities-heading" className="text-2xl font-semibold text-white">Trending Communities</h2>
              <button className="text-sm text-white/60 hover:text-white transition-colors">View All</button>
            </div>
            <CommunityCarousel searchQuery={searchQuery} />
          </section>
          
          <section aria-labelledby="events-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="events-heading" className="text-2xl font-semibold text-white">Upcoming Events & AMAs</h2>
              <button className="text-sm text-white/60 hover:text-white transition-colors">Calendar</button>
            </div>
            <EventList searchQuery={searchQuery} />
          </section>
          
        </div>
      </div>
    </div>
  );
}
