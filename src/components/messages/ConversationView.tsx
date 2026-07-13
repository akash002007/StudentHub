"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Search,
  MoreHorizontal,
  Phone,
  Video,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Paperclip,
  Smile,
  Send,
  FileText
} from "lucide-react";
import { Conversation, Message } from "@/data/mockMessages";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  conversation?: Conversation;
  messages?: Message[];
  onSendMessage?: (conversationId: string, content: string, type?: Message['type']) => void;
  onToggleContext: () => void;
  isContextOpen: boolean;
  onBack?: () => void; // For mobile
}

export function ConversationView({ 
  conversation, 
  messages = [],
  onSendMessage,
  onToggleContext, 
  isContextOpen,
  onBack 
}: ConversationViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return <EmptyState />;
  }

  const participant = conversation.participants[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !onSendMessage) return;
    
    onSendMessage(conversation.id, inputText.trim(), 'text');
    setInputText("");
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-black/20">
      {/* Header - Liquid Glass */}
      <div className="h-[72px] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-black/40 backdrop-blur-xl shadow-[inset_0_-1px_0_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.2)] z-10">
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
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
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

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === 'me');

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
            >
              <div className={cn("flex max-w-[75%] gap-2 items-end", isMe ? "flex-row-reverse" : "flex-row")}>
                
                {/* Avatar for others */}
                {!isMe && (
                  <div className="w-6 h-6 flex-shrink-0">
                    {showAvatar ? (
                      <img src={participant.avatar} alt="avatar" className="w-full h-full rounded-full object-cover opacity-80" />
                    ) : null}
                  </div>
                )}

                <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isMe 
                      ? "bg-white text-black rounded-br-sm shadow-sm" 
                      : "bg-white/10 text-white rounded-bl-sm border border-white/5 backdrop-blur-sm"
                  )}>
                    {msg.type === 'resume' ? (
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isMe ? "bg-black/10 text-black" : "bg-white/10 text-white")}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{msg.content}</p>
                          {msg.metadata?.fileSize && <p className="text-xs opacity-60">{msg.metadata.fileSize as string}</p>}
                        </div>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  
                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 px-1">
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isMe && msg.status === 'read' && (
                      <span className="text-blue-400">Read</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer - Liquid Glass */}
      <div className="p-4 sm:px-6 pb-6 bg-black/40 backdrop-blur-xl border-t border-white/10 z-10">
        <form onSubmit={handleSend} className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.1)] rounded-full pl-4 pr-1.5 py-1.5 focus-within:bg-white/10 focus-within:border-white/20 transition-all duration-300">
          <button type="button" className="text-white/40 hover:text-white transition-colors mr-2">
            <Paperclip size={20} />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none py-2"
          />
          
          <button type="button" className="text-white/40 hover:text-white transition-colors mx-2">
            <Smile size={20} />
          </button>

          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-black/20 text-center relative overflow-hidden">
      {/* Readability scrim behind text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,transparent_70%)] rounded-full"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full flex flex-col items-center relative z-10"
      >
        {/* Abstract Illustration */}
        <div className="relative w-48 h-48 mb-8 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative w-full h-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-full flex items-center justify-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center -translate-y-4 shadow-xl">
                <Users className="text-blue-400" size={24} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center translate-y-4 shadow-xl">
                <Briefcase className="text-emerald-400" size={24} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center -translate-y-2 shadow-xl">
                <GraduationCap className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Your Career Workspace</h2>
        <p className="text-white/80 font-medium text-sm mb-8 drop-shadow max-w-sm">
          Connect with peers, get mentored by alumni, and chat directly with recruiters. Select a conversation or start networking.
        </p>

        {/* Quick Actions - Liquid Glass */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group text-left">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Users size={20} className="text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Find Students</p>
              <p className="text-xs text-white/60">Collaborate & build</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group text-left">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <GraduationCap size={20} className="text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Message Alumni</p>
              <p className="text-xs text-white/60">Get expert guidance</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Briefcase size={20} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Connect Recruiters</p>
              <p className="text-xs text-white/60">Explore opportunities</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group text-left">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Search size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Join Communities</p>
              <p className="text-xs text-white/60">Discover interests</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
