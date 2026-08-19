"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, DollarSign, Clock, Sparkles, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockInternships } from "@/data/mock-internships";

export function InternshipSpotlight() {
  const featured = mockInternships.slice(0, 3);

  return (
    <section id="internships" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="blue" size="md" className="mb-3">
              Direct Placement
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Featured Opportunities
            </h2>
            <p className="mt-2 text-base text-muted-foreground max-w-xl">
              High-growth tech startups and industry leaders looking for top student engineers, designers, and researchers.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All 150+ Internships
            </Button>
          </Link>
        </div>

        {/* 3 Featured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((intern) => (
            <Card key={intern.id} hoverEffect className="p-6 flex flex-col justify-between border-border/80 bg-card">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={intern.companyLogo}
                        alt={intern.company}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-tight">
                        {intern.company}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {intern.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm" className="font-bold">
                    {intern.matchPercentage}% Match
                  </Badge>
                </div>

                {/* Role Title */}
                <div>
                  <h3 className="font-bold text-base text-foreground tracking-tight hover:text-purple-600 transition-colors">
                    {intern.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {intern.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {intern.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 text-[11px] font-medium border border-border/40"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold border border-purple-500/20">
                    {intern.stipend}
                  </span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-4 mt-5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {intern.duration}
                </span>
                <Link href="/login">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                    Apply Now &rarr;
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
