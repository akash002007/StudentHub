"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                StudentHub
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              The professional networking and career acceleration platform built specifically for university students, campus builders, and tech innovators.
            </p>
            <div className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} StudentHub. All rights reserved.
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/internships" className="hover:text-foreground transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/dashboard/applications" className="hover:text-foreground transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link href="/dashboard/communities" className="hover:text-foreground transition-colors">
                  Peer Communities
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-foreground transition-colors">
                  Student Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Communities
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/communities" className="hover:text-foreground transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/dashboard/communities" className="hover:text-foreground transition-colors">
                  Modern Web Dev
                </Link>
              </li>
              <li>
                <Link href="/dashboard/communities" className="hover:text-foreground transition-colors">
                  DSA & Placement Prep
                </Link>
              </li>
              <li>
                <Link href="/dashboard/communities" className="hover:text-foreground transition-colors">
                  Student Founders
                </Link>
              </li>
            </ul>
          </div>

          {/* Company / Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground/60">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div>Built with passion for students worldwide.</div>
          <div className="flex items-center gap-1">
            <span>Crafted for high performance &amp; clean design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
