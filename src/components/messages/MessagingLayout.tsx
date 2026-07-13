"use client";

import React, { useState, useEffect } from "react";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationView } from "./ConversationView";
import { ContextPanel } from "./ContextPanel";
import { mockConversations } from "@/data/mockMessages";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export function MessagingLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  const selectedConversation = mockConversations.find(c => c.id === selectedConversationId);
  const participant = selectedConversation?.participants[0];

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
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        )}

        {/* Center View Panel */}
        {(!isMobile || selectedConversationId) && (
          <ConversationView 
            conversation={selectedConversation}
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
