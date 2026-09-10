"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Plus,
  X,
  ShieldCheck,
  Layers,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useToast } from "@/context/ToastContext";
import {
  getAllUniqueDegrees,
  getBranchesForDegrees,
} from "@/data/academic-hierarchy";
import { EmploymentType, WorkMode, RecruitmentStage, StageWeights } from "@/types";

export default function CreateRecruitmentDrivePage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info & Employment
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("Core Engineering");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [workMode, setWorkMode] = useState<WorkMode>("HYBRID");
  const [location, setLocation] = useState("San Francisco, CA / Hybrid");
  const [openingsCount, setOpeningsCount] = useState(5);
  const [salaryStipend, setSalaryStipend] = useState("$140,000 - $170,000 / yr");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );

  // Step 2: Structured Eligibility Criteria
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([
    "B.Tech",
    "B.E.",
    "B.S. in Computer Science",
    "M.Tech",
    "M.S.",
  ]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    "Computer Science & Engineering",
    "Information Technology",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
  ]);
  const [minCgpa, setMinCgpa] = useState("3.5");
  const [maxBacklogs, setMaxBacklogs] = useState(1);
  const [gradYears, setGradYears] = useState<number[]>([2025, 2026, 2027]);
  const [freshersAllowed, setFreshersAllowed] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
    "Python",
  ]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    "PostgreSQL",
    "System Design",
    "Docker",
    "AWS",
  ]);
  const [prefSkillInput, setPrefSkillInput] = useState("");
  const [remoteAllowed, setRemoteAllowed] = useState(true);

  // Step 3: Selection Stages & Weights
  const [stages, setStages] = useState<RecruitmentStage[]>([
    {
      id: "stage_1",
      driveId: "",
      name: "Stage 1: Eligibility & Screening",
      type: "SCREENING",
      order: 1,
      description: "Automated eligibility rules evaluation & profile inspection.",
      passingScore: 70,
      status: "COMPLETED",
    },
    {
      id: "stage_2",
      driveId: "",
      name: "Stage 2: Technical Assessment",
      type: "ASSESSMENT",
      order: 2,
      description: "Timed coding test and system design problem solving.",
      passingScore: 75,
      status: "IN_PROGRESS",
    },
    {
      id: "stage_3",
      driveId: "",
      name: "Stage 3: Engineering Interview",
      type: "INTERVIEW",
      order: 3,
      description: "1-on-1 technical deep-dive and architectural discussion.",
      passingScore: 80,
      status: "PENDING",
    },
    {
      id: "stage_4",
      driveId: "",
      name: "Stage 4: Final Selection & Offer",
      type: "FINAL_SELECTION",
      order: 4,
      description: "Weighted composite merit ranking and final offer publication.",
      passingScore: 80,
      status: "PENDING",
    },
  ]);
  const [assessmentWeight, setAssessmentWeight] = useState(60);
  const [interviewWeight, setInterviewWeight] = useState(40);

  const allAvailableDegrees = getAllUniqueDegrees();
  const availableBranches = getBranchesForDegrees(selectedDegrees);

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddPrefSkill = () => {
    if (prefSkillInput.trim() && !preferredSkills.includes(prefSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      setPrefSkillInput("");
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const validateStep1 = () => {
    const errs: { [k: string]: string } = {};
    if (!title.trim()) errs.title = "Drive title is required.";
    if (!position.trim()) errs.position = "Job / Position title is required.";
    if (!description.trim()) errs.description = "Job description is required.";
    if (!salaryStipend.trim()) errs.salaryStipend = "Compensation is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: { [k: string]: string } = {};
    if (selectedDegrees.length === 0) errs.degrees = "Select at least one degree.";
    if (selectedBranches.length === 0) errs.branches = "Select at least one branch.";
    if (requiredSkills.length === 0) errs.skills = "Add at least one required skill.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceed = (targetStep: 1 | 2 | 3 | 4) => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep(targetStep);
  };

  const handleSaveDrive = async (statusToSet: "DRAFT" | "APPLICATIONS_OPEN") => {
    if (!validateStep1() || !validateStep2()) {
      toastError("Please complete all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        position: position.trim(),
        department,
        description: description.trim(),
        employmentType,
        workMode,
        location: location.trim(),
        openingsCount: Number(openingsCount),
        salaryStipend: salaryStipend.trim(),
        startDate,
        endDate,
        status: statusToSet,
        eligibilityCriteria: {
          degrees: selectedDegrees,
          branches: selectedBranches,
          minCgpa: minCgpa ? parseFloat(minCgpa) : 0,
          maxBacklogs: Number(maxBacklogs),
          gradYears,
          freshersAllowed,
          requiredSkills,
          preferredSkills,
          eligibleLocations: [location.trim()],
          remoteAllowed,
        },
        stages,
        stageWeights: {
          assessmentWeight: Number(assessmentWeight),
          interviewWeight: Number(interviewWeight),
        },
      };

      const res = await fetch("/api/recruiter/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success(
          statusToSet === "APPLICATIONS_OPEN"
            ? "Recruitment Drive published live successfully!"
            : "Recruitment Drive draft saved successfully!"
        );
        router.push("/dashboard/recruiter/drives");
      } else {
        toastError("Failed to create recruitment drive.");
      }
    } catch (err) {
      console.error(err);
      toastError("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/dashboard/recruiter/drives"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Drives
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Create Structured Recruitment Drive
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configure deterministic eligibility rules, multi-stage assessment pipelines, and weighted merit scoring.
            </p>
          </div>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Basic Info & Role" },
            { num: 2, label: "Eligibility Criteria" },
            { num: 3, label: "Stages & Scoring" },
            { num: 4, label: "Review & Publish" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => handleProceed(s.num as any)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                step === s.num
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : step > s.num
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">Step {s.num}</div>
              <div className="text-xs font-extrabold truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="p-6 space-y-5 bg-card border-border shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-extrabold text-foreground">
                Step 1: Role Overview & Employment Terms
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  Recruitment Drive Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Development Engineer 2026"
                  error={errors.title}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Position / Designation <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. SDE (Full-Stack)"
                  error={errors.position}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Department</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Engineering"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500"
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500"
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Hybrid"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Number of Openings</label>
                <Input
                  type="number"
                  min="1"
                  value={openingsCount}
                  onChange={(e) => setOpeningsCount(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Salary / Compensation</label>
                <Input
                  value={salaryStipend}
                  onChange={(e) => setSalaryStipend(e.target.value)}
                  placeholder="e.g. $140,000 - $170,000 / yr"
                  error={errors.salaryStipend}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Application Deadline</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">Job Description & Responsibilities</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe key responsibilities, team impact, and required technical depth..."
                  className="w-full p-3 text-xs rounded-xl bg-card border border-border focus:outline-none focus:border-blue-500"
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="gradient" onClick={() => handleProceed(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Eligibility Criteria
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Structured Eligibility Criteria */}
        {step === 2 && (
          <Card className="p-6 space-y-5 bg-card border-border shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Step 2: Structured Eligibility Engine Builder
                </h2>
                <p className="text-xs text-muted-foreground">
                  These criteria are automatically computed against candidate student profiles for instant pass/fail validation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Degree selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Eligible Degrees</label>
                <MultiSelect
                  options={allAvailableDegrees.map((d) => ({ label: d, value: d }))}
                  value={selectedDegrees}
                  onChange={setSelectedDegrees}
                  placeholder="Select qualifying degree programs..."
                />
              </div>

              {/* Branch selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Eligible Disciplines / Majors</label>
                <MultiSelect
                  options={availableBranches.map((b) => ({ label: b, value: b }))}
                  value={selectedBranches}
                  onChange={setSelectedBranches}
                  placeholder="Select qualifying branches / streams..."
                />
              </div>

              {/* Academic Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Minimum CGPA (0-4.0)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    placeholder="e.g. 3.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Max Active Backlogs</label>
                  <Input
                    type="number"
                    min="0"
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Eligible Cohort Years</label>
                  <div className="flex gap-2 pt-1">
                    {[2025, 2026, 2027, 2028].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() =>
                          setGradYears(
                            gradYears.includes(yr)
                              ? gradYears.filter((y) => y !== yr)
                              : [...gradYears, yr]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          gradYears.includes(yr)
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground">
                  Mandatory Required Skills (Engine verifies against student profiles)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type skill & press Enter or Add (e.g. TypeScript, React)..."
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground">
                  Preferred / Nice-to-Have Skills
                </label>
                <div className="flex gap-2">
                  <Input
                    value={prefSkillInput}
                    onChange={(e) => setPrefSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPrefSkill())}
                    placeholder="e.g. PostgreSQL, AWS, Docker..."
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddPrefSkill}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-muted text-foreground border border-border"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemovePrefSkill(skill)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="gradient" onClick={() => handleProceed(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Selection Stages
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Selection Stages & Scoring Weights */}
        {step === 3 && (
          <Card className="p-6 space-y-5 bg-card border-border shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Step 3: Multi-Stage Pipeline & Weighted Merit Formula
                </h2>
                <p className="text-xs text-muted-foreground">
                  Define the recruitment sequence and configure transparent scoring weights.
                </p>
              </div>
            </div>

            {/* Stage List */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground">Selection Stages Sequence</label>
              <div className="space-y-2.5">
                {stages.map((stg, i) => (
                  <div
                    key={stg.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">
                        {stg.order}
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground">{stg.name}</div>
                        <div className="text-[11px] text-muted-foreground">{stg.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-muted-foreground">
                        Min Pass: <strong className="text-foreground">{stg.passingScore}%</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weighted Merit Formula */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-foreground">
                  Transparent Merit Ranking Formula
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Assessment Score Weight ({assessmentWeight}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={assessmentWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAssessmentWeight(val);
                      setInterviewWeight(100 - val);
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Interview Score Weight ({interviewWeight}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={interviewWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setInterviewWeight(val);
                      setAssessmentWeight(100 - val);
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border text-center font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                Final Score = (Assessment × {assessmentWeight}%) + (Interview × {interviewWeight}%)
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="gradient" onClick={() => handleProceed(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review & Publish
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review & Publish */}
        {step === 4 && (
          <Card className="p-6 space-y-6 bg-card border-border shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Step 4: Review Drive Configuration
                </h2>
                <p className="text-xs text-muted-foreground">
                  Verify your structured eligibility parameters and selection stages before publishing live.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/60">
                <div>
                  <span className="text-muted-foreground">Title</span>
                  <div className="font-extrabold text-foreground mt-0.5">{title}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Role / Dept</span>
                  <div className="font-extrabold text-foreground mt-0.5">
                    {position} • {department}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Openings</span>
                  <div className="font-extrabold text-foreground mt-0.5">{openingsCount} Positions</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Compensation</span>
                  <div className="font-extrabold text-emerald-600 mt-0.5">{salaryStipend}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border space-y-2">
                <span className="font-bold text-foreground">Configured Eligibility Rules</span>
                <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                  <li>
                    Qualifying Degrees: <strong className="text-foreground">{selectedDegrees.join(", ")}</strong>
                  </li>
                  <li>
                    Disciplines: <strong className="text-foreground">{selectedBranches.join(", ")}</strong>
                  </li>
                  <li>
                    Minimum CGPA: <strong className="text-foreground">{minCgpa}</strong> • Max Backlogs:{" "}
                    <strong className="text-foreground">{maxBacklogs}</strong>
                  </li>
                  <li>
                    Graduation Cohort: <strong className="text-foreground">{gradYears.join(", ")}</strong>
                  </li>
                  <li>
                    Required Skills: <strong className="text-foreground">{requiredSkills.join(", ")}</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  isLoading={isSubmitting}
                  onClick={() => handleSaveDrive("DRAFT")}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="gradient"
                  isLoading={isSubmitting}
                  onClick={() => handleSaveDrive("APPLICATIONS_OPEN")}
                >
                  Publish Recruitment Drive Live
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
