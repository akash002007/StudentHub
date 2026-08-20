"use client";

import React, { useState } from "react";
import {
  Send,
  Search,
  CheckCheck,
  ArrowLeft,
  Sparkles,
  Phone,
  Video,
  Info,
  MoreVertical,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.companyOrCollege.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(activeConv.id, inputText);
    setInputText("");
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setIsMobileChatOpen(true);
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Networking &amp; Messages
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Connect directly with tech recruiters, alumni mentors, and student collaborators.
        </p>
      </div>

      {/* 2-Pane Chat Box */}
      <Card className="flex-1 border-border/80 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
        {/* Left Pane: Conversation List */}
        <div
          className={cn(
            "md:col-span-4 lg:col-span-4 border-r border-border flex flex-col h-full bg-muted/20",
            isMobileChatOpen ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search Box */}
          <div className="p-3.5 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative",
                    isSelected
                      ? "bg-purple-500/10 dark:bg-purple-950/30"
                      : "hover:bg-muted/60"
                  )}
                >
                  <Avatar
                    src={conv.participant.avatar}
                    name={conv.participant.name}
                    size="md"
                    isOnline={conv.participant.isOnline}
                  />

                  <div className="flex-1 overflow-hidden space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {conv.participant.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {conv.lastMessage.timestamp}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate font-medium">
                      {conv.participant.role} • {conv.participant.companyOrCollege}
                    </div>

                    <p className="text-xs text-muted-foreground/90 truncate leading-tight">
                      {conv.lastMessage.text}
                    </p>
                  </div>

                  {conv.lastMessage.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 self-center" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div
          className={cn(
            "md:col-span-8 lg:col-span-8 flex flex-col h-full bg-card",
            !isMobileChatOpen ? "hidden md:flex" : "flex"
          )}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-border/60 flex items-center justify-between bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Avatar
                    src={activeConv.participant.avatar}
                    name={activeConv.participant.name}
                    size="md"
                    isOnline={activeConv.participant.isOnline}
                  />

                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {activeConv.participant.name}
                      <Badge
                        variant={
                          activeConv.participant.type === "recruiter"
                            ? "blue"
                            : activeConv.participant.type === "mentor"
                            ? "purple"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {activeConv.participant.type === "recruiter"
                          ? "Recruiter"
                          : activeConv.participant.type === "mentor"
                          ? "Mentor"
                          : "Peer"}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activeConv.participant.role} @ {activeConv.participant.companyOrCollege}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Badge variant="secondary" size="sm" className="hidden sm:inline-flex">
                    {activeConv.participant.isOnline ? "Active Now" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-muted/10">
                {activeConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[70%]",
                      msg.isSelf ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs",
                        msg.isSelf
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-card border border-border text-foreground rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                      {msg.timestamp}
                      {msg.isSelf && <CheckCheck className="w-3 h-3 text-purple-500" />}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-border/60 bg-card flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeConv.participant.name.split(" ")[0]}...`}
                  className="flex-1 h-10 px-4 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  className="h-10 px-4 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </Card>
    </div>
    </RoleGuard>
  );
}
