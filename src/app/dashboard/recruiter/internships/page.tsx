"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Users2,
  Calendar,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  XCircle,
  Edit,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { RecruiterInternship, RecruiterInternshipStatus } from "@/types";

export default function RecruiterInternshipsPage() {
  const router = useRouter();
  const {
    recruiterInternships,
    updateRecruiterInternshipStatus,
    updateRecruiterInternship,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInternship, setSelectedInternship] = useState<RecruiterInternship | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editStipend, setEditStipend] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const filteredInternships = recruiterInternships.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (internship: RecruiterInternship) => {
    setSelectedInternship(internship);
    setEditTitle(internship.title);
    setEditStipend(internship.stipend);
    setEditDeadline(internship.deadline);
    setEditDescription(internship.description);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;
    updateRecruiterInternship(selectedInternship.id, {
      title: editTitle,
      stipend: editStipend,
      deadline: editDeadline,
      description: editDescription,
    });
    setIsEditModalOpen(false);
  };

  const handleOpenView = (internship: RecruiterInternship) => {
    setSelectedInternship(internship);
    setIsViewModalOpen(true);
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Job Listings Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Manage Internships
            </h1>
            <p className="text-xs text-muted-foreground">
              Track posted listings, application influx, shortlisted candidates, and listing status.
            </p>
          </div>

          <Link href="/dashboard/recruiter/post-internship">
            <Button variant="gradient" size="sm" rightIcon={<PlusCircle className="w-4 h-4" />}>
              Post New Internship
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by title, department, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border self-stretch sm:self-auto overflow-x-auto">
            {["all", "Active", "Paused", "Closed"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? "All Listings" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredInternships.map((internship) => {
            const isPaused = internship.status === "Paused";
            const isClosed = internship.status === "Closed";
            const isActive = internship.status === "Active";

            return (
              <Card
                key={internship.id}
                hoverEffect
                className="p-5 sm:p-6 border-border/80 bg-card space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line with status badge and cohort */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        isActive ? "emerald" : isPaused ? "purple" : "rose"
                      }
                      size="sm"
                      className="font-bold"
                    >
                      {internship.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      Posted: {internship.postedDate}
                    </span>
                  </div>

                  {/* Title & Dept */}
                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {internship.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {internship.department} • {internship.location} •{" "}
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {internship.stipend}
                      </span>
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {internship.requiredSkills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                    {internship.requiredSkills.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                        +{internship.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                        Applicants
                      </span>
                      <strong className="text-foreground text-sm font-extrabold">
                        {internship.applicationsCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                        Shortlisted
                      </span>
                      <strong className="text-purple-600 dark:text-purple-400 text-sm font-extrabold">
                        {internship.shortlistedCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                        Views
                      </span>
                      <strong className="text-foreground text-sm font-extrabold">
                        {internship.viewsCount}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleOpenView(internship)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleOpenEdit(internship)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Pause / Resume Button */}
                    {!isClosed && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() =>
                          updateRecruiterInternshipStatus(
                            internship.id,
                            isActive ? "Paused" : "Active"
                          )
                        }
                      >
                        {isActive ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Resume
                          </>
                        )}
                      </Button>
                    )}

                    {/* View Applications */}
                    <Link href={`/dashboard/recruiter/applications`}>
                      <Button variant="gradient" size="sm" className="text-xs h-8">
                        Candidates ({internship.applicationsCount})
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* View Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={selectedInternship?.title || "Internship Details"}
          description={`${selectedInternship?.department} • ${selectedInternship?.location}`}
          maxWidth="xl"
        >
          {selectedInternship && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="font-semibold text-foreground">Role Description:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedInternship.description}
                </p>
              </div>

              <div>
                <span className="font-semibold text-foreground block mb-1">Key Responsibilities:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selectedInternship.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[11px] text-muted-foreground block">Degree Requirement</span>
                  <strong className="text-foreground">{selectedInternship.degreeRequirements}</strong>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[11px] text-muted-foreground block">Compensation</span>
                  <strong className="text-purple-600 dark:text-purple-400">
                    {selectedInternship.stipend}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[11px] text-muted-foreground block">Duration</span>
                  <strong className="text-foreground">{selectedInternship.duration}</strong>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[11px] text-muted-foreground block">Application Deadline</span>
                  <strong className="text-rose-500">{selectedInternship.deadline}</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Internship Details"
          description="Update stipend, deadline, or description for this role."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Internship Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Input
              label="Stipend Rate"
              value={editStipend}
              onChange={(e) => setEditStipend(e.target.value)}
            />
            <Input
              label="Application Deadline"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
