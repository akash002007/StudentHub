"use client";

import React from "react";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  MessageSquarePlus, 
  Search,
  MoreHorizontal,
  Phone,
  Video,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft
} from "lucide-react";
import { Conversation, ParticipantProfile } from "@/data/mockMessages";
import { motion } from "framer-motion";

interface ConversationViewProps {
  conversation?: Conversation;
  onToggleContext: () => void;
  isContextOpen: boolean;
  onBack?: () => void; // For mobile
}

export function ConversationView({ 
  conversation, 
  onToggleContext, 
  isContextOpen,
  onBack 
}: ConversationViewProps) {
  if (!conversation) {
    return <EmptyState />;
  }

  const participant = conversation.participants[0];

  return (
    <div className="flex-1 h-full flex flex-col bg-black/20">
      {/* Header */}
      <div className="h-[72px] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mobile Back Button */}
          {onBack && (
            <button 
              onClick={onBack}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Participant Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onToggleContext}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
              </div>
              {participant.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{participant.name}</h2>
              <p className="text-xs text-white/60">
                {participant.online ? 'Active now' : participant.lastSeen || 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Phone size={18} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Video size={18} />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1"></div>
          <button 
            onClick={onToggleContext}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isContextOpen ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {isContextOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area Placeholder (Phase 5B) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
          <MessageSquarePlus size={32} />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Chat Functionality Coming Soon</h3>
        <p className="text-sm text-white/50 max-w-md">
          Phase 5B will introduce real-time messaging, file attachments, code snippets, and the AI Message Assistant.
        </p>
      </div>

      {/* Composer Placeholder */}
      <div className="p-4 bg-black/40 border-t border-white/10">
        <div className="w-full h-12 rounded-full bg-white/5 border border-white/10 flex items-center px-4 opacity-50 cursor-not-allowed">
          <p className="text-sm text-white/40">Type a message...</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-black/20 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full flex flex-col items-center"
      >
        {/* Abstract Illustration */}
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative w-full h-full border border-white/10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center -translate-y-4 shadow-xl">
                <Users className="text-blue-400" size={24} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center translate-y-4 shadow-xl">
                <Briefcase className="text-emerald-400" size={24} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center -translate-y-2 shadow-xl">
                <GraduationCap className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Your Career Workspace</h2>
        <p className="text-white/60 text-sm mb-8">
          Connect with peers, get mentored by alumni, and chat directly with recruiters. Select a conversation or start networking.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Find Students</p>
              <p className="text-xs text-white/50">Collaborate & build</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Message Alumni</p>
              <p className="text-xs text-white/50">Get expert guidance</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Connect Recruiters</p>
              <p className="text-xs text-white/50">Explore opportunities</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Join Communities</p>
              <p className="text-xs text-white/50">Discover interests</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
