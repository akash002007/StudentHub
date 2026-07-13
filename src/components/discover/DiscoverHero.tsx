"use client";

import React from "react";
import { Search, Compass, Users, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverHeroProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
}

export function DiscoverHero({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }: DiscoverHeroProps) {
  const filters = [
    { id: "all", label: "All", icon: Compass },
    { id: "internship", label: "Internships", icon: Briefcase },
    { id: "alumni", label: "Alumni", icon: Users },
    { id: "community", label: "Communities", icon: Users },
    { id: "event", label: "Events", icon: Calendar },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 pt-8">
      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Explore your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#B026FF]">Ecosystem</span>
        </h1>
        <p className="text-white/60 text-lg">
          Discover opportunities, connect with alumni, and join communities tailored to your Career DNA.
        </p>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/40" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl py-4 pl-11 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-lg"
          placeholder="Search internships, communities, people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search the ecosystem"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                isActive
                  ? "bg-white/20 border border-white/30 text-white"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
