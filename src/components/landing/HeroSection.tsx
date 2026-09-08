"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, CheckCircle2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductPreview } from "./ProductPreview";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-background text-foreground animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 dark:bg-purple-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/10 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="mb-6">
            <Badge variant="gradient" size="lg" className="gap-2 py-1.5 px-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-xs sm:text-sm">
                Next-Gen Career Platform for Students
              </span>
            </Badge>
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
            <Button
              variant="gradient"
              size="lg"
              className="w-full sm:w-auto h-13 px-8 text-base shadow-lg shadow-purple-600/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => router.push("/signup")}
            >
              Join StudentHub Free
            </Button>
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
              <Users className="w-4 h-4 text-purple-500" />
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
