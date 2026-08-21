"use client";

import React from "react";
import { FileText, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function CareerDNAComparison() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Your resume tells recruiters what you say you can do.
        </h3>
        <p className="text-base sm:text-lg font-bold text-gradient">
          Career DNA shows what you've actually built.
        </p>
        <p className="text-xs text-muted-foreground italic pt-1">
          "Resumes are useful. Evidence makes them stronger."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Platforms Card */}
        <Card hoverEffect className="p-6 border-border/60 bg-card/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Traditional Platforms</h4>
              <p className="text-[11px] text-muted-foreground">Self-reported resume claims</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1 text-muted-foreground">
              <span className="font-semibold text-foreground block">Resume PDF</span>
              <p className="text-[11px]">Static bullet points without source verification</p>
            </div>
            <div className="flex justify-center text-muted-foreground text-xs font-bold">↓</div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1 text-muted-foreground">
              <span className="font-semibold text-foreground block">Unverified Claims</span>
              <p className="text-[11px]">Skills listed without physical code evidence</p>
            </div>
            <div className="flex justify-center text-muted-foreground text-xs font-bold">↓</div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1 text-muted-foreground">
              <span className="font-semibold text-foreground block">Recruiter Guessing</span>
              <p className="text-[11px]">Manual review required to verify true competence</p>
            </div>
          </div>
        </Card>

        {/* StudentHub Career DNA Card (Emphasized) */}
        <Card hoverEffect className="p-6 border-purple-500/30 bg-gradient-to-br from-card via-card to-purple-950/20 space-y-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">StudentHub Career DNA</h4>
                <p className="text-[11px] text-purple-500 font-semibold">Evidence-backed intelligence</p>
              </div>
            </div>
            <Badge variant="purple" size="sm">
              Superior Match
            </Badge>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between font-semibold text-foreground">
              <span>1. Real Work</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between font-semibold text-foreground">
              <span>2. Verified Evidence</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between font-semibold text-foreground">
              <span>3. Career DNA Engine</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between font-semibold text-foreground">
              <span>4. Career Score (84/100)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
              <span>5. High-Precision Recruiter Match</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
