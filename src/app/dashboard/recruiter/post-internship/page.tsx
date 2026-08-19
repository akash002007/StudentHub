"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  Plus,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  getAllUniqueDegrees,
  getBranchesForDegrees,
} from "@/data/academic-hierarchy";

export default function PostInternshipPage() {
  const router = useRouter();
  const { recruiterCompany, addRecruiterInternship } = useData();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // Step 1: Basic Information State
  // ==========================================
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering & Software");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("San Francisco, CA / Hybrid");
  const [workType, setWorkType] = useState<"Remote" | "Hybrid" | "Onsite">("Hybrid");
  const [internshipType, setInternshipType] = useState("Summer 2026");

  // ==========================================
  // Step 2: Candidate Requirements State
  // ==========================================
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
  ]);

  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([
    "B.Tech",
    "B.E.",
    "B.S. in Computer Science",
  ]);

  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    "Computer Science & Engineering",
    "Information Technology",
    "Artificial Intelligence & Machine Learning",
  ]);

  const [minCgpa, setMinCgpa] = useState("");
  const [gradYears, setGradYears] = useState<number[]>([2026, 2027]);
  const [experienceRequirements, setExperienceRequirements] = useState(
    "Demonstrated proof-of-work projects, open source contributions, or portfolio work"
  );
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    "Design and build scalable features with industry best practices.\nCollaborate with cross-functional teams and product managers.\nParticipate in peer reviews, quality checks, and production releases."
  );

  // ==========================================
  // Step 3: Compensation & Timeline State
  // ==========================================
  const [stipend, setStipend] = useState("$55 / hr ($9,400/mo)");
  const [duration, setDuration] = useState("12 Weeks (May - Aug 2026)");
  const [deadline, setDeadline] = useState("Apr 15, 2026");
  const [openingsCount, setOpeningsCount] = useState(3);

  // ==========================================
  // Academic Data & Dynamic Branch Options
  // ==========================================
  const allAvailableDegrees = getAllUniqueDegrees();
  const availableBranchesForSelectedDegrees = getBranchesForDegrees(selectedDegrees);

  const handleDegreesChange = (newDegrees: string[]) => {
    setSelectedDegrees(newDegrees);

    if (errors.selectedDegrees && newDegrees.length > 0) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.selectedDegrees;
        return copy;
      });
    }

    // Context-aware auto-pruning: Keep only branches valid under the new degrees
    const validBranches = getBranchesForDegrees(newDegrees);
    const validBranchSet = new Set(validBranches.map((b) => b.toLowerCase()));

    setSelectedBranches((prev) =>
      prev.filter((branch) => {
        if (branch === "Other") return validBranchSet.has("other");
        return validBranchSet.has(branch.toLowerCase());
      })
    );
  };

  const handleBranchesChange = (newBranches: string[]) => {
    setSelectedBranches(newBranches);
    if (errors.selectedBranches && newBranches.length > 0) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.selectedBranches;
        return copy;
      });
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!skillInput.trim()) return;
    if (!requiredSkills.includes(skillInput.trim())) {
      const updated = [...requiredSkills, skillInput.trim()];
      setRequiredSkills(updated);
      if (errors.requiredSkills) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.requiredSkills;
          return copy;
        });
      }
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const toggleGradYear = (year: number) => {
    let updated: number[];
    if (gradYears.includes(year)) {
      if (gradYears.length > 1) {
        updated = gradYears.filter((y) => y !== year);
      } else {
        updated = gradYears;
      }
    } else {
      updated = [...gradYears, year].sort();
    }
    setGradYears(updated);
    if (errors.gradYears && updated.length > 0) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.gradYears;
        return copy;
      });
    }
  };

  // ==========================================
  // Validation Logic per Step
  // ==========================================
  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Internship / Job title is required.";
    }
    if (!department.trim()) {
      newErrors.department = "Department / Org is required.";
    }
    if (!location.trim()) {
      newErrors.location = "Primary location is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Role overview and mission description is required.";
    } else if (description.trim().length < 15) {
      newErrors.description = "Role overview must be at least 15 characters.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) {
      toastError("Please complete all required fields in Step 1.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (requiredSkills.length === 0) {
      newErrors.requiredSkills = "Please add at least one required/preferred skill.";
    }
    if (selectedDegrees.length === 0) {
      newErrors.selectedDegrees = "Please select at least one eligible degree level.";
    }
    if (selectedBranches.length === 0) {
      newErrors.selectedBranches = "Please select at least one eligible branch/major.";
    }
    if (gradYears.length === 0) {
      newErrors.gradYears = "Please select at least one graduation cohort year.";
    }
    if (!responsibilitiesText.trim()) {
      newErrors.responsibilitiesText = "Core responsibilities are required (at least one line).";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) {
      toastError("Please complete all required candidate requirements in Step 2.");
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!stipend.trim()) {
      newErrors.stipend = "Stipend amount or rate is required.";
    }
    if (!duration.trim()) {
      newErrors.duration = "Internship duration is required.";
    }
    if (!deadline.trim()) {
      newErrors.deadline = "Application deadline is required.";
    }
    if (!openingsCount || openingsCount < 1) {
      newErrors.openingsCount = "Number of openings must be at least 1.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) {
      toastError("Please complete all required compensation & timeline fields in Step 3.");
      return false;
    }
    return true;
  };

  const handleProceedFromStep1 = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const handleProceedFromStep2 = () => {
    if (validateStep2()) {
      setErrors({});
      setStep(3);
    }
  };

  const handleProceedFromStep3 = () => {
    if (validateStep3()) {
      setErrors({});
      setStep(4);
    }
  };

  const handleStepTabClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }

    if (step === 1) {
      if (!validateStep1()) return;
      if (targetStep === 2) {
        setStep(2);
        return;
      }
      if (targetStep === 3) {
        if (!validateStep2()) {
          setStep(2);
          return;
        }
        setStep(3);
        return;
      }
      if (targetStep === 4) {
        if (!validateStep2()) {
          setStep(2);
          return;
        }
        if (!validateStep3()) {
          setStep(3);
          return;
        }
        setStep(4);
        return;
      }
    }

    if (step === 2) {
      if (!validateStep2()) return;
      if (targetStep === 3) {
        setStep(3);
        return;
      }
      if (targetStep === 4) {
        if (!validateStep3()) {
          setStep(3);
          return;
        }
        setStep(4);
        return;
      }
    }

    if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
    }
  };

  // ==========================================
  // Publish Submission
  // ==========================================
  const handlePublish = () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toastError("Please verify all steps. Incomplete data cannot be submitted.");
      return;
    }

    const responsibilities = responsibilitiesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const degreeRequirementsFormatted =
      selectedDegrees.length > 0
        ? selectedDegrees.join(", ")
        : "All Degree Programs";

    const branchRequirementsFormatted =
      selectedBranches.length > 0
        ? selectedBranches.join(", ")
        : "All Eligible Majors";

    addRecruiterInternship({
      title: title.trim(),
      department,
      location: location.trim(),
      workType,
      internshipType,
      stipend: stipend.trim(),
      duration: duration.trim(),
      deadline: deadline.trim(),
      openingsCount,
      description: description.trim(),
      responsibilities,
      requiredSkills,
      degreeRequirements: degreeRequirementsFormatted,
      branchRequirements: branchRequirementsFormatted,
      degreeLevels: selectedDegrees,
      eligibleBranches: selectedBranches,
      minCgpa: minCgpa.trim() || "None",
      gradYearRequirements: gradYears,
      experienceRequirements: experienceRequirements.trim(),
    });

    success("Internship role published successfully!");
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
              Define the requirements, eligible degree levels, compensation, and target student qualifications.
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
            { num: 1 as const, label: "Basic Info" },
            { num: 2 as const, label: "Requirements" },
            { num: 3 as const, label: "Compensation" },
            { num: 4 as const, label: "Review & Post" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => handleStepTabClick(s.num)}
              className={`p-3 rounded-xl border text-left transition-all ${
                step === s.num
                  ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 shadow-xs"
                  : step > s.num
                  ? "bg-card border-border/80 text-foreground hover:border-purple-500/40"
                  : "bg-muted/40 border-border/40 text-muted-foreground hover:border-border"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Step {s.num}</span>
                {step > s.num && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              </div>
              <div className="text-xs font-semibold truncate mt-0.5">{s.label}</div>
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
                    label="Internship / Job Title *"
                    placeholder="e.g. Backend Platform Engineer Intern / Financial Analyst Intern"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.title;
                          return copy;
                        });
                      }
                    }}
                    error={errors.title}
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
                    Department / Org *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.department;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full h-10 px-3.5 rounded-xl bg-card dark:bg-[#161924] border text-xs text-foreground dark:text-slate-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 ${
                      errors.department ? "border-rose-500 dark:border-rose-500" : "border-border dark:border-[#2a3042]"
                    }`}
                  >
                    <option value="Engineering & Software" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Engineering &amp; Software</option>
                    <option value="Product Engineering" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Product Engineering</option>
                    <option value="AI & Machine Learning" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">AI &amp; Machine Learning</option>
                    <option value="Data Science & Analytics" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Data Science &amp; Analytics</option>
                    <option value="Finance, Accounting & Investment" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Finance, Accounting &amp; Investment</option>
                    <option value="Marketing & Growth Strategy" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Marketing &amp; Growth Strategy</option>
                    <option value="Healthcare & Clinical Operations" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Healthcare &amp; Clinical Operations</option>
                    <option value="Biotechnology & Life Sciences" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Biotechnology &amp; Life Sciences</option>
                    <option value="Legal, Compliance & Policy" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Legal, Compliance &amp; Policy</option>
                    <option value="Design, Architecture & Creative" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Design, Architecture &amp; Creative</option>
                    <option value="Operations & Management" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Operations &amp; Management</option>
                    <option value="Security & Infrastructure" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Security &amp; Infrastructure</option>
                    <option value="Other" className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100">Other</option>
                  </select>
                  {errors.department && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Work Location Format *
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
                    label="Primary Location *"
                    placeholder="e.g. San Francisco, CA / Seattle, WA / New York, NY"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.location;
                          return copy;
                        });
                      }
                    }}
                    error={errors.location}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Internship Cohort / Type *
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
                    Role Overview &amp; Mission *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description && e.target.value.trim().length >= 15) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.description;
                          return copy;
                        });
                      }
                    }}
                    placeholder="Describe the team mission, core problems to solve, and what makes this internship exciting..."
                    className={`w-full p-3 rounded-xl bg-card border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${
                      errors.description ? "border-rose-500 focus:border-rose-500" : "border-border"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="gradient"
                  onClick={handleProceedFromStep1}
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
                  Specify target skills, eligible degree levels, context-aware branches, and cohort details.
                </p>
              </div>

              {/* Skills input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Required &amp; Preferred Skills *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill and press Add (e.g. TypeScript, React, Python, Financial Modeling, DCF)"
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

                {errors.requiredSkills && (
                  <p className="text-xs text-rose-500 font-medium">{errors.requiredSkills}</p>
                )}

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
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {requiredSkills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Multi-Select Degree Level & Dependent Branches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <MultiSelect
                    label="Degree Level * (Multi-Select)"
                    placeholder="Select degree levels..."
                    searchPlaceholder="Search degree programs (e.g. B.Tech, B.Sc, MBA, MBBS)..."
                    options={allAvailableDegrees}
                    value={selectedDegrees}
                    onChange={handleDegreesChange}
                    error={errors.selectedDegrees}
                    helperText="Select all degrees eligible for this role."
                  />
                </div>

                <div>
                  <MultiSelect
                    label="Eligible Branches / Majors * (Multi-Select)"
                    placeholder={
                      selectedDegrees.length === 0
                        ? "Select degrees first..."
                        : "Select eligible branches..."
                    }
                    searchPlaceholder="Search branches / majors..."
                    options={availableBranchesForSelectedDegrees}
                    value={selectedBranches}
                    onChange={handleBranchesChange}
                    disabled={selectedDegrees.length === 0}
                    error={errors.selectedBranches}
                    helperText={
                      selectedDegrees.length === 0
                        ? "Choose degree levels above to view relevant branches."
                        : `Showing branches for: ${selectedDegrees.slice(0, 3).join(", ")}${
                            selectedDegrees.length > 3 ? ` +${selectedDegrees.length - 3} more` : ""
                          }`
                    }
                    emptyMessage="No matching branches for the selected degrees."
                  />
                </div>

                <div>
                  <Input
                    label="Minimum CGPA (Optional)"
                    placeholder="e.g. 3.4 / 4.0 or leave blank"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    helperText="Optional criterion. Leave blank if not required."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Graduation Year Cohort *
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
                  {errors.gradYears && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{errors.gradYears}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Experience &amp; Portfolio Criteria"
                    placeholder="e.g. Prior internship, live project demos, research papers, or portfolio work"
                    value={experienceRequirements}
                    onChange={(e) => setExperienceRequirements(e.target.value)}
                    helperText="Optional details on past work, portfolio, or publications expected."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
                    Core Responsibilities * (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={responsibilitiesText}
                    onChange={(e) => {
                      setResponsibilitiesText(e.target.value);
                      if (errors.responsibilitiesText && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.responsibilitiesText;
                          return copy;
                        });
                      }
                    }}
                    placeholder="Enter key daily responsibilities..."
                    className={`w-full p-3 rounded-xl bg-card border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-sans ${
                      errors.responsibilitiesText ? "border-rose-500 focus:border-rose-500" : "border-border"
                    }`}
                  />
                  {errors.responsibilitiesText && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{errors.responsibilitiesText}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setErrors({});
                    setStep(1);
                  }}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  onClick={handleProceedFromStep2}
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
                    label="Hourly / Monthly Stipend *"
                    placeholder="e.g. $55 / hr ($9,400/mo) or ₹45,000 / mo"
                    value={stipend}
                    onChange={(e) => {
                      setStipend(e.target.value);
                      if (errors.stipend && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.stipend;
                          return copy;
                        });
                      }
                    }}
                    error={errors.stipend}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Internship Duration *"
                    placeholder="e.g. 12 Weeks (May - Aug 2026)"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      if (errors.duration && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.duration;
                          return copy;
                        });
                      }
                    }}
                    error={errors.duration}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Application Deadline *"
                    placeholder="e.g. Apr 15, 2026"
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (errors.deadline && e.target.value.trim()) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.deadline;
                          return copy;
                        });
                      }
                    }}
                    error={errors.deadline}
                    leftIcon={<Calendar className="w-4 h-4" />}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Number of Headcount Openings *"
                    type="number"
                    min={1}
                    max={50}
                    value={openingsCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOpeningsCount(val);
                      if (errors.openingsCount && val >= 1) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.openingsCount;
                          return copy;
                        });
                      }
                    }}
                    error={errors.openingsCount}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setErrors({});
                    setStep(2);
                  }}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  onClick={handleProceedFromStep3}
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
                  Confirm the details below. Once published, students matching these requirements will see this in their feed.
                </p>
              </div>

              {/* Listing Card Preview */}
              <div className="p-6 rounded-2xl bg-muted/40 border border-purple-500/30 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="purple" size="sm" className="mb-2 font-semibold">
                      {internshipType} • {workType} • {department}
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
                    {openingsCount} {openingsCount === 1 ? "Opening" : "Openings"}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description || "Join our team to work on mission-critical projects."}
                </p>

                {/* Target Degrees & Branches Preview */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="text-xs font-semibold text-foreground">Eligible Degree Levels:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDegrees.map((deg) => (
                      <span
                        key={deg}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-semibold"
                      >
                        {deg}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-semibold text-foreground pt-1">Eligible Branches / Majors:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBranches.map((br) => (
                      <span
                        key={br}
                        className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-medium text-foreground"
                      >
                        {br}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
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
                    <strong className="text-foreground">{minCgpa ? `${minCgpa}+` : "None"}</strong>
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
                  onClick={() => {
                    setErrors({});
                    setStep(3);
                  }}
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
