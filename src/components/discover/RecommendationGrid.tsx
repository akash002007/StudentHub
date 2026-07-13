"use client";

import React from "react";
import { mockRecommendations } from "@/data/mockDiscover";
import { ArrowRight, Briefcase, Users, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RecommendationGridProps {
  searchQuery: string;
  activeFilter: string;
}

export function RecommendationGrid({ searchQuery, activeFilter }: RecommendationGridProps) {
  const filteredRecs = mockRecommendations.filter(rec => {
    if (activeFilter !== "all" && rec.type !== activeFilter) return false;
    if (searchQuery && !rec.title.toLowerCase().includes(searchQuery.toLowerCase()) && !rec.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "internship": return <Briefcase size={20} className="text-blue-400" />;
      case "alumni": return <Users size={20} className="text-purple-400" />;
      case "community": return <Users size={20} className="text-emerald-400" />;
      case "event": return <Calendar size={20} className="text-pink-400" />;
      default: return <Sparkles size={20} className="text-white/60" />;
    }
  };

  if (filteredRecs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white/40 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
        <p>No recommendations found for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredRecs.map((rec, i) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative flex flex-col justify-between bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)] hover:bg-white/[0.08] hover:border-white/20 rounded-3xl p-6 transition-all duration-300"
          data-cursor-priority="2"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                {rec.imageUrl ? (
                  <img src={rec.imageUrl} alt={rec.title} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getIcon(rec.type)
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <Sparkles size={12} />
                {rec.matchScore}% Match
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{rec.title}</h3>
            <p className="text-sm text-white/60 mb-3">{rec.subtitle}</p>
            <p className="text-sm text-white/80 line-clamp-2 mb-4">{rec.description}</p>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-6">
              <p className="text-xs text-white/60 flex gap-2">
                <Sparkles size={14} className="text-white/40 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{rec.matchReason}</span>
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 mb-4">
            {rec.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                {tag}
              </span>
            ))}
          </div>

          <button 
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 group-hover:bg-white group-hover:text-black"
            data-cursor-priority="1"
          >
            {rec.actionText}
            <ArrowRight size={16} className="opacity-60 group-hover:opacity-100" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
