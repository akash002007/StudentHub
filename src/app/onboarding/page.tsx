"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UploadCloud,
  IdCard,
  Receipt,
  User,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  ShieldCheck,
  Building,
  BookOpen,
  Calendar,
  X,
  RefreshCw,
  Camera,
  Info,
  Check,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { StudentProfile, VerificationType, VerificationStatus } from "@/types";
import {
  ACADEMIC_HIERARCHY,
  getProgramsForStream,
  getSpecializationsForProgram,
} from "@/data/academic-hierarchy";

const POPULAR_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Tailwind CSS",
  "Git",
  "Java",
  "C++",
  "AWS",
  "Figma",
  "Machine Learning",
  "Data Analysis",
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    role,
    isAuthenticated,
    isLoaded,
    updateStudentProfile,
    submitStudentVerification,
    reviewVerification,
    resetVerificationForResubmission,
  } = useAuth();
  const { success, error: toastError, info } = useToast();

  const student = user?.role === "student" ? (user as StudentProfile) : null;

  // Multi-step: 1: Profile, 2: Verification Option, 3: Personal Email (if ID card), 4: Status / Pending Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State: Profile Details
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [academicStream, setAcademicStream] = useState("Engineering & Technology");
  const [degree, setDegree] = useState("B.Tech");
  const [specialization, setSpecialization] = useState("Computer Science & Engineering");
  const [yearOfStudy, setYearOfStudy] = useState("1st Year");
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear() + 4);
  const [skills, setSkills] = useState<string[]>(["TypeScript", "React"]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Resume Upload State
  const [resumeData, setResumeData] = useState<{
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    url?: string;
  } | null>(null);

  // Form State: Verification
  const [verificationType, setVerificationType] = useState<VerificationType>("payment_receipt");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    url: string;
    rawFile?: File;
  } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Form State: Personal Email (for ID card flow)
  const [personalEmail, setPersonalEmail] = useState("");
  const [personalEmailError, setPersonalEmailError] = useState("");

  // Admin Review Simulator State (For testing/reviewing)
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [showAdminReviewTools, setShowAdminReviewTools] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Sync state with current authenticated student profile
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isLoaded && role === "recruiter") {
      router.replace("/dashboard/recruiter");
      return;
    }

    if (student) {
      setName(student.name || "");
      setUniversity(student.university || "");
      if (student.academicStream) setAcademicStream(student.academicStream);
      if (student.degree) setDegree(student.degree);
      if (student.specialization || student.branch)
        setSpecialization(student.specialization || student.branch);
      if (student.yearOfStudy) setYearOfStudy(student.yearOfStudy);
      if (student.graduationYear) setGraduationYear(student.graduationYear);
      if (student.skills && student.skills.length > 0) setSkills(student.skills);
      if (student.phone) setPhone(student.phone);
      if (student.avatar) setAvatar(student.avatar);
      if (student.bio) setBio(student.bio);
      if (student.headline) setHeadline(student.headline);
      if (student.resume) setResumeData(student.resume);
      if (student.socialLinks?.github) setGithub(student.socialLinks.github);
      if (student.socialLinks?.linkedin) setLinkedin(student.socialLinks.linkedin);
      if (student.socialLinks?.portfolio) setPortfolio(student.socialLinks.portfolio);
      if (student.personalEmail) setPersonalEmail(student.personalEmail);

      // If user has already completed onboarding / submitted verification, determine current step
      const stepParam = searchParams.get("step");
      if (stepParam === "verification") {
        setCurrentStep(2);
      } else if (
        student.verificationStatus === "pending" ||
        student.verificationStatus === "approved" ||
        student.verificationStatus === "rejected" ||
        student.onboardingCompleted
      ) {
        setCurrentStep(4);
      } else if (student.accountStatus === "profile_complete") {
        setCurrentStep(2);
      }
    }
  }, [student, isLoaded, isAuthenticated, role, router, searchParams]);

  // Derived programs & specializations based on selected stream
  const availablePrograms = getProgramsForStream(academicStream);
  const availableSpecializations = getSpecializationsForProgram(academicStream, degree);

  const handleStreamChange = (streamName: string) => {
    setAcademicStream(streamName);
    const programs = getProgramsForStream(streamName);
    const firstProg = programs[0]?.name || "Other";
    setDegree(firstProg);
    const specs = getSpecializationsForProgram(streamName, firstProg);
    setSpecialization(specs[0] || "General");
  };

  const handleDegreeChange = (degreeName: string) => {
    setDegree(degreeName);
    const specs = getSpecializationsForProgram(academicStream, degreeName);
    setSpecialization(specs[0] || "General");
  };

  // Skill Management
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Resume File Upload (Simulated & Stored safely)
  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      toastError("Please upload a valid PDF or DOCX file");
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      toastError("Resume file size must be less than 10 MB");
      return;
    }

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setResumeData({
      fileName: file.name,
      fileSize: sizeStr,
      uploadedAt: "Uploaded just now",
      url: URL.createObjectURL(file),
    });
    success(`Resume "${file.name}" attached successfully`);
  };

  // Verification Document Selection & Validation
  const handleVerificationFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type: PDF, PNG, JPG, JPEG, WEBP
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const isExtensionValid = !!file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i);

    if (!allowedMimeTypes.includes(file.type) && !isExtensionValid) {
      setUploadError("Invalid file type. Please upload a PDF, PNG, or JPG document.");
      return;
    }

    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10 MB. Please upload a smaller document.");
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    // Create safe preview object URL
    const previewUrl = URL.createObjectURL(file);

    setUploadedFile({
      name: file.name,
      size: sizeStr,
      url: previewUrl,
      rawFile: file,
    });
  };

  // Step 1 Submission: Save Profile
  const handleSaveProfileStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastError("Please enter your full name");
      return;
    }
    if (!university.trim()) {
      toastError("Please enter your university or college name");
      return;
    }
    if (skills.length === 0) {
      toastError("Please select or add at least one skill");
      return;
    }

    const generatedHeadline =
      headline.trim() ||
      `${degree || "Student"} in ${specialization || "Computer Science"} @ ${university}`;

    updateStudentProfile({
      name: name.trim(),
      university: university.trim(),
      academicStream,
      degree,
      specialization,
      branch: specialization,
      yearOfStudy,
      graduationYear: Number(graduationYear),
      skills,
      phone: phone.trim(),
      avatar,
      bio: bio.trim(),
      headline: generatedHeadline,
      resume: resumeData,
      socialLinks: {
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
      },
      accountStatus: "profile_complete",
    });

    success("Profile details saved! Please choose your verification method.");
    setCurrentStep(2);
  };

  // Step 2 Action: Handle Verification Option Submission
  const handleVerificationNext = () => {
    if (!uploadedFile) {
      setUploadError("Please select and upload a verification document to continue.");
      return;
    }

    if (verificationType === "student_id_card") {
      // Move to personal email step
      setCurrentStep(3);
    } else {
      // Payment Receipt: Submit directly for manual review
      submitDocumentAndFinalize();
    }
  };

  // Step 3 Action: Submit Personal Email + ID Card for Manual Review
  const handlePersonalEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalEmailError("");

    if (!personalEmail.trim() || !personalEmail.includes("@") || !personalEmail.includes(".")) {
      setPersonalEmailError("Please enter a valid personal email address (e.g. name@gmail.com)");
      return;
    }

    if (personalEmail.trim().toLowerCase() === student?.email.toLowerCase()) {
      setPersonalEmailError(
        "Personal email should be different from your university email used during registration."
      );
      return;
    }

    submitDocumentAndFinalize(personalEmail.trim());
  };

  // Common submit function: Creates verification request with status Pending Manual Review
  const submitDocumentAndFinalize = (customPersonalEmail?: string) => {
    if (!uploadedFile) return;

    setIsUploading(true);

    setTimeout(() => {
      submitStudentVerification({
        verificationType,
        documentName: uploadedFile.name,
        documentSize: uploadedFile.size,
        documentUrl: uploadedFile.url,
        personalEmail: customPersonalEmail || personalEmail,
      });

      setIsUploading(false);
      success("Verification document submitted for manual review!");
      setCurrentStep(4);
    }, 700);
  };

  // Resubmit handler if rejected
  const handleResubmit = () => {
    resetVerificationForResubmission();
    setUploadedFile(null);
    setUploadError("");
    setCurrentStep(2);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Loading workspace onboarding...</p>
        </div>
      </div>
    );
  }

  const verifRequest = student?.verificationRequest;
  const currentVerificationStatus = student?.verificationStatus || "not_submitted";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              StudentHub
            </span>
          </Link>
          <span className="hidden sm:inline-block text-border">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student Onboarding
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden md:inline">
            Logged in as <strong className="text-foreground">{student?.email}</strong>
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Progress / Step Indicator */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Step {currentStep} of 4:{" "}
                {currentStep === 1 && "Complete Your Academic Profile"}
                {currentStep === 2 && "Select Student Verification Method"}
                {currentStep === 3 && "Personal Recovery Email"}
                {currentStep === 4 && "Verification Review & Status"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentStep === 1 &&
                  "Provide your academic details, skills, and resume so recruiters can discover you."}
                {currentStep === 2 &&
                  "Verify your student identity via University Payment Receipt or College ID Card."}
                {currentStep === 3 &&
                  "Add your normal personal email address for secondary contact and recovery."}
                {currentStep === 4 &&
                  "Your submission is recorded and waiting for manual review by the admin team."}
              </p>
            </div>
            <Badge variant="lavender" size="sm" className="font-bold">
              {currentStep === 1 && "25% Done"}
              {currentStep === 2 && "50% Done"}
              {currentStep === 3 && "75% Done"}
              {currentStep === 4 && "100% Done"}
            </Badge>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, label: "Profile" },
              { num: 2, label: "Verification" },
              { num: 3, label: "Personal Email" },
              { num: 4, label: "Manual Review" },
            ].map((step) => {
              const isCompleted = currentStep > step.num || (currentStep === 4 && step.num === 4);
              const isActive = currentStep === step.num;
              return (
                <div key={step.num} className="space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted || isActive
                        ? "bg-gradient-to-r from-purple-600 to-blue-600"
                        : "bg-muted"
                    }`}
                  />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isCompleted
                          ? "bg-purple-600 text-white"
                          : isActive
                          ? "bg-purple-600/20 text-purple-600 border border-purple-600/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5" /> : step.num}
                    </span>
                    <span
                      className={`hidden sm:inline ${
                        isActive
                          ? "text-foreground font-bold"
                          : isCompleted
                          ? "text-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Complete Your Profile Form */}
        {currentStep === 1 && (
          <form onSubmit={handleSaveProfileStep} className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
              {/* Notice Banner */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Account successfully created! Let&apos;s complete your profile.
                  </p>
                  <p className="text-muted-foreground">
                    Your institutional account has been registered with{" "}
                    <span className="font-semibold text-foreground">{student?.email}</span>. Please
                    complete your academic details and upload your verification document to finish
                    onboarding.
                  </p>
                </div>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Profile Photo
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-xs"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground block">
                      Choose an avatar or keep default:
                    </span>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(av)}
                          className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                            avatar === av
                              ? "border-purple-600 scale-110 shadow-xs"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={av} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="University / Institution"
                  placeholder="e.g. Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  required
                />
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Academic Stream */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Academic Stream
                  </label>
                  <select
                    value={academicStream}
                    onChange={(e) => handleStreamChange(e.target.value)}
                    className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    {ACADEMIC_HIERARCHY.map((stream) => (
                      <option key={stream.id} value={stream.name}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Degree / Program */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Degree / Program
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                    className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.name}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialization / Branch */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Branch / Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    {availableSpecializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year of Study & Graduation Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Current Year
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="5th Year">5th Year (Dual Degree)</option>
                    <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                    <option value="PhD Candidate">PhD Candidate</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Expected Graduation Year
                  </label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 342-8921"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              {/* Skills Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Skills & Technologies <span className="text-purple-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill (e.g. Python, Figma, Docker) & press Enter"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="shrink-0"
                  >
                    Add Skill
                  </Button>
                </div>

                {/* Selected Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-500 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Popular Skill Badges */}
                <div className="pt-2">
                  <span className="text-[11px] text-muted-foreground block mb-1.5">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.filter((s) => !skills.includes(s))
                      .slice(0, 8)
                      .map((ps) => (
                        <button
                          key={ps}
                          type="button"
                          onClick={() => handleAddSkill(ps)}
                          className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground hover:text-foreground border border-border/80 transition-colors"
                        >
                          + {ps}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Resume / CV (Optional)
                </label>
                <div className="p-4 rounded-xl border border-dashed border-border hover:border-purple-500/50 transition-colors bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      {resumeData ? (
                        <>
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            {resumeData.fileName}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {resumeData.fileSize} • {resumeData.uploadedAt}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-foreground">
                            Upload your latest resume
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            PDF or DOCX up to 10 MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      onChange={handleResumeFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                      {resumeData ? "Replace Resume" : "Upload File"}
                    </Button>
                    {resumeData && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResumeData(null)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Social / Portfolio Links */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Professional Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    leftIcon={<Linkedin className="w-4 h-4" />}
                  />
                  <Input
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    leftIcon={<Github className="w-4 h-4" />}
                  />
                  <Input
                    placeholder="https://yourportfolio.dev"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    leftIcon={<Globe className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  Brief Bio / Headline
                </label>
                <textarea
                  rows={2}
                  placeholder="Passionate student engineer aspiring to build impactful software products..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-border flex items-center justify-end">
                <Button
                  type="submit"
                  variant="gradient"
                  className="h-11 px-6 text-sm font-semibold shadow-md shadow-purple-600/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Verification
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Verification Method Selection & Document Upload */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
              {/* Explanation & Manual Review Notice */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Select Student Verification Method
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  To protect our community and verify your active student status, choose one of the
                  two official verification options below.
                </p>
              </div>

              {/* Manual Verification Disclaimer Alert */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    Manual Administrative Verification Notice
                  </strong>
                  <span>
                    Uploaded documents are manually reviewed by the StudentHub administration team.
                    Verification is not automated. Once submitted, your request will enter the{" "}
                    <strong>Pending Manual Review</strong> queue.
                  </span>
                </div>
              </div>

              {/* Two Option Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Payment Receipt */}
                <div
                  onClick={() => {
                    setVerificationType("payment_receipt");
                    setUploadedFile(null);
                    setUploadError("");
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    verificationType === "payment_receipt"
                      ? "border-purple-600 bg-purple-500/5 shadow-md shadow-purple-500/10"
                      : "border-border hover:border-purple-500/40 bg-card"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          verificationType === "payment_receipt"
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {verificationType === "payment_receipt" && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Option 1: Semester Fee Receipt</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a recent tuition or semester fee payment receipt from your college.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Requirement:</p>
                      <p>• Must be from current or recent semester</p>
                      <p>• Must be valid within 6 months from payment date</p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Student ID Card */}
                <div
                  onClick={() => {
                    setVerificationType("student_id_card");
                    setUploadedFile(null);
                    setUploadError("");
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    verificationType === "student_id_card"
                      ? "border-purple-600 bg-purple-500/5 shadow-md shadow-purple-500/10"
                      : "border-border hover:border-purple-500/40 bg-card"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                        <IdCard className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          verificationType === "student_id_card"
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {verificationType === "student_id_card" && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Option 2: Student ID Card</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a clear photo or scan of your valid institution student ID card.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Requirement:</p>
                      <p>• Clear view of student name, photo & institution</p>
                      <p>• ID card step will request your personal recovery email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                  {verificationType === "payment_receipt"
                    ? "Upload Semester Payment Receipt"
                    : "Upload College Student ID Card"}
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-3 ${
                    uploadedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border hover:border-purple-500/60 bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                    onChange={handleVerificationFileSelect}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedFile.size} • Ready for manual review submission
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Change Document
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          Click to upload or drag and drop your document
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, JPG, PNG, WEBP (Max 10 MB)
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-lg bg-card border border-border text-xs font-semibold text-muted-foreground">
                        Browse Files
                      </span>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Profile
                </Button>

                <Button
                  type="button"
                  variant="gradient"
                  onClick={handleVerificationNext}
                  disabled={!uploadedFile || isUploading}
                  isLoading={isUploading}
                  className="h-11 px-6 text-sm font-semibold shadow-md shadow-purple-600/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {verificationType === "student_id_card"
                    ? "Next: Personal Email"
                    : "Submit for Manual Review"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Personal Email Collection (Only for Student ID Card flow) */}
        {currentStep === 3 && (
          <form onSubmit={handlePersonalEmailSubmit} className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Add Personal Recovery Email
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Since you verified using your Student ID Card, please provide a normal personal
                  email address for secondary contact and account recovery.
                </p>
              </div>

              {/* Explanation Card */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Important Email Notice</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your university email (
                  <strong className="text-foreground">{student?.email}</strong>) remains your
                  primary institutional email on StudentHub. Your personal email will be kept
                  separately as a backup and contact channel.
                </p>
              </div>

              {/* Document Summary */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <IdCard className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-foreground">
                    Attached ID Card: {uploadedFile?.name}
                  </span>
                </div>
                <span className="text-muted-foreground">{uploadedFile?.size}</span>
              </div>

              <div className="space-y-2">
                <Input
                  label="Personal Email Address"
                  type="email"
                  placeholder="e.g. alex.rivera@gmail.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
                {personalEmailError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{personalEmailError}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Document
                </Button>

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isUploading}
                  isLoading={isUploading}
                  className="h-11 px-6 text-sm font-semibold shadow-md shadow-purple-600/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Submit for Manual Review
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: Verification Status & Completion Overview */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
              {/* Status Header */}
              <div className="text-center space-y-3 py-2">
                {currentVerificationStatus === "pending" && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                      <Clock className="w-7 h-7 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Verification Status: Pending Manual Review
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Document Under Manual Review
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                        Your verification document has been securely received. The StudentHub
                        administration team will manually inspect and verify your credentials.
                      </p>
                    </div>
                  </>
                )}

                {currentVerificationStatus === "approved" && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verification Status: Approved & Verified
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Congratulations! You Are Verified
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                        Your student profile has been verified by the StudentHub administration team.
                        You have full verified status.
                      </p>
                    </div>
                  </>
                )}

                {currentVerificationStatus === "rejected" && (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Verification Status: Rejected
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Document Verification Rejected
                      </h3>
                      <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 max-w-lg mx-auto font-medium">
                        Reason: {verifRequest?.rejectionReason || "Uploaded document was unreadable or expired."}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Submission Summary Table */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Verification Submission Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Student Name</span>
                    <p className="font-semibold text-foreground">{student?.name}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">University / Institution</span>
                    <p className="font-semibold text-foreground">{student?.university}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Primary University Email</span>
                    <p className="font-semibold text-foreground">{student?.email}</p>
                  </div>

                  {student?.personalEmail && (
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <span className="text-muted-foreground text-[11px]">Personal Recovery Email</span>
                      <p className="font-semibold text-foreground">{student.personalEmail}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Verification Method</span>
                    <p className="font-semibold text-foreground">
                      {verifRequest?.verificationType === "payment_receipt"
                        ? "Semester Payment Receipt"
                        : "College Student ID Card"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Uploaded Document</span>
                    <p className="font-semibold text-foreground truncate">
                      {verifRequest?.documentName || uploadedFile?.name || "Submitted Document"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Submitted At</span>
                    <p className="font-semibold text-foreground">
                      {verifRequest?.submittedAt || "Just now"}
                    </p>
                  </div>

                  {verifRequest?.reviewedAt && (
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <span className="text-muted-foreground text-[11px]">Reviewed At</span>
                      <p className="font-semibold text-foreground">{verifRequest.reviewedAt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {currentVerificationStatus === "rejected" ? (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handleResubmit}
                    className="w-full sm:w-auto h-11 px-6 text-sm font-semibold shadow-md shadow-purple-600/20"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Resubmit Valid Document
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={() => router.push("/dashboard")}
                    className="w-full sm:w-auto h-11 px-6 text-sm font-semibold shadow-md shadow-purple-600/20"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Student Workspace
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto"
                >
                  Review Profile Details
                </Button>
              </div>

              {/* Admin Manual Review Simulator (For test evaluation) */}
              <div className="pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAdminReviewTools(!showAdminReviewTools)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    {showAdminReviewTools ? "Hide" : "Show"} Administrative Manual Review Simulator
                    (For Testing)
                  </span>
                </button>

                {showAdminReviewTools && (
                  <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                    <p className="text-xs font-semibold text-foreground">
                      Admin Manual Verification Simulator:
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Simulate how the StudentHub admin team reviews and resolves this manual
                      verification request.
                    </p>

                    <div className="space-y-2">
                      <Input
                        placeholder="Rejection reason (if rejecting)... e.g. Payment receipt is older than 6 months"
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="gradient"
                        onClick={() => {
                          reviewVerification("approved");
                          success("Simulated Admin Review: Document Approved!");
                        }}
                        className="text-xs"
                      >
                        Simulate Admin Approval
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          reviewVerification(
                            "rejected",
                            rejectionReasonInput.trim() ||
                              "Uploaded document is blurred, unreadable, or invalid."
                          );
                          toastError("Simulated Admin Review: Document Rejected.");
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Simulate Admin Rejection
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          submitStudentVerification({
                            verificationType:
                              verifRequest?.verificationType || "payment_receipt",
                            documentName:
                              verifRequest?.documentName || "Verification_Document.pdf",
                            documentSize: verifRequest?.documentSize || "1.2 MB",
                            documentUrl: verifRequest?.documentUrl || "#",
                            personalEmail: student?.personalEmail,
                          });
                          info("Reset status to Pending Manual Review.");
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        Reset to Pending
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} StudentHub Platform • Secure Student Verification
      </footer>
    </div>
  );
}
