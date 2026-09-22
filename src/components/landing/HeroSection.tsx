"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShinyCTA } from "@/components/ui/ShinyCTA";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { ProductPreview } from "./ProductPreview";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-background text-foreground animate-fade-in">
      {/* Sophisticated light mode atmospheric background */}
      <AtmosphericBackground
        variant="hero"
        showPattern={true}
        showNetwork={true}
        showRings={true}
        className="absolute inset-0 h-full -z-10"
      />

      {/* Floating Ambient Intelligence Signals (Desktop) */}
      <div className="hidden lg:block absolute top-36 left-8 xl:left-16 animate-float-node pointer-events-none -z-10" aria-hidden="true">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/75 backdrop-blur-md border border-blue-500/20 shadow-xs text-xs font-semibold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-foreground">Live Evidence Ingestion</span>
        </div>
      </div>
      <div className="hidden lg:block absolute top-48 right-8 xl:right-16 animate-float-node pointer-events-none -z-10 [animation-delay:2s]" aria-hidden="true">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/75 backdrop-blur-md border border-blue-500/20 shadow-xs text-xs font-semibold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-foreground">Deterministic Career DNA</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Subtle Glassmorphic Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-card/85 dark:bg-card/60 backdrop-blur-md border border-blue-500/25 shadow-xs text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Next-Gen Career Platform for Students</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            The Professional Network Built For{" "}
            <span className="text-gradient">Ambitious Students</span>
          </h1>

          {/* Supporting Description */}
          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Discover top-tier internships, showcase verified projects, collaborate in peer developer communities, and manage your entire application pipeline in one modern workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <ShinyCTA
              className="w-full sm:w-auto text-base shadow-lg shadow-blue-600/20"
              onClick={() => router.push("/signup")}
            >
              Join CommandSkill Free <ArrowRight className="w-4 h-4" />
            </ShinyCTA>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto h-13 px-7 text-base border-border/80"
              onClick={() => router.push("/login")}
            >
              Explore Demo Dashboard
            </Button>
          </div>

          {/* Social Proof / Stats Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>10,000+ Verified Internships</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Zero Spam or Ghost Jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>500+ University Clubs</span>
            </div>
          </div>
        </div>

        {/* Product Preview Mockup */}
        <div className="mt-14 sm:mt-20">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
