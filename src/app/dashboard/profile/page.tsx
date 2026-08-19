"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  MapPin,
  Mail,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Code,
  Globe,
  FileText,
  UploadCloud,
  CheckCircle2,
  Award,
  Calendar,
  Sparkles,
  Layers,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Project, StudentProfile } from "@/types";

export default function ProfilePage() {
  const { user, updateStudentProfile } = useAuth();
  const { projects, addProject, removeProject } = useData();
  const { success, info } = useToast();

  const student = user as StudentProfile;

  const [activeTab, setActiveTab] = useState("overview");

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(student?.name || "Alex Rivera");
  const [editHeadline, setEditHeadline] = useState(
    student?.headline || "Computer Science Junior @ Stanford"
  );
  const [editBio, setEditBio] = useState(student?.bio || "");
  const [editLocation, setEditLocation] = useState(student?.location || "San Francisco, CA");

  // Skills Editing
  const [skillsList, setSkillsList] = useState<string[]>(
    student?.skills || [
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker",
    ]
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Add Project Modal
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newType, setNewType] = useState<"Personal" | "Hackathon" | "Capstone">("Personal");
  const [newLiveUrl, setNewLiveUrl] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");

  // Resume State
  const [resumeFile, setResumeFile] = useState<{
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  } | null>({
    fileName: "Alex_Rivera_SWE_Resume_2026.pdf",
    fileSize: "1.2 MB",
    uploadedAt: "Updated 2 days ago",
  });

  const profileTabs = [
    { id: "overview", label: "Overview & Skills" },
    { id: "projects", label: `Projects (${projects.length})` },
    { id: "resume", label: "Resume & Documents" },
    { id: "certifications", label: "Certifications (2)" },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      name: editName,
      headline: editHeadline,
      bio: editBio,
      location: editLocation,
      skills: skillsList,
    });
    setIsEditProfileOpen(false);
    success("Profile details updated successfully!");
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkillInput.trim()) {
      e.preventDefault();
      if (!skillsList.includes(newSkillInput.trim())) {
        const updated = [...skillsList, newSkillInput.trim()];
        setSkillsList(updated);
        updateStudentProfile({ skills: updated });
        success(`Added "${newSkillInput.trim()}" to your skills`);
      }
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updated);
    updateStudentProfile({ skills: updated });
    info(`Removed ${skillToRemove}`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProject({
      title: newTitle.trim(),
      description: newDesc.trim() || "Modern full-stack technical project.",
      technologies: newTech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      date: "Feb 2026",
      type: newType,
      liveUrl: newLiveUrl.trim() || undefined,
      githubUrl: newGithubUrl.trim() || undefined,
      featured: true,
    });

    setIsAddProjectOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewTech("");
    setNewLiveUrl("");
    setNewGithubUrl("");
  };

  return (
    <div className="space-y-8">
      {/* Profile Banner & Header Card */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Decorative Top Gradient Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-blue-900/60 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="emerald" size="sm" className="font-semibold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              Open to Summer 2026 Internships
            </Badge>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            <Avatar
              src={student?.avatar}
              name={student?.name || "Alex Rivera"}
              size="xl"
              isOnline={true}
              className="ring-4 ring-card"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {student?.name || "Alex Rivera"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {student?.headline || "Computer Science Junior @ Stanford"}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                  {student?.university || "Stanford University"} &apos;26
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {student?.location || "San Francisco, CA / Remote"}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  GPA: {student?.cgpa || "3.92 / 4.0"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview & Skills */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bio & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 border-border/80 bg-card space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                About Me
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {student?.bio ||
                  "Passionate full-stack engineer and open-source contributor. Experienced in TypeScript, React, Next.js, Node.js, and Python. Winner of CalHacks 2024. Actively seeking Summer 2026 Software Engineering internships."}
              </p>
            </Card>

            <Card className="p-6 border-border/80 bg-card space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Academic Background
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-foreground">Stanford University</div>
                    <div className="text-muted-foreground">B.S. in Computer Science (Systems &amp; AI)</div>
                    <div className="text-[11px] text-muted-foreground">Expected Graduation: May 2026 • Cumulative GPA: 3.92</div>
                  </div>
                  <Badge variant="purple" size="sm">Junior</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Skills & External Profiles (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Skills Card */}
            <Card className="p-6 border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  Technical Skills
                </h3>
                <span className="text-xs text-muted-foreground">Press enter to add</span>
              </div>

              {/* Add skill input */}
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter..."
                className="w-full h-9 px-3 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-foreground group border border-border/60"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </Card>

            {/* Coding Profiles Card */}
            <Card className="p-6 border-border/80 bg-card space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Profiles &amp; Portfolios
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-foreground" />
                    <span className="font-medium">github.com/alexrivera</span>
                  </div>
                  <Badge variant="secondary" size="sm">Placeholder</Badge>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">linkedin.com/in/alexrivera-tech</span>
                  </div>
                  <Badge variant="secondary" size="sm">Placeholder</Badge>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">alexrivera.dev</span>
                  </div>
                  <Badge variant="emerald" size="sm">Live</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Proof-of-Work Projects</h2>
              <p className="text-xs text-muted-foreground">
                Demonstrated technical craft with live demos and architecture notes.
              </p>
            </div>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsAddProjectOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <Card
                key={proj.id}
                hoverEffect
                className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="purple" size="sm" className="mb-1.5">
                        {proj.type}
                      </Badge>
                      <h3 className="font-bold text-base text-foreground">
                        {proj.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{proj.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                      <Github className="w-3.5 h-3.5" /> Repository
                    </span>
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold cursor-pointer">
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Resume & Documents */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Resume Management</h2>
            <p className="text-xs text-muted-foreground">
              Your resume is automatically attached when applying to Fast-Track internships.
            </p>
          </div>

          {resumeFile ? (
            <Card className="p-6 border-border/80 bg-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {resumeFile.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {resumeFile.fileSize} • {resumeFile.uploadedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => success("Downloading resume preview...")}
                  >
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setResumeFile(null);
                      info("Resume removed");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Drag-and-drop replace zone */}
              <div
                onClick={() => {
                  success("Updated resume uploaded!");
                  setResumeFile({
                    fileName: "Alex_Rivera_Resume_Updated.pdf",
                    fileSize: "1.3 MB",
                    uploadedAt: "Just now",
                  });
                }}
                className="p-8 border-2 border-dashed border-border hover:border-purple-500 rounded-2xl bg-card hover:bg-purple-500/5 transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
              >
                <UploadCloud className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  Click to replace current resume file
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supports PDF or DOCX up to 5MB
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-10 border-dashed border-border bg-card text-center space-y-4">
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-bold text-sm text-foreground">No Resume Uploaded</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a PDF resume to enable 1-click internship applications.
                </p>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setResumeFile({
                    fileName: "Alex_Rivera_SWE_Resume_2026.pdf",
                    fileSize: "1.2 MB",
                    uploadedAt: "Just now",
                  });
                  success("Resume uploaded successfully!");
                }}
              >
                Upload Resume
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Certifications */}
      {activeTab === "certifications" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Verified Certifications</h2>
            <p className="text-xs text-muted-foreground">
              Official credentials issued by industry organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-border/80 bg-card space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      AWS Certified Solutions Architect – Associate
                    </h3>
                    <p className="text-xs text-muted-foreground">Amazon Web Services (AWS)</p>
                  </div>
                </div>
                <Badge variant="emerald" size="sm">Verified</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <div>Issued: Jan 2025 • Credential ID: AWS-SAA-8492041</div>
                <span className="text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer">
                  Verify Credential <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </Card>

            <Card className="p-6 border-border/80 bg-card space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Meta Front-End Developer Certificate
                    </h3>
                    <p className="text-xs text-muted-foreground">Meta</p>
                  </div>
                </div>
                <Badge variant="emerald" size="sm">Verified</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <div>Issued: Sep 2024 • Credential ID: META-FED-9938210</div>
                <span className="text-purple-600 dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer">
                  Verify Credential <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Student Profile"
        description="Update your public headline, location, and bio."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Headline"
            value={editHeadline}
            onChange={(e) => setEditHeadline(e.target.value)}
            required
          />
          <Input
            label="Location"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Bio
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        title="Add Proof-of-Work Project"
        description="Showcase your technical projects, hackathon prototypes, or capstone demos."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Real-Time Distributed Cache"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Project Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Personal", "Hackathon", "Capstone"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewType(type)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    newType === type
                      ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Technologies Used"
            placeholder="React, TypeScript, WebSockets, Node.js"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
          />
          <Input
            label="Live Demo Link (Optional)"
            placeholder="https://myproject.app"
            value={newLiveUrl}
            onChange={(e) => setNewLiveUrl(e.target.value)}
          />
          <Input
            label="GitHub Repository Link (Placeholder)"
            placeholder="https://github.com/username/project"
            value={newGithubUrl}
            onChange={(e) => setNewGithubUrl(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What did you engineer and what problem does it solve?"
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddProjectOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm">
              Add Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
