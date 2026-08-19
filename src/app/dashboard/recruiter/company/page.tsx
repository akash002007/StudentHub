"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  MapPin,
  Users2,
  Sparkles,
  Edit,
  Save,
  CheckCircle,
  ExternalLink,
  Briefcase,
  Layers,
  Heart,
  PlusCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";

export default function RecruiterCompanyProfilePage() {
  const { recruiterCompany, updateCompanyProfile, recruiterInternships } = useData();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit fields
  const [name, setName] = useState(recruiterCompany.name);
  const [tagline, setTagline] = useState(recruiterCompany.tagline);
  const [industry, setIndustry] = useState(recruiterCompany.industry);
  const [website, setWebsite] = useState(recruiterCompany.website);
  const [location, setLocation] = useState(recruiterCompany.location);
  const [companySize, setCompanySize] = useState(recruiterCompany.companySize);
  const [description, setDescription] = useState(recruiterCompany.description);
  const [about, setAbout] = useState(recruiterCompany.about);

  const handleOpenEdit = () => {
    setName(recruiterCompany.name);
    setTagline(recruiterCompany.tagline);
    setIndustry(recruiterCompany.industry);
    setWebsite(recruiterCompany.website);
    setLocation(recruiterCompany.location);
    setCompanySize(recruiterCompany.companySize);
    setDescription(recruiterCompany.description);
    setAbout(recruiterCompany.about);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({
      name,
      tagline,
      industry,
      website,
      location,
      companySize,
      description,
      about,
    });
    setIsEditModalOpen(false);
  };

  const activeListings = recruiterInternships.filter((i) => i.status === "Active");

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Banner and Profile Card */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Cover Banner */}
          <div className="h-44 sm:h-52 w-full relative bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recruiterCompany.bannerImage}
              alt="Company Banner"
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute top-4 right-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-card/80 backdrop-blur-md text-xs border-border"
                onClick={handleOpenEdit}
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-card border-4 border-card shadow-xl overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recruiterCompany.logo}
                  alt={recruiterCompany.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={recruiterCompany.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {recruiterCompany.name}
                </h1>
                <Badge variant="purple" size="sm" className="font-semibold">
                  Verified Employer
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground/80">
                {recruiterCompany.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-500" />
                  {recruiterCompany.industry}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {recruiterCompany.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5 text-emerald-500" />
                  {recruiterCompany.companySize}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: About & Active Listings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* About Box */}
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <h3 className="font-bold text-base text-foreground">About the Company</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recruiterCompany.description}
              </p>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground/90 space-y-1.5">
                <span className="font-semibold text-foreground block">
                  Student Internship Program
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {recruiterCompany.about}
                </p>
              </div>
            </Card>

            {/* Active Listings Preview */}
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Active Internship Listings ({activeListings.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Currently published on StudentHub
                  </p>
                </div>
                <Link href="/dashboard/recruiter/post-internship">
                  <Button variant="ghost" size="sm">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Add Listing
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {activeListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between hover:bg-muted/70 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">
                        {listing.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {listing.department} • {listing.location} •{" "}
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {listing.stipend}
                        </span>
                      </p>
                    </div>

                    <Link href={`/dashboard/recruiter/applications`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Review ({listing.applicationsCount})
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Perks & Tech Stack (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Student Perks */}
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-base text-foreground">Internship Benefits</h3>
              </div>

              <ul className="space-y-2 text-xs">
                {recruiterCompany.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Tech Stack */}
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-base text-foreground">Engineering Tech Stack</h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recruiterCompany.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground border border-border/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Company Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Company Profile"
          description="Update your public brand presence for prospective student applicants."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <Input
              label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Input
                label="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="HQ Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label="Company Size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                Company Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                Internship Program About Section
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm">
                Save Company Profile
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
