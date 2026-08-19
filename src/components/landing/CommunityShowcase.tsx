"use client";

import React from "react";
import Link from "next/link";
import { Users, MessageSquare, ArrowRight, Sparkles, Terminal, Code2, Brain, Rocket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { initialMockCommunities } from "@/data/mock-communities";

export function CommunityShowcase() {
  const displayCommunities = initialMockCommunities.slice(0, 4);

  return (
    <section id="communities" className="py-20 sm:py-28 bg-muted/30 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="emerald" size="md" className="mb-3">
            Peer Ecosystem
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Connect With The Brightest Student Builders
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Don&apos;t build or prep alone. Join specialized student hubs to share hackathon wins, review code architectures, and find mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCommunities.map((comm) => (
            <Card key={comm.id} hoverEffect className="p-6 border-border/80 bg-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  {comm.category === "AI & ML" ? (
                    <Brain className="w-6 h-6" />
                  ) : comm.category === "Web Development" ? (
                    <Code2 className="w-6 h-6" />
                  ) : comm.category === "DSA & Prep" ? (
                    <Terminal className="w-6 h-6" />
                  ) : (
                    <Rocket className="w-6 h-6" />
                  )}
                </div>

                <Badge variant="secondary" size="sm" className="mb-2">
                  {comm.category}
                </Badge>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  {comm.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                  {comm.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  {comm.membersCount.toLocaleString()} members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  {comm.activeDiscussions} active
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/login">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore All Student Hubs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
