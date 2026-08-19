"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users2,
  GitPullRequest,
  CheckCircle,
  Sparkles,
  Zap,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    icon: <Briefcase className="w-6 h-6 text-purple-500" />,
    badge: "Smart Discovery",
    title: "Curated Student Internships",
    description:
      "Explore verified software engineering, AI/ML, product design, and data internships with transparent stipends, clear deadlines, and zero ghost jobs.",
    highlight: "Matching scores tailored to your projects and skills",
  },
  {
    icon: <GitPullRequest className="w-6 h-6 text-blue-500" />,
    badge: "Pipeline Management",
    title: "Application Pipeline Tracker",
    description:
      "A clean Kanban & table tracker that follows your journey from Applied to Interview to Offer. Keep notes, log test dates, and never miss an interview.",
    highlight: "6 distinct stages with automatic timeline updates",
  },
  {
    icon: <Users2 className="w-6 h-6 text-emerald-500" />,
    badge: "Peer Networking",
    title: "Developer & Campus Communities",
    description:
      "Join specialized hubs for AI/ML, DSA preparation, Web3, and Student Founders. Share project insights, mock interviews, and find hackathon teammates.",
    highlight: "Over 500+ active student peer groups",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-amber-500" />,
    badge: "Verified Identity",
    title: "Proof-of-Work Student Profile",
    description:
      "Move beyond static PDFs. Showcase live demos, hackathon awards, verified certifications, and technical projects that recruiters actually care about.",
    highlight: "Designed specifically for university talent",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/30 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="purple" size="md" className="mb-3">
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need To Launch Your Career
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Built from first principles to replace outdated job boards with a focused, high-signal student professional ecosystem.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card hoverEffect className="h-full border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border/60">
                      {f.icon}
                    </div>
                    <Badge variant="secondary" size="sm">
                      {f.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {f.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f.highlight}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
