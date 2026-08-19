"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-purple-900/30 via-card to-blue-900/20 border border-purple-500/30 shadow-2xl text-center flex flex-col items-center overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl leading-tight">
            Ready To Accelerate Your Student Tech Career?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
            Join thousands of university students discovering high-impact internships, building projects, and connecting with peers today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto h-13 px-8 text-base shadow-xl shadow-purple-600/30"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-7 text-base">
                Sign In to Workspace
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Free for Students • No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
