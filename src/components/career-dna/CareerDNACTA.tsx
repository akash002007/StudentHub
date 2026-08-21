"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Dna } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";

export function CareerDNACTA() {
  const { isAuthenticated } = useAuth();
  const ctaLink = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-purple-900/30 via-card to-blue-900/20 border border-purple-500/30 text-center space-y-6 overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
        <Badge variant="purple" size="sm" className="font-semibold px-3 py-1">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          The Intelligence Layer
        </Badge>
        
        <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Build a career profile that proves what you can do.
        </h3>
        
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Connect your work, understand your strengths, and turn your progress into evidence recruiters can trust.
        </p>

        <div className="pt-2 text-xs sm:text-sm italic text-purple-600 dark:text-purple-300 font-semibold space-y-1">
          <p>"Don't just list what you've done. Show what it proves."</p>
          <p className="text-muted-foreground font-normal text-xs">
            StudentHub Career DNA turns your work into evidence, your evidence into insight, and your insight into your next opportunity.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href={ctaLink}>
          <Button variant="primary" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6">
            <Dna className="w-4 h-4 mr-2" /> Build My Career DNA <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link href="#career-dna-hero">
          <Button variant="outline" size="lg" className="text-sm font-semibold">
            See How It Works
          </Button>
        </Link>
      </div>
    </div>
  );
}
