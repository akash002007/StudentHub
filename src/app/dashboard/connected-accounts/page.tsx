"use client";

import React from "react";
import {
  Link2,
  Github,
  Linkedin,
  Code,
  Globe,
  Trophy,
  Database,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockConnectedAccounts } from "@/data/mock-notifications";

export default function ConnectedAccountsPage() {
  const getIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <Github className="w-6 h-6" />;
      case "leetcode":
        return <Code className="w-6 h-6 text-amber-500" />;
      case "linkedin":
        return <Linkedin className="w-6 h-6 text-blue-500" />;
      case "portfolio":
        return <Globe className="w-6 h-6 text-purple-500" />;
      case "codeforces":
        return <Trophy className="w-6 h-6 text-rose-500" />;
      case "kaggle":
        return <Database className="w-6 h-6 text-cyan-500" />;
      default:
        return <Link2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Connected Accounts &amp; Developer Profiles
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Link your external coding, research, and portfolio platforms to power automated recruiter discovery.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Phase 2 Developer Integrations Preview:</span>{" "}
          Direct GitHub repository syncing, LeetCode contest rating badges, and LinkedIn profile verification are coming soon. Current accounts reflect your saved student profile links.
        </div>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockConnectedAccounts.map((acc) => {
          const isConnected = acc.status === "connected";

          return (
            <Card
              key={acc.id}
              hoverEffect
              className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-foreground shrink-0">
                      {getIcon(acc.platform)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        {acc.name}
                      </h3>
                      {isConnected ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {acc.username}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {acc.metric}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={isConnected ? "emerald" : "secondary"}
                    size="sm"
                    className="font-semibold"
                  >
                    {isConnected ? "Connected" : "Coming Soon"}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {acc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                {isConnected ? (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Verified
                    </span>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Manage Link
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> Integration in Next Phase
                    </span>
                    <Button variant="secondary" size="sm" disabled className="h-8 text-xs opacity-60">
                      Coming Soon
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
