import {
  Code2,
  FolderGit2,
  Briefcase,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Compass,
  LucideIcon,
} from "lucide-react";
import { User, StudentProfile } from "@/types";

export type CareerDNANodeId =
  | "skills"
  | "projects"
  | "experience"
  | "achievements"
  | "education"
  | "strengths"
  | "goals";

export type VerificationStatusType = "verified" | "self-reported" | "pending";

export interface CareerDNANodeItem {
  id: CareerDNANodeId;
  label: string;
  category: string;
  icon: LucideIcon;
  x: number; // Percentage 0-100 on canvas
  y: number; // Percentage 0-100 on canvas
  signalStrength: number; // 0-100%
  verificationStatus: VerificationStatusType;
  verificationSource: string; // e.g. "GitHub Project Evidence", "Academic Record", etc.
  valueTitle: string; // Main title (e.g. "12 Identified Skills")
  valueDescription: string; // Detailed description
  tags: string[]; // Badges/pills
  hasRealData: boolean;
  actionLabel: string;
  actionHref: string;
  connectedTo: CareerDNANodeId[]; // Relational connections
}

export interface CareerDNADataInput {
  user?: User | null;
  careerDNA?: any | null;
  summaryData?: any | null;
}

export function buildCareerDNANodes(input: CareerDNADataInput): CareerDNANodeItem[] {
  const { user, careerDNA, summaryData } = input;
  const student = user as StudentProfile | undefined;

  // 1. SKILLS (Top Right)
  const rawSkills: string[] =
    (summaryData?.topSkills && summaryData.topSkills.length > 0 ? summaryData.topSkills : null) ||
    (careerDNA?.topSkills && careerDNA.topSkills.length > 0
      ? careerDNA.topSkills.map((s: any) => (typeof s === "string" ? s : s.name))
      : null) ||
    (student?.skills && student.skills.length > 0 ? student.skills : []);

  const hasSkills = rawSkills.length > 0;
  const skillsCount = hasSkills ? rawSkills.length : 0;
  const skillsScore = careerDNA?.dimensions?.technicalCompetence ?? (hasSkills ? Math.min(95, 60 + skillsCount * 3) : 0);

  const skillsNode: CareerDNANodeItem = {
    id: "skills",
    label: "Skills",
    category: "Technical Capabilities",
    icon: Code2,
    x: 82,
    y: 16,
    signalStrength: skillsScore || (hasSkills ? 88 : 35),
    verificationStatus: hasSkills ? "verified" : "pending",
    verificationSource: hasSkills ? "Assessment & Code Evidence" : "Awaiting Verification",
    valueTitle: hasSkills ? `${skillsCount} Identified Skills` : "Not enough verified skills yet",
    valueDescription: hasSkills
      ? "Evaluated through project code analysis, technical assessments, and verified coursework."
      : "Complete coding assessments or link repositories to extract verified technical skills.",
    tags: hasSkills ? rawSkills.slice(0, 5) : ["TypeScript", "System Design", "APIs"],
    hasRealData: hasSkills,
    actionLabel: hasSkills ? "View All Skills →" : "Build Your Career DNA →",
    actionHref: hasSkills ? "/dashboard/career-dna" : "/dashboard/connected-accounts",
    connectedTo: ["projects", "goals", "education", "strengths"],
  };

  // 2. PROJECTS (Bottom Right)
  const rawProjectsCount: number =
    summaryData?.projectsAnalyzed ??
    (careerDNA?.featuredProjects ? careerDNA.featuredProjects.length : null) ??
    (student?.projects ? student.projects.length : 0);

  const hasProjects = rawProjectsCount > 0;
  const projectTags: string[] =
    careerDNA?.featuredProjects?.map((p: any) => p.title).slice(0, 3) ||
    student?.projects?.map((p) => p.title).slice(0, 3) ||
    [];

  const projectsScore = careerDNA?.dimensions?.codeQuality ?? (hasProjects ? Math.min(96, 65 + rawProjectsCount * 4) : 0);

  const projectsNode: CareerDNANodeItem = {
    id: "projects",
    label: "Projects",
    category: "Project Intelligence",
    icon: FolderGit2,
    x: 84,
    y: 84,
    signalStrength: projectsScore || (hasProjects ? 84 : 25),
    verificationStatus: hasProjects ? "verified" : "pending",
    verificationSource: hasProjects ? "GitHub Repository Evidence" : "No Linked Repositories",
    valueTitle: hasProjects ? `${rawProjectsCount} Projects Analyzed` : "No Project Evidence Yet",
    valueDescription: hasProjects
      ? "Codebase architecture, commit history, and algorithmic problem-solving evaluated from source code."
      : "Link your GitHub repositories to extract deep project intelligence and code quality proof.",
    tags: hasProjects && projectTags.length > 0 ? projectTags : ["Full Stack", "Distributed Systems"],
    hasRealData: hasProjects,
    actionLabel: hasProjects ? "Explore Projects →" : "Connect Repositories →",
    actionHref: hasProjects ? "/dashboard/career-dna" : "/dashboard/connected-accounts",
    connectedTo: ["skills", "experience"],
  };

  // 3. EXPERIENCE (Bottom Mid-Right)
  const rawExperiences = (student as any)?.experiences || [];
  const hasExperience = rawExperiences.length > 0;
  const expScore = hasExperience ? Math.min(92, 70 + rawExperiences.length * 10) : (careerDNA ? 75 : 30);

  const experienceNode: CareerDNANodeItem = {
    id: "experience",
    label: "Experience",
    category: "Professional Experience",
    icon: Briefcase,
    x: 62,
    y: 84,
    signalStrength: expScore,
    verificationStatus: hasExperience ? "verified" : "self-reported",
    verificationSource: hasExperience ? "Work & Internship Records" : "Candidate Profile",
    valueTitle: hasExperience
      ? `${rawExperiences.length} Professional Role${rawExperiences.length > 1 ? "s" : ""}`
      : "Applied Experience",
    valueDescription: hasExperience
      ? "Demonstrated engineering impact across internships, industry labs, and collaborative team roles."
      : "Add internships, team builds, and open-source contributions to demonstrate engineering maturity.",
    tags: hasExperience
      ? rawExperiences.map((e: any) => e.role || e.title).slice(0, 3)
      : ["Internships", "Collaborations", "Industry Impact"],
    hasRealData: hasExperience,
    actionLabel: "View Experience Profile →",
    actionHref: "/dashboard/career-dna",
    connectedTo: ["projects", "achievements", "skills"],
  };

  // 4. ACHIEVEMENTS (Bottom Mid-Left)
  const certsCount = student?.certifications ? student.certifications.length : 0;
  const hasAchievements = certsCount > 0 || Boolean(careerDNA?.leetcodeStats || careerDNA?.codeforcesStats);
  const achievementTags: string[] = [];
  if (certsCount > 0) achievementTags.push(`${certsCount} Certifications`);
  if (careerDNA?.leetcodeStats) achievementTags.push("LeetCode Verified");
  if (careerDNA?.codeforcesStats) achievementTags.push("Codeforces Verified");

  const achievementsScore = hasAchievements
    ? Math.min(95, 65 + certsCount * 5 + (careerDNA?.leetcodeStats ? 15 : 0))
    : 35;

  const achievementsNode: CareerDNANodeItem = {
    id: "achievements",
    label: "Achievements",
    category: "Verified Achievements",
    icon: Trophy,
    x: 40,
    y: 84,
    signalStrength: achievementsScore,
    verificationStatus: hasAchievements ? "verified" : "pending",
    verificationSource: hasAchievements ? "Competitive & Certificate Credentials" : "Awaiting Credentials",
    valueTitle: hasAchievements ? "Verified Milestones" : "No Verified Milestones Yet",
    valueDescription: hasAchievements
      ? "Demonstrated competitive milestones, algorithmic contest rankings, and accredited certificates."
      : "Connect platforms like LeetCode or upload certificates to prove competitive coding abilities.",
    tags: achievementTags.length > 0 ? achievementTags : ["Competitive Programming", "Certificates"],
    hasRealData: hasAchievements,
    actionLabel: hasAchievements ? "View Credentials →" : "Connect Platforms →",
    actionHref: hasAchievements ? "/dashboard/career-dna" : "/dashboard/connected-accounts",
    connectedTo: ["experience", "education", "strengths"],
  };

  // 5. EDUCATION (Bottom Left)
  const degreeStr = student?.degree
    ? `${student.degree}${student.branch ? ` (${student.branch})` : ""}`
    : null;
  const hasEducation = Boolean(degreeStr || student?.university);
  const eduScore = hasEducation ? 94 : 40;

  const educationNode: CareerDNANodeItem = {
    id: "education",
    label: "Education",
    category: "Academic Foundation",
    icon: GraduationCap,
    x: 18,
    y: 84,
    signalStrength: eduScore,
    verificationStatus: student?.verificationStatus === "approved" ? "verified" : "self-reported",
    verificationSource: student?.verificationStatus === "approved" ? "University Verified Record" : "Student Academic Record",
    valueTitle: degreeStr || "Academic Foundation",
    valueDescription: student?.university
      ? `${student.university}${student.graduationYear ? ` • Class of ${student.graduationYear}` : ""}${student.cgpa ? ` • CGPA: ${student.cgpa}` : ""}`
      : "Core computer science coursework, degree status, and foundational engineering curriculum.",
    tags: [student?.degree || "B.Tech Computer Science", student?.university || "Accredited University", student?.graduationYear ? `Graduation ${student.graduationYear}` : ""].filter(Boolean),
    hasRealData: hasEducation,
    actionLabel: "View Academic Details →",
    actionHref: "/dashboard/career-dna",
    connectedTo: ["achievements", "strengths", "skills"],
  };

  // 6. STRENGTHS (Top Left)
  const primaryStrength =
    summaryData?.primaryStrength ||
    careerDNA?.primaryStrength ||
    (careerDNA?.potentialCareerDirections && careerDNA.potentialCareerDirections[0]) ||
    null;
  const hasStrengths = Boolean(primaryStrength);
  const strengthsScore = careerDNA?.overallScore ?? (hasStrengths ? 89 : 45);

  const strengthsNode: CareerDNANodeItem = {
    id: "strengths",
    label: "Strengths",
    category: "Core Strengths",
    icon: ShieldCheck,
    x: 18,
    y: 16,
    signalStrength: strengthsScore,
    verificationStatus: hasStrengths ? "verified" : "pending",
    verificationSource: hasStrengths ? "Multi-Dimensional Evaluation" : "Needs Evaluation",
    valueTitle: primaryStrength || "Core Strengths",
    valueDescription: hasStrengths
      ? "High-confidence strengths synthesized from code quality, problem solving, and project architectures."
      : "Take verified assessments and sync project code to uncover your strongest competency domains.",
    tags: [primaryStrength || "Software Architecture", "Analytical Problem Solving", "System Resilience"],
    hasRealData: hasStrengths,
    actionLabel: "Explore Strengths Breakdown →",
    actionHref: "/dashboard/career-dna",
    connectedTo: ["education", "goals", "skills"],
  };

  // 7. GOALS & DIRECTION (Top Center)
  const careerDirections: string[] =
    careerDNA?.potentialCareerDirections ||
    (student?.headline ? [student.headline] : []) ||
    [];
  const hasGoals = careerDirections.length > 0;
  const goalsScore = hasGoals ? 86 : 50;

  const goalsNode: CareerDNANodeItem = {
    id: "goals",
    label: "Career Goals",
    category: "Career Direction",
    icon: Compass,
    x: 50,
    y: 14,
    signalStrength: goalsScore,
    verificationStatus: "self-reported",
    verificationSource: "Candidate Trajectory & Market Match",
    valueTitle: hasGoals ? careerDirections[0] : "Target Career Direction",
    valueDescription: hasGoals
      ? "Target roles aligned with your verified technical capabilities and market hiring demand."
      : "Define your preferred roles and engineering specializations to tailor opportunity matching.",
    tags: hasGoals ? careerDirections.slice(0, 3) : ["Full Stack Engineer", "Systems Architect"],
    hasRealData: hasGoals,
    actionLabel: "Update Career Goals →",
    actionHref: "/dashboard/career-dna",
    connectedTo: ["strengths", "skills"],
  };

  return [
    skillsNode,
    projectsNode,
    experienceNode,
    achievementsNode,
    educationNode,
    strengthsNode,
    goalsNode,
  ];
}
