"use client";

import React, { useState } from "react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { DiscoverHero } from "./DiscoverHero";
import { RecommendationGrid } from "./RecommendationGrid";
import { CommunityCarousel } from "./CommunityCarousel";
import { EventList } from "./EventList";

export function DiscoverLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col pt-16">
      {/* 3D Liquid Art Background */}
      <div className="absolute inset-0 z-0">
        <AmbientBackground />
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
