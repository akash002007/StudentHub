"use client";

import React from "react";
import { mockTrendingCommunities } from "@/data/mockDiscover";
import { Users, MessageSquare } from "lucide-react";

export function CommunityCarousel({ searchQuery }: { searchQuery: string }) {
  const filtered = mockTrendingCommunities.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
      {filtered.map(community => (
        <div 
          key={community.id}
          className="snap-start flex-shrink-0 w-[300px] sm:w-[340px] bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)] rounded-3xl p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-[#00F0FF] transition-colors">{community.name}</h3>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-full text-xs text-white/60">
              <Users size={12} />
              {community.memberCount.toLocaleString()}
            </div>
          </div>
          
          <p className="text-sm text-white/60 mb-6 line-clamp-2 min-h-[40px]">
            {community.description}
          </p>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-white/40" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Active Discussion</span>
            </div>
            <p className="text-sm text-white line-clamp-2">"{community.activeDiscussion}"</p>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex -space-x-2">
              {community.avatars.map((avatar, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                  <img src={avatar} alt="Member" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-1.5 rounded-full transition-all">
              Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
