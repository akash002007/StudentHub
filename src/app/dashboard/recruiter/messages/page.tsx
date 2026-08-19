"use client";

import React, { useState } from "react";
import {
  Send,
  Search,
  CheckCheck,
  Sparkles,
  User,
  GraduationCap,
  Calendar,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function RecruiterMessagesPage() {
  const { user } = useAuth();
  const {
    recruiterConversations,
    activeRecruiterConversationId,
    setActiveRecruiterConversationId,
    sendRecruiterMessage,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const filteredConversations = recruiterConversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.companyOrCollege.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation =
    recruiterConversations.find((c) => c.id === activeRecruiterConversationId) ||
    recruiterConversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;
    sendRecruiterMessage(activeConversation.id, messageInput);
    setMessageInput("");
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Candidate Communications</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Candidate Messages
          </h1>
          <p className="text-xs text-muted-foreground">
            Direct communications with student applicants and interview candidates.
          </p>
        </div>

        {/* Messaging Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] max-h-[80vh] rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Left Column: Conversations List (4 cols) */}
          <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-card/60">
            {/* Search Header */}
            <div className="p-3.5 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search candidate conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversation?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveRecruiterConversationId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-purple-500/10 border-l-4 border-purple-600"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar
                      src={conv.participant.avatar}
                      name={conv.participant.name}
                      size="md"
                      isOnline={conv.participant.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-foreground truncate">
                          {conv.participant.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {conv.lastMessage.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {conv.participant.role}
                      </div>
                      <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                        {conv.lastMessage.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Window (8 cols) */}
          {activeConversation ? (
            <div className="lg:col-span-8 flex flex-col h-full bg-card">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={activeConversation.participant.avatar}
                    name={activeConversation.participant.name}
                    size="md"
                    isOnline={activeConversation.participant.isOnline}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {activeConversation.participant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-500" />
                      <span>{activeConversation.participant.companyOrCollege}</span>
                      <span>•</span>
                      <span>{activeConversation.participant.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm">
                    {activeConversation.participant.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                  >
                    {!msg.isSelf && (
                      <Avatar
                        src={msg.senderAvatar}
                        name={msg.senderName}
                        size="sm"
                        className="mt-1"
                      />
                    )}
                    <div className="space-y-1 max-w-[75%]">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isSelf
                            ? "bg-purple-600 text-white rounded-tr-none shadow-sm"
                            : "bg-muted/80 text-foreground border border-border/80 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div
                        className={`text-[10px] text-muted-foreground flex items-center gap-1 ${
                          msg.isSelf ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.isSelf && <CheckCheck className="w-3 h-3 text-purple-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-border flex gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeConversation.participant.name}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <Button type="submit" variant="gradient" size="sm" className="h-10 px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-8 flex items-center justify-center text-muted-foreground text-xs">
              Select a candidate conversation to begin.
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
