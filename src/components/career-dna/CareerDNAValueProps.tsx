"use client";

import React from "react";
import { Users2, GraduationCap, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function CareerDNAValueProps() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Student Value Card */}
      <Card hoverEffect className="p-6 border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/20 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h4 className="font-extrabold text-lg text-foreground">Build. Learn. Prove. Grow.</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Students do not need to wait until they have years of experience to demonstrate ability. Your projects, contributions, learning, and achievements become part of an evolving, evidence-backed career profile.
        </p>
        <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Turns your work into verified proof</span>
        </div>
      </Card>

      {/* Recruiter Value Card */}
      <Card hoverEffect className="p-6 border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-950/20 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <Users2 className="w-5 h-5" />
        </div>
        <h4 className="font-extrabold text-lg text-foreground">Give recruiters more than a resume.</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Career DNA gives recruiters an evidence-backed view of a student's capabilities, helping them understand demonstrated skills, relevant projects, strengths, and areas of potential before making a hiring decision.
        </p>
        <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Powers faster, better-informed hiring decisions</span>
        </div>
      </Card>
    </div>
  );
}
