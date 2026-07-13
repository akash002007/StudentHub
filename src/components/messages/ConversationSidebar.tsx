"use client";

import React, { useState } from "react";
import { Search, Filter, Pin, Archive, MoreVertical, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation, mockConversations, mockParticipants } from "@/data/mockMessages";
import { motion } from "framer-motion";

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export function ConversationSidebar({ selectedConversationId, onSelectConversation }: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // all, student, recruiter, alumni, unread

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = mockConversations.filter(conv => {
    const participant = conv.participants[0];
    
    // Search
    if (searchQuery && !participant.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter
    if (activeFilter !== "all") {
      if (activeFilter === "unread" && conv.unreadCount === 0) return false;
      if (['student', 'recruiter', 'alumni'].includes(activeFilter) && participant.type !== activeFilter) return false;
    }
    
    return true;
  });

  const pinnedConversations = filteredConversations.filter(c => c.pinned);
  const regularConversations = filteredConversations.filter(c => !c.pinned && !c.archived);

  return (
    <div className="w-[320px] flex-shrink-0 h-full flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
            Messages
            <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">
              {mockConversations.reduce((acc, c) => acc + c.unreadCount, 0)} new
            </span>
          </h2>
          <button className="text-white/60 hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <button className="bg-white/5 border border-white/10 rounded-full w-[38px] h-[38px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Filter size={16} />
          </button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'unread', 'alumni', 'recruiter', 'student'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors capitalize",
                activeFilter === filter 
                  ? "bg-white text-black font-medium" 
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 p-6 text-center">
            <MessageSquare size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {/* Pinned Section */}
            {pinnedConversations.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                  <Pin size={12} /> Pinned
                </div>
                <div className="space-y-1">
                  {pinnedConversations.map(conv => (
                    <ConversationItem 
                      key={conv.id} 
                      conversation={conv} 
                      isSelected={selectedConversationId === conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      formatTimestamp={formatTimestamp}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Section */}
            {regularConversations.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                  Recent
                </div>
                <div className="space-y-1">
                  {regularConversations.map(conv => (
                    <ConversationItem 
                      key={conv.id} 
                      conversation={conv} 
                      isSelected={selectedConversationId === conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      formatTimestamp={formatTimestamp}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick,
  formatTimestamp 
}: { 
  conversation: Conversation, 
  isSelected: boolean,
  onClick: () => void,
  formatTimestamp: (d: string) => string
}) {
  const participant = conversation.participants[0];
  const lastMsg = conversation.lastMessage;
  
  // Role badge colors
  const roleColors = {
    student: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    recruiter: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    alumni: "bg-purple-500/20 text-purple-400 border-purple-500/20"
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group",
        isSelected 
          ? "bg-white/10 border-white/20 shadow-soft" 
          : "hover:bg-white/[0.05] border-transparent"
      )}
    >
      {/* Avatar with Status */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/10">
          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
        </div>
        {participant.online && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "text-sm font-medium truncate pr-2",
            conversation.unreadCount > 0 ? "text-white" : "text-white/90"
          )}>
            {participant.name}
          </h3>
          <span className="text-[10px] text-white/40 whitespace-nowrap">
            {lastMsg ? formatTimestamp(lastMsg.timestamp) : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium",
            roleColors[participant.type]
          )}>
            {participant.type}
          </span>
        </div>
        
        <p className={cn(
          "text-xs truncate",
          conversation.unreadCount > 0 ? "text-white/80 font-medium" : "text-white/50"
        )}>
          {lastMsg?.senderId === 'me' ? 'You: ' : ''}{lastMsg?.content}
        </p>
      </div>

      {/* Unread Indicator */}
      {conversation.unreadCount > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">
          {conversation.unreadCount}
        </div>
      )}
      
      {/* Active Indicator */}
      {isSelected && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full" 
        />
      )}
    </motion.button>
  );
}
