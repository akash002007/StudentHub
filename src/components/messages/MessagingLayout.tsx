"use client";

import React, { useState, useEffect } from "react";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationView } from "./ConversationView";
import { ContextPanel } from "./ContextPanel";
import { mockConversations, mockMessageHistory, Message, Conversation } from "@/data/mockMessages";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export function MessagingLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messageHistory, setMessageHistory] = useState<Record<string, Message[]>>(mockMessageHistory);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Mobile: < 768px
      setIsTablet(width >= 768 && width < 1024); // Tablet: 768px - 1024px
      
      if (width < 1024) {
        setIsContextOpen(false); // Auto close context on smaller screens
      } else {
        setIsContextOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const participant = selectedConversation?.participants[0];

  const handleSendMessage = (conversationId: string, content: string, type: Message['type'] = 'text', metadata?: any) => {
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      conversationId,
      senderId: 'me',
      content,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent',
      metadata
    };

    setMessageHistory(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: newMessage,
            updatedAt: newMessage.timestamp
          };
        }
        return conv;
      });
      // Sort conversations so newest is on top (optional but good for UX)
      return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (!isMobile && !isTablet) {
      setIsContextOpen(true);
    }
  };

  const handleBack = () => {
    setSelectedConversationId(undefined);
  };

  return (
    <div className="flex h-full w-full bg-black text-white overflow-hidden">
      <AmbientBackground />
      
      <div className="relative z-10 flex w-full h-full max-w-[1600px] mx-auto border-x border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
        {/* Sidebar Panel */}
        {(!isMobile || !selectedConversationId) && (
          <ConversationSidebar 
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        )}

        {/* Center View Panel */}
        {(!isMobile || selectedConversationId) && (
          <ConversationView 
            conversation={selectedConversation}
            messages={selectedConversationId ? messageHistory[selectedConversationId] || [] : []}
            onSendMessage={handleSendMessage}
            isContextOpen={isContextOpen}
            onToggleContext={() => setIsContextOpen(!isContextOpen)}
            onBack={isMobile ? handleBack : undefined}
          />
        )}

        {/* Right Context Panel */}
        {isContextOpen && participant && (
          <div className={isTablet ? "absolute inset-y-0 right-0 shadow-2xl z-50 border-l border-white/20" : ""}>
            <ContextPanel 
              participant={participant}
              onClose={() => setIsContextOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
