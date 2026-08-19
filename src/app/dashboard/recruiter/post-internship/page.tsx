"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  GraduationCap,
  Plus,
  X,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function PostInternshipPage() {
  const router = useRouter();
  const { recruiterCompany, addRecruiterInternship } = useData();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("San Francisco, CA / Hybrid");
  const [workType, setWorkType] = useState<"Remote" | "Hybrid" | "Onsite">("Hybrid");
  const [internshipType, setInternshipType] = useState("Summer 2026");

  // Step 2 Requirements
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
  ]);
  const [degreeRequirements, setDegreeRequirements] = useState(
    "B.S., B.E., or M.S. in Computer Science or related STEM field"
  );
  const [branchRequirements, setBranchRequirements] = useState(
    "Computer Science, Software Engineering, Electrical Engineering"
  );
  const [minCgpa, setMinCgpa] = useState("3.4");
  const [gradYears, setGradYears] = useState<number[]>([2026, 2027]);
  const [experienceRequirements, setExperienceRequirements] = useState(
    "Demonstrated proof-of-work projects, open source contributions, or hackathon achievements"
  );
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    "Design and build scalable services with modern software best practices.\nCollaborate with product designers and senior engineers.\nParticipate in code reviews, automated testing, and production deployment."
  );

  // Step 3 Compensation & Timeline
  const [stipend, setStipend] = useState("$55 / hr ($9,400/mo)");
  const [duration, setDuration] = useState("12 Weeks (May - Aug 2026)");
  const [deadline, setDeadline] = useState("Apr 15, 2026");
  const [openingsCount, setOpeningsCount] = useState(3);

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!skillInput.trim()) return;
    if (!requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const toggleGradYear = (year: number) => {
    if (gradYears.includes(year)) {
      if (gradYears.length > 1) {
        setGradYears(gradYears.filter((y) => y !== year));
      }
    } else {
      setGradYears([...gradYears, year].sort());
    }
  };

  const handlePublish = () => {
    const responsibilities = responsibilitiesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    addRecruiterInternship({
      title: title.trim() || "Software Engineering Intern",
      department,
      location,
      workType,
      internshipType,
      stipend,
      duration,
      deadline,
      openingsCount,
      description:
        description.trim() ||
        `Exciting student internship role at ${recruiterCompany.name} focusing on high-impact projects.`,
      responsibilities,
      requiredSkills,
      degreeRequirements,
      branchRequirements,
      minCgpa,
      gradYearRequirements: gradYears,
      experienceRequirements,
    });

    router.push("/dashboard/recruiter/internships");
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hiring Pipeline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Create &amp; Post Internship
            </h1>
            <p className="text-xs text-muted-foreground">
              Define the requirements, compensation, and target student qualifications.
            </p>
          </div>
          <Link href="/dashboard/recruiter/internships">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Requirements" },
            { num: 3, label: "Compensation" },
            { num: 4, label: "Review & Post" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`p-3 rounded-xl border text-left transition-all ${
                step === s.num
                  ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 shadow-xs"
                  : step > s.num
                  ? "bg-card border-border/80 text-foreground"
                  : "bg-muted/40 border-border/40 text-muted-foreground"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">Step {s.num}</div>
              <div className="text-xs font-semibold truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Multi-step Form Card */}
        <Card className="p-6 sm:p-8 border-border/80 bg-card space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">1. Basic Information</h2>
                <p className="text-xs text-muted-foreground">
                  Role title, company entity, department, and work location format.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Internship Title"
                    placeholder="e.g. Backend Platform Engineer Intern"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Hiring Company
                  </label>
                  <div className="h-10 px-3.5 rounded-xl bg-muted/60 border border-border text-xs flex items-center gap-2 font-semibold text-foreground">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span>{recruiterCompany.name} (Verified Employer)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Department / Org
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Engineering">Product Engineering</option>
                    <option value="AI & Risk Engineering">AI &amp; Risk Engineering</option>
                    <option value="Design & UX">Design &amp; UX</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Security & Infrastructure">Security &amp; Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Work Location Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Remote", "Hybrid", "Onsite"] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWorkType(w)}
                        className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                          workType === w
                            ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Input
                    label="Primary Location"
                    placeholder="e.g. San Francisco, CA / Seattle, WA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Internship Cohort / Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Summer 2026", "Fall 2025", "Winter 2026", "Year-round"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInternshipType(type)}
                        className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                          internshipType === type
                            ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Role Overview &amp; Mission
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the team mission, core problems to solve, and what makes this internship exciting..."
                    className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="gradient"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Requirements
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">2. Candidate Requirements</h2>
                <p className="text-xs text-muted-foreground">
                  Specify target skills, degrees, major, minimum GPA, and graduation cohort.
                </p>
              </div>

              {/* Skills input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Required &amp; Preferred Skills
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill and press Add (e.g. Go, Rust, React, PyTorch)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={() => handleAddSkill()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 text-xs flex items-center gap-1.5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Degree Level"
                    placeholder="e.g. B.S., B.E., or M.S. in Computer Science"
                    value={degreeRequirements}
                    onChange={(e) => setDegreeRequirements(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Eligible Branches / Majors"
                    placeholder="e.g. Computer Science, AI, EE"
                    value={branchRequirements}
                    onChange={(e) => setBranchRequirements(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Minimum CGPA (Optional)"
                    placeholder="e.g. 3.4"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Graduation Year Cohort
                  </label>
                  <div className="flex gap-2">
                    {[2025, 2026, 2027, 2028].map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleGradYear(year)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          gradYears.includes(year)
                            ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Experience &amp; Portfolio Criteria"
                    placeholder="e.g. Prior internship or high-quality GitHub open source work"
                    value={experienceRequirements}
                    onChange={(e) => setExperienceRequirements(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Core Responsibilities (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    placeholder="Enter key daily responsibilities..."
                    className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  onClick={() => setStep(3)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Compensation
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Compensation & Timeline */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">3. Compensation &amp; Timeline</h2>
                <p className="text-xs text-muted-foreground">
                  Stipend rate, internship duration, application deadline, and total available openings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Hourly / Monthly Stipend"
                    placeholder="e.g. $55 / hr ($9,400/mo)"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Input
                    label="Internship Duration"
                    placeholder="e.g. 12 Weeks (May - Aug 2026)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Application Deadline"
                    placeholder="e.g. Apr 15, 2026"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Input
                    label="Number of Headcount Openings"
                    type="number"
                    min={1}
                    max={20}
                    value={openingsCount}
                    onChange={(e) => setOpeningsCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  onClick={() => setStep(4)}
                  rightIcon={<Eye className="w-4 h-4" />}
                >
                  Review &amp; Preview
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Preview & Publish */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground">4. Review Listing Preview</h2>
                <p className="text-xs text-muted-foreground">
                  Confirm the details below. Once published, students will see this in their recommendation feed.
                </p>
              </div>

              {/* Listing Card Preview */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-purple-500/30 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="purple" size="sm" className="mb-2 font-semibold">
                      {internshipType} • {workType}
                    </Badge>
                    <h3 className="text-xl font-extrabold text-foreground">
                      {title || "Software Engineering Intern"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recruiterCompany.name} • {location} •{" "}
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {stipend}
                      </span>
                    </p>
                  </div>
                  <Badge variant="emerald" size="sm" className="font-bold">
                    {openingsCount} Openings
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description || "Join our team to work on mission-critical product features."}
                </p>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="text-xs font-semibold text-foreground">Required Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-medium text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Min CGPA</span>
                    <strong className="text-foreground">{minCgpa}+</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Duration</span>
                    <strong className="text-foreground">{duration}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Deadline</span>
                    <strong className="text-rose-500">{deadline}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(3)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  onClick={handlePublish}
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Publish Internship to StudentHub
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </RoleGuard>
  );
}
