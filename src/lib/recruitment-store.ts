import fs from "fs";
import path from "path";
import {
  RecruitmentDrive,
  RecruitmentStage,
  RecruitmentApplication,
  CandidateAssessmentRecord,
  CandidateInterviewRecord,
  RecruitmentResultRecord,
  RecruiterAuditLogEntry,
  EligibilityCriteria,
  StageWeights,
  InterviewEvaluation,
} from "@/types";
import { evaluateCandidateEligibility } from "@/lib/eligibility-engine";
import { calculateMeritRanking } from "@/lib/merit-engine";
import { defaultStudentUser } from "@/data/mock-users";

const RECRUITMENT_DB_FILE = path.join(process.cwd(), ".data", "recruitment-store-db.json");

interface RecruitmentStoreState {
  drives: Map<string, RecruitmentDrive>;
  stages: Map<string, RecruitmentStage[]>; // driveId -> stages
  applications: Map<string, RecruitmentApplication>; // id -> application
  assessments: Map<string, CandidateAssessmentRecord[]>; // driveId -> assessments
  interviews: Map<string, CandidateInterviewRecord[]>; // driveId -> interviews
  results: Map<string, RecruitmentResultRecord>; // driveId -> result
  auditLogs: RecruiterAuditLogEntry[];
}

declare global {
  // eslint-disable-next-line no-var
  var __STUDENTHUB_RECRUITMENT_STORE__: RecruitmentStoreState | undefined;
}

const defaultCriteria: EligibilityCriteria = {
  degrees: ["B.Tech", "B.E.", "B.S. in Computer Science", "M.Tech", "M.S."],
  branches: [
    "Computer Science & Engineering",
    "Information Technology",
    "Systems & Artificial Intelligence",
    "Data Science",
    "Electronics & Communication",
  ],
  minCgpa: 3.5,
  maxBacklogs: 1,
  gradYears: [2025, 2026, 2027],
  freshersAllowed: true,
  minExpYears: 0,
  maxExpYears: 2,
  requiredSkills: ["TypeScript", "React", "Node.js", "Python"],
  preferredSkills: ["PostgreSQL", "System Design", "Docker", "AWS"],
  eligibleLocations: ["San Francisco, CA", "Seattle, WA", "New York, NY", "Remote"],
  remoteAllowed: true,
};

const defaultStages = (driveId: string): RecruitmentStage[] => [
  {
    id: `stage_${driveId}_1`,
    driveId,
    name: "Eligibility & Resume Screening",
    type: "SCREENING",
    order: 1,
    description: "Automated eligibility verification against academic and skill criteria.",
    passingScore: 70,
    status: "COMPLETED",
  },
  {
    id: `stage_${driveId}_2`,
    driveId,
    name: "Technical Assessment Round",
    type: "ASSESSMENT",
    order: 2,
    description: "Algorithmic coding, system architecture, and API design evaluation.",
    passingScore: 75,
    status: "IN_PROGRESS",
  },
  {
    id: `stage_${driveId}_3`,
    driveId,
    name: "Engineering & System Interview",
    type: "INTERVIEW",
    order: 3,
    description: "1-on-1 technical deep-dive and problem-solving interview.",
    passingScore: 80,
    status: "IN_PROGRESS",
  },
  {
    id: `stage_${driveId}_4`,
    driveId,
    name: "Final Merit Selection & Offer",
    type: "FINAL_SELECTION",
    order: 4,
    description: "Consolidated rank generation, offer allocation, and result publication.",
    passingScore: 80,
    status: "PENDING",
  },
];

function initializeRecruitmentStore(): RecruitmentStoreState {
  const drives = new Map<string, RecruitmentDrive>();
  const stages = new Map<string, RecruitmentStage[]>();
  const applications = new Map<string, RecruitmentApplication>();
  const assessments = new Map<string, CandidateAssessmentRecord[]>();
  const interviews = new Map<string, CandidateInterviewRecord[]>();
  const results = new Map<string, RecruitmentResultRecord>();
  const auditLogs: RecruiterAuditLogEntry[] = [];

  // Seed Default Drive 1: Software Engineer 2026
  const drive1Id = "drive_swe_2026";
  const drive1Stages = defaultStages(drive1Id);
  stages.set(drive1Id, drive1Stages);

  const drive1: RecruitmentDrive = {
    id: drive1Id,
    title: "Software Development Engineer 2026",
    position: "Software Development Engineer (Full-Time / Intern)",
    description:
      "Join our core product infrastructure engineering team. Build scalable, high-throughput web applications, microservices, and developer toolchains.",
    company: "Stripe",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    department: "Core Engineering",
    employmentType: "FULL_TIME",
    workMode: "HYBRID",
    location: "San Francisco, CA / Hybrid",
    openingsCount: 12,
    salaryStipend: "$145,000 - $175,000 / yr",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    status: "SELECTION_IN_PROGRESS",
    eligibilityCriteria: defaultCriteria,
    stages: drive1Stages,
    stageWeights: { assessmentWeight: 60, interviewWeight: 40 },
    applicantsCount: 5,
    eligibleCount: 4,
    shortlistedCount: 3,
    interviewsCount: 2,
    selectedCount: 1,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-08T10:00:00.000Z",
    createdBy: "recruiter_01",
  };
  drives.set(drive1Id, drive1);

  // Seed Default Drive 2: AI / ML Systems Engineer
  const drive2Id = "drive_aiml_2026";
  const drive2Stages = defaultStages(drive2Id);
  stages.set(drive2Id, drive2Stages);

  const drive2: RecruitmentDrive = {
    id: drive2Id,
    title: "AI & Machine Learning Engineer 2026",
    position: "AI / ML Systems Engineer",
    description:
      "Design and deploy production LLM pipelines, vector databases, and real-time retrieval-augmented generation architectures.",
    company: "OpenAI",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    department: "AI Applied Research",
    employmentType: "INTERNSHIP",
    workMode: "REMOTE",
    location: "Remote / San Francisco",
    openingsCount: 6,
    salaryStipend: "$9,500 / month",
    startDate: "2026-03-05",
    endDate: "2026-05-15",
    status: "APPLICATIONS_OPEN",
    eligibilityCriteria: {
      ...defaultCriteria,
      requiredSkills: ["Python", "PyTorch", "TypeScript", "FastAPI"],
      minCgpa: 3.7,
    },
    stages: drive2Stages,
    stageWeights: { assessmentWeight: 50, interviewWeight: 50 },
    applicantsCount: 3,
    eligibleCount: 3,
    shortlistedCount: 2,
    interviewsCount: 1,
    selectedCount: 0,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-08T11:00:00.000Z",
    createdBy: "recruiter_01",
  };
  drives.set(drive2Id, drive2);

  // Seed Default Candidates & Applications for Drive 1
  const candAlex = {
    ...defaultStudentUser,
    backlogs: 0,
  };
  const alexEligibility = evaluateCandidateEligibility(candAlex, defaultCriteria);

  const app1: RecruitmentApplication = {
    id: "app_rec_001",
    driveId: drive1Id,
    driveTitle: drive1.title,
    company: drive1.company,
    studentId: defaultStudentUser.id,
    studentName: defaultStudentUser.name,
    studentEmail: defaultStudentUser.email,
    studentAvatar: defaultStudentUser.avatar,
    university: defaultStudentUser.university,
    degree: defaultStudentUser.degree,
    branch: defaultStudentUser.branch,
    graduationYear: defaultStudentUser.graduationYear,
    cgpa: "3.92",
    backlogs: 0,
    skills: defaultStudentUser.skills,
    resumeUrl: "#",
    portfolioUrl: "https://alexrivera.dev",
    githubUrl: "https://github.com/alexrivera",
    linkedinUrl: "https://linkedin.com/in/alexrivera",
    status: "IN_SELECTION",
    eligibility: alexEligibility,
    currentStageId: drive1Stages[2].id,
    currentStageName: drive1Stages[2].name,
    currentStageType: "INTERVIEW",
    assessmentScore: 94,
    interviewScore: 92,
    finalScore: 93,
    rank: 1,
    notes: "Outstanding algorithmic and React/Node.js systems proficiency. Highly recommended.",
    appliedAt: "2026-03-02T14:30:00.000Z",
    updatedAt: "2026-03-07T16:00:00.000Z",
    history: [
      {
        stageId: drive1Stages[0].id,
        stageName: drive1Stages[0].name,
        status: "ELIGIBLE",
        timestamp: "2026-03-02T14:35:00.000Z",
        actor: "Eligibility Engine",
        note: "Passed all 7 academic & skills criteria.",
      },
      {
        stageId: drive1Stages[0].id,
        stageName: drive1Stages[0].name,
        status: "SHORTLISTED",
        timestamp: "2026-03-03T10:00:00.000Z",
        actor: "Sarah Chen (Recruiter)",
        note: "Shortlisted for Round 2 Assessment.",
      },
      {
        stageId: drive1Stages[1].id,
        stageName: drive1Stages[1].name,
        status: "ASSESSMENT_CLEARED",
        timestamp: "2026-03-05T15:00:00.000Z",
        actor: "Assessment Evaluator",
        note: "Scored 94/100 on coding test.",
      },
      {
        stageId: drive1Stages[2].id,
        stageName: drive1Stages[2].name,
        status: "INTERVIEW_SCHEDULED",
        timestamp: "2026-03-06T11:00:00.000Z",
        actor: "Sarah Chen (Recruiter)",
        note: "Scheduled technical interview.",
      },
    ],
  };
  applications.set(app1.id, app1);

  // Candidate 2: Priya Sharma
  const candPriya = {
    id: "student_02",
    name: "Priya Sharma",
    email: "priya.sharma@berkeley.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    university: "UC Berkeley",
    degree: "B.S. in Computer Science",
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: "3.88",
    backlogs: 0,
    skills: ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Docker"],
    location: "San Francisco, CA",
  };
  const priyaEligibility = evaluateCandidateEligibility(candPriya as any, defaultCriteria);

  const app2: RecruitmentApplication = {
    id: "app_rec_002",
    driveId: drive1Id,
    driveTitle: drive1.title,
    company: drive1.company,
    studentId: candPriya.id,
    studentName: candPriya.name,
    studentEmail: candPriya.email,
    studentAvatar: candPriya.avatar,
    university: candPriya.university,
    degree: candPriya.degree,
    branch: candPriya.branch,
    graduationYear: candPriya.graduationYear,
    cgpa: candPriya.cgpa,
    backlogs: 0,
    skills: candPriya.skills,
    resumeUrl: "#",
    status: "SHORTLISTED",
    eligibility: priyaEligibility,
    currentStageId: drive1Stages[1].id,
    currentStageName: drive1Stages[1].name,
    currentStageType: "ASSESSMENT",
    assessmentScore: 88,
    interviewScore: 85,
    finalScore: 87,
    rank: 2,
    notes: "Strong backend experience with PostgreSQL and Docker.",
    appliedAt: "2026-03-02T16:00:00.000Z",
    updatedAt: "2026-03-06T12:00:00.000Z",
  };
  applications.set(app2.id, app2);

  // Candidate 3: Marcus Chen
  const candMarcus = {
    id: "student_03",
    name: "Marcus Chen",
    email: "marcus.chen@mit.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    university: "MIT",
    degree: "B.Tech",
    branch: "Information Technology",
    graduationYear: 2026,
    cgpa: "3.75",
    backlogs: 0,
    skills: ["TypeScript", "React", "Node.js", "GraphQL"],
    location: "Seattle, WA",
  };
  const marcusEligibility = evaluateCandidateEligibility(candMarcus as any, defaultCriteria);

  const app3: RecruitmentApplication = {
    id: "app_rec_003",
    driveId: drive1Id,
    driveTitle: drive1.title,
    company: drive1.company,
    studentId: candMarcus.id,
    studentName: candMarcus.name,
    studentEmail: candMarcus.email,
    studentAvatar: candMarcus.avatar,
    university: candMarcus.university,
    degree: candMarcus.degree,
    branch: candMarcus.branch,
    graduationYear: candMarcus.graduationYear,
    cgpa: candMarcus.cgpa,
    backlogs: 0,
    skills: candMarcus.skills,
    resumeUrl: "#",
    status: "ELIGIBLE",
    eligibility: marcusEligibility,
    currentStageId: drive1Stages[0].id,
    currentStageName: drive1Stages[0].name,
    currentStageType: "SCREENING",
    appliedAt: "2026-03-03T10:30:00.000Z",
    updatedAt: "2026-03-03T10:30:00.000Z",
  };
  applications.set(app3.id, app3);

  // Candidate 4: Elena Rostova (Failed criteria - Backlogs exceeded)
  const candElena = {
    id: "student_04",
    name: "Elena Rostova",
    email: "elena.rostova@cmu.edu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    university: "Carnegie Mellon University",
    degree: "B.Tech",
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: "3.20",
    backlogs: 2, // Exceeds max 1 backlog
    skills: ["TypeScript", "Python"],
    location: "Pittsburgh, PA",
  };
  const elenaEligibility = evaluateCandidateEligibility(candElena as any, defaultCriteria);

  const app4: RecruitmentApplication = {
    id: "app_rec_004",
    driveId: drive1Id,
    driveTitle: drive1.title,
    company: drive1.company,
    studentId: candElena.id,
    studentName: candElena.name,
    studentEmail: candElena.email,
    studentAvatar: candElena.avatar,
    university: candElena.university,
    degree: candElena.degree,
    branch: candElena.branch,
    graduationYear: candElena.graduationYear,
    cgpa: candElena.cgpa,
    backlogs: 2,
    skills: candElena.skills,
    resumeUrl: "#",
    status: "ELIGIBILITY_FAILED",
    eligibility: elenaEligibility,
    currentStageId: drive1Stages[0].id,
    currentStageName: drive1Stages[0].name,
    currentStageType: "SCREENING",
    notes: "Failed minimum CGPA (3.20 < 3.50) and Backlog limit (2 > 1).",
    appliedAt: "2026-03-04T09:15:00.000Z",
    updatedAt: "2026-03-04T09:15:00.000Z",
  };
  applications.set(app4.id, app4);

  // Candidate 5: Jordan Lee
  const candJordan = {
    id: "student_05",
    name: "Jordan Lee",
    email: "jordan.lee@austin.utexas.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    university: "UT Austin",
    degree: "B.S. in Computer Science",
    branch: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: "3.80",
    backlogs: 0,
    skills: ["TypeScript", "React", "Node.js", "Python"],
    location: "Austin, TX",
  };
  const jordanEligibility = evaluateCandidateEligibility(candJordan as any, defaultCriteria);

  const app5: RecruitmentApplication = {
    id: "app_rec_005",
    driveId: drive1Id,
    driveTitle: drive1.title,
    company: drive1.company,
    studentId: candJordan.id,
    studentName: candJordan.name,
    studentEmail: candJordan.email,
    studentAvatar: candJordan.avatar,
    university: candJordan.university,
    degree: candJordan.degree,
    branch: candJordan.branch,
    graduationYear: candJordan.graduationYear,
    cgpa: candJordan.cgpa,
    backlogs: 0,
    skills: candJordan.skills,
    resumeUrl: "#",
    status: "SUBMITTED",
    eligibility: jordanEligibility,
    currentStageId: drive1Stages[0].id,
    currentStageName: drive1Stages[0].name,
    currentStageType: "SCREENING",
    appliedAt: "2026-03-08T08:00:00.000Z",
    updatedAt: "2026-03-08T08:00:00.000Z",
  };
  applications.set(app5.id, app5);

  // Seed Assessments for Drive 1
  assessments.set(drive1Id, [
    {
      id: `assess_${drive1Id}_1`,
      driveId: drive1Id,
      applicationId: app1.id,
      studentId: app1.studentId,
      studentName: app1.studentName,
      stageId: drive1Stages[1].id,
      assessmentName: "Core Algorithms & System Design Test",
      instructions: "90-minute timed coding exam covering Graph algorithms, Concurrency, and REST API design.",
      date: "2026-03-05",
      time: "14:00 PST",
      duration: "90 mins",
      maxScore: 100,
      passingScore: 75,
      candidateScore: 94,
      passed: true,
      evaluatedBy: "Automated Evaluation Engine",
      evaluatedAt: "2026-03-05T15:35:00.000Z",
    },
    {
      id: `assess_${drive1Id}_2`,
      driveId: drive1Id,
      applicationId: app2.id,
      studentId: app2.studentId,
      studentName: app2.studentName,
      stageId: drive1Stages[1].id,
      assessmentName: "Core Algorithms & System Design Test",
      instructions: "90-minute timed coding exam covering Graph algorithms, Concurrency, and REST API design.",
      date: "2026-03-05",
      time: "14:00 PST",
      duration: "90 mins",
      maxScore: 100,
      passingScore: 75,
      candidateScore: 88,
      passed: true,
      evaluatedBy: "Automated Evaluation Engine",
      evaluatedAt: "2026-03-05T15:35:00.000Z",
    },
  ]);

  // Seed Interviews for Drive 1
  interviews.set(drive1Id, [
    {
      id: `int_${drive1Id}_1`,
      driveId: drive1Id,
      applicationId: app1.id,
      studentId: app1.studentId,
      candidateName: app1.studentName,
      candidateAvatar: app1.studentAvatar,
      candidateUniversity: app1.university,
      driveTitle: drive1.title,
      stageId: drive1Stages[2].id,
      type: "VIDEO",
      date: "2026-03-07",
      time: "10:30 AM PST",
      duration: "45 mins",
      meetingLink: "https://meet.google.com/stripe-sde-round3",
      interviewerName: "David K. (Staff Infrastructure Engineer)",
      status: "COMPLETED",
      notes: "Candidate demonstrated exceptional depth in concurrency and distributed state synchronization.",
      evaluation: {
        technicalScore: 95,
        communicationScore: 90,
        overallScore: 93,
        feedback: "Superb problem-solving and clear explanation of distributed trade-offs. Fast hire recommendation.",
        recommendation: "RECOMMEND",
        evaluatedAt: "2026-03-07T11:25:00.000Z",
        evaluatorName: "David K.",
      },
      createdAt: "2026-03-06T11:00:00.000Z",
    },
  ]);

  // Seed Initial Audit Logs
  auditLogs.push(
    {
      id: `audit_rec_${Date.now() - 500000}`,
      driveId: drive1Id,
      driveTitle: drive1.title,
      actorId: "recruiter_01",
      actorName: "Sarah Chen",
      actorRole: "RECRUITER",
      action: "DRIVE_CREATED",
      targetType: "DRIVE",
      targetId: drive1Id,
      targetName: drive1.title,
      newState: "DRAFT",
      details: "Created new structured recruitment drive with 4 selection stages.",
      timestamp: "2026-03-01T09:00:00.000Z",
      ipSessionRef: "192.168.1.45 (Chrome / macOS)",
    },
    {
      id: `audit_rec_${Date.now() - 400000}`,
      driveId: drive1Id,
      driveTitle: drive1.title,
      actorId: "recruiter_01",
      actorName: "Sarah Chen",
      actorRole: "RECRUITER",
      action: "DRIVE_PUBLISHED",
      targetType: "DRIVE",
      targetId: drive1Id,
      targetName: drive1.title,
      previousState: "DRAFT",
      newState: "APPLICATIONS_OPEN",
      details: "Published recruitment drive to StudentHub talent network.",
      timestamp: "2026-03-01T09:15:00.000Z",
      ipSessionRef: "192.168.1.45 (Chrome / macOS)",
    },
    {
      id: `audit_rec_${Date.now() - 300000}`,
      driveId: drive1Id,
      driveTitle: drive1.title,
      actorId: "recruiter_01",
      actorName: "Sarah Chen",
      actorRole: "RECRUITER",
      action: "CANDIDATE_SHORTLISTED",
      targetType: "APPLICATION",
      targetId: app1.id,
      targetName: app1.studentName,
      previousState: "ELIGIBLE",
      newState: "SHORTLISTED",
      details: "Candidate shortlisted for Round 2 Assessment based on 100% criteria match and top Career DNA.",
      timestamp: "2026-03-03T10:00:00.000Z",
      ipSessionRef: "192.168.1.45 (Chrome / macOS)",
    },
    {
      id: `audit_rec_${Date.now() - 200000}`,
      driveId: drive1Id,
      driveTitle: drive1.title,
      actorId: "recruiter_01",
      actorName: "Sarah Chen",
      actorRole: "RECRUITER",
      action: "INTERVIEW_EVALUATION_RECORDED",
      targetType: "EVALUATION",
      targetId: `int_${drive1Id}_1`,
      targetName: app1.studentName,
      newState: "RECOMMEND",
      details: "Recorded Technical Score (95), Communication (90), Overall (93) with recommendation: RECOMMEND.",
      timestamp: "2026-03-07T11:30:00.000Z",
      ipSessionRef: "192.168.1.45 (Chrome / macOS)",
    }
  );

  const initialStore: RecruitmentStoreState = {
    drives,
    stages,
    applications,
    assessments,
    interviews,
    results,
    auditLogs,
  };

  loadRecruitmentStoreFromDisk(initialStore);
  return initialStore;
}

function loadRecruitmentStoreFromDisk(storeObj: RecruitmentStoreState): void {
  try {
    if (!fs.existsSync(RECRUITMENT_DB_FILE)) return;
    const raw = fs.readFileSync(RECRUITMENT_DB_FILE, "utf-8");
    if (!raw.trim()) return;
    const data = JSON.parse(raw);

    if (data.drives && Array.isArray(data.drives)) {
      data.drives.forEach(([id, drive]: [string, RecruitmentDrive]) => {
        storeObj.drives.set(id, drive);
      });
    }
    if (data.stages && Array.isArray(data.stages)) {
      data.stages.forEach(([id, stagesList]: [string, RecruitmentStage[]]) => {
        storeObj.stages.set(id, stagesList);
      });
    }
    if (data.applications && Array.isArray(data.applications)) {
      data.applications.forEach(([id, app]: [string, RecruitmentApplication]) => {
        storeObj.applications.set(id, app);
      });
    }
    if (data.assessments && Array.isArray(data.assessments)) {
      data.assessments.forEach(([id, records]: [string, CandidateAssessmentRecord[]]) => {
        storeObj.assessments.set(id, records);
      });
    }
    if (data.interviews && Array.isArray(data.interviews)) {
      data.interviews.forEach(([id, records]: [string, CandidateInterviewRecord[]]) => {
        storeObj.interviews.set(id, records);
      });
    }
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach(([id, res]: [string, RecruitmentResultRecord]) => {
        storeObj.results.set(id, res);
      });
    }
    if (data.auditLogs && Array.isArray(data.auditLogs)) {
      storeObj.auditLogs = data.auditLogs;
    }
  } catch (err) {
    console.warn("[Recruitment Store] Failed loading from disk:", err);
  }
}

function persistRecruitmentStoreToDisk(): void {
  try {
    const dir = path.dirname(RECRUITMENT_DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload = {
      drives: Array.from(recruitmentStore.drives.entries()),
      stages: Array.from(recruitmentStore.stages.entries()),
      applications: Array.from(recruitmentStore.applications.entries()),
      assessments: Array.from(recruitmentStore.assessments.entries()),
      interviews: Array.from(recruitmentStore.interviews.entries()),
      results: Array.from(recruitmentStore.results.entries()),
      auditLogs: recruitmentStore.auditLogs,
    };

    fs.writeFileSync(RECRUITMENT_DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("[Recruitment Store] Error persisting to disk:", err);
  }
}

export const recruitmentStore: RecruitmentStoreState =
  globalThis.__STUDENTHUB_RECRUITMENT_STORE__ ?? initializeRecruitmentStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__STUDENTHUB_RECRUITMENT_STORE__ = recruitmentStore;
}

// ============================================================================
// Public Recruitment Store Accessors & Mutators
// ============================================================================

export function getRecruitmentDrives(): RecruitmentDrive[] {
  // Synchronize counts
  const allDrives = Array.from(recruitmentStore.drives.values());
  allDrives.forEach((d) => {
    const driveApps = Array.from(recruitmentStore.applications.values()).filter(
      (a) => a.driveId === d.id
    );
    d.applicantsCount = driveApps.length;
    d.eligibleCount = driveApps.filter((a) => a.eligibility?.status === "ELIGIBLE").length;
    d.shortlistedCount = driveApps.filter(
      (a) => a.status === "SHORTLISTED" || a.status === "IN_SELECTION" || a.status === "SELECTED"
    ).length;
    d.interviewsCount = (recruitmentStore.interviews.get(d.id) || []).length;
    d.selectedCount = driveApps.filter((a) => a.status === "SELECTED").length;
  });
  return allDrives.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getRecruitmentDriveById(id: string): RecruitmentDrive | null {
  return recruitmentStore.drives.get(id) || null;
}

export function saveRecruitmentDrive(drive: RecruitmentDrive): RecruitmentDrive {
  recruitmentStore.drives.set(drive.id, drive);
  if (drive.stages && drive.stages.length > 0) {
    recruitmentStore.stages.set(drive.id, drive.stages);
  }
  persistRecruitmentStoreToDisk();
  return drive;
}

export function deleteRecruitmentDrive(id: string): boolean {
  const existed = recruitmentStore.drives.delete(id);
  recruitmentStore.stages.delete(id);
  persistRecruitmentStoreToDisk();
  return existed;
}

export function getStagesForDrive(driveId: string): RecruitmentStage[] {
  let list = recruitmentStore.stages.get(driveId);
  if (!list || list.length === 0) {
    list = defaultStages(driveId);
    recruitmentStore.stages.set(driveId, list);
    persistRecruitmentStoreToDisk();
  }
  return list.sort((a, b) => a.order - b.order);
}

export function saveStagesForDrive(driveId: string, stages: RecruitmentStage[]): RecruitmentStage[] {
  recruitmentStore.stages.set(driveId, stages);
  const drive = recruitmentStore.drives.get(driveId);
  if (drive) {
    drive.stages = stages;
    drive.updatedAt = new Date().toISOString();
  }
  persistRecruitmentStoreToDisk();
  return stages;
}

export function getApplications(filters?: {
  driveId?: string;
  status?: string;
  eligibilityStatus?: string;
  search?: string;
  stageId?: string;
}): RecruitmentApplication[] {
  let list = Array.from(recruitmentStore.applications.values());

  if (filters?.driveId && filters.driveId !== "all") {
    list = list.filter((a) => a.driveId === filters.driveId);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.eligibilityStatus && filters.eligibilityStatus !== "all") {
    list = list.filter((a) => a.eligibility?.status === filters.eligibilityStatus);
  }
  if (filters?.stageId && filters.stageId !== "all") {
    list = list.filter((a) => a.currentStageId === filters.stageId);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.university.toLowerCase().includes(q) ||
        a.branch.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  return list.sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );
}

export function getApplicationById(id: string): RecruitmentApplication | null {
  return recruitmentStore.applications.get(id) || null;
}

export function saveApplication(app: RecruitmentApplication): RecruitmentApplication {
  recruitmentStore.applications.set(app.id, app);
  persistRecruitmentStoreToDisk();
  return app;
}

export function updateApplicationStatus(
  id: string,
  newStatus: RecruitmentApplication["status"],
  actorName = "Recruiter",
  notes?: string,
  nextStageId?: string
): RecruitmentApplication | null {
  const app = recruitmentStore.applications.get(id);
  if (!app) return null;

  const previousStatus = app.status;
  app.status = newStatus;
  app.updatedAt = new Date().toISOString();
  if (notes) app.notes = notes;

  if (nextStageId) {
    const driveStages = getStagesForDrive(app.driveId);
    const stage = driveStages.find((s) => s.id === nextStageId);
    if (stage) {
      app.currentStageId = stage.id;
      app.currentStageName = stage.name;
      app.currentStageType = stage.type;
    }
  }

  if (!app.history) app.history = [];
  app.history.push({
    stageId: app.currentStageId,
    stageName: app.currentStageName,
    status: newStatus,
    timestamp: new Date().toISOString(),
    actor: actorName,
    note: notes,
  });

  // Log to Audit Trail
  logRecruiterAction({
    driveId: app.driveId,
    driveTitle: app.driveTitle,
    actorId: "recruiter_01",
    actorName,
    actorRole: "RECRUITER",
    action: `STATUS_CHANGED_${newStatus}`,
    targetType: "APPLICATION",
    targetId: app.id,
    targetName: app.studentName,
    previousState: previousStatus,
    newState: newStatus,
    details: `Updated application status from ${previousStatus} to ${newStatus}.${notes ? ` Note: ${notes}` : ""}`,
  });

  persistRecruitmentStoreToDisk();
  return app;
}

export function recordManualEligibilityOverride(
  applicationId: string,
  newStatus: RecruitmentApplication["status"],
  reason: string,
  overriddenBy: string
): RecruitmentApplication | null {
  const app = recruitmentStore.applications.get(applicationId);
  if (!app) return null;

  const previousStatus = app.status;
  app.status = newStatus;
  app.manualOverride = {
    overriddenBy,
    previousStatus,
    newStatus,
    reason,
    timestamp: new Date().toISOString(),
  };
  app.updatedAt = new Date().toISOString();

  if (!app.history) app.history = [];
  app.history.push({
    stageId: app.currentStageId,
    stageName: app.currentStageName,
    status: newStatus,
    timestamp: new Date().toISOString(),
    actor: overriddenBy,
    note: `Manual Eligibility Override: ${reason}`,
  });

  logRecruiterAction({
    driveId: app.driveId,
    driveTitle: app.driveTitle,
    actorId: "recruiter_01",
    actorName: overriddenBy,
    actorRole: "RECRUITER",
    action: "ELIGIBILITY_OVERRIDDEN",
    targetType: "APPLICATION",
    targetId: app.id,
    targetName: app.studentName,
    previousState: previousStatus,
    newState: newStatus,
    reason,
    details: `Manual eligibility override applied by ${overriddenBy}. Reason: ${reason}`,
  });

  persistRecruitmentStoreToDisk();
  return app;
}

export function getAssessments(driveId?: string): CandidateAssessmentRecord[] {
  if (driveId && driveId !== "all") {
    return recruitmentStore.assessments.get(driveId) || [];
  }
  const all: CandidateAssessmentRecord[] = [];
  recruitmentStore.assessments.forEach((list) => all.push(...list));
  return all;
}

export function saveAssessmentRecord(record: CandidateAssessmentRecord): CandidateAssessmentRecord {
  const list = recruitmentStore.assessments.get(record.driveId) || [];
  const existingIdx = list.findIndex((a) => a.id === record.id);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.push(record);
  }
  recruitmentStore.assessments.set(record.driveId, list);

  // Update application score if available
  const app = recruitmentStore.applications.get(record.applicationId);
  if (app && record.candidateScore !== undefined) {
    app.assessmentScore = record.candidateScore;
    app.updatedAt = new Date().toISOString();
  }

  logRecruiterAction({
    driveId: record.driveId,
    actorId: "recruiter_01",
    actorName: record.evaluatedBy || "Evaluator",
    actorRole: "RECRUITER",
    action: "ASSESSMENT_SCORE_RECORDED",
    targetType: "ASSESSMENT",
    targetId: record.id,
    targetName: record.studentName,
    newState: `${record.candidateScore}/${record.maxScore}`,
    details: `Recorded assessment score (${record.candidateScore}/${record.maxScore}) for ${record.studentName}. Passed: ${record.passed ? "YES" : "NO"}`,
  });

  persistRecruitmentStoreToDisk();
  return record;
}

export function getInterviews(driveId?: string, status?: string): CandidateInterviewRecord[] {
  let list: CandidateInterviewRecord[] = [];
  if (driveId && driveId !== "all") {
    list = recruitmentStore.interviews.get(driveId) || [];
  } else {
    recruitmentStore.interviews.forEach((items) => list.push(...items));
  }
  if (status && status !== "all") {
    list = list.filter((i) => i.status === status);
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveInterviewRecord(record: CandidateInterviewRecord): CandidateInterviewRecord {
  const list = recruitmentStore.interviews.get(record.driveId) || [];
  const idx = list.findIndex((i) => i.id === record.id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  recruitmentStore.interviews.set(record.driveId, list);

  logRecruiterAction({
    driveId: record.driveId,
    actorId: "recruiter_01",
    actorName: "Sarah Chen",
    actorRole: "RECRUITER",
    action: "INTERVIEW_SCHEDULED",
    targetType: "INTERVIEW",
    targetId: record.id,
    targetName: record.candidateName,
    newState: record.status,
    details: `Scheduled ${record.type} interview on ${record.date} at ${record.time} with ${record.candidateName}.`,
  });

  persistRecruitmentStoreToDisk();
  return record;
}

export function recordInterviewEvaluation(
  interviewId: string,
  evaluation: InterviewEvaluation
): CandidateInterviewRecord | null {
  let foundRecord: CandidateInterviewRecord | null = null;
  let targetDriveId: string | null = null;

  for (const [driveId, list] of recruitmentStore.interviews.entries()) {
    const match = list.find((i) => i.id === interviewId);
    if (match) {
      match.evaluation = evaluation;
      match.status = "COMPLETED";
      foundRecord = match;
      targetDriveId = driveId;
      break;
    }
  }

  if (foundRecord && targetDriveId) {
    // Update application interviewScore
    const app = recruitmentStore.applications.get(foundRecord.applicationId);
    if (app) {
      app.interviewScore = evaluation.overallScore;
      app.updatedAt = new Date().toISOString();
    }

    logRecruiterAction({
      driveId: targetDriveId,
      actorId: "recruiter_01",
      actorName: evaluation.evaluatorName,
      actorRole: "RECRUITER",
      action: "INTERVIEW_EVALUATION_RECORDED",
      targetType: "EVALUATION",
      targetId: interviewId,
      targetName: foundRecord.candidateName,
      newState: evaluation.recommendation,
      details: `Recorded evaluation: Technical (${evaluation.technicalScore}), Communication (${evaluation.communicationScore}), Overall (${evaluation.overallScore}). Recommendation: ${evaluation.recommendation}.`,
    });

    persistRecruitmentStoreToDisk();
  }

  return foundRecord;
}

export function getRecruitmentResults(driveId: string): RecruitmentResultRecord | null {
  const existing = recruitmentStore.results.get(driveId);
  if (existing) return existing;

  const drive = recruitmentStore.drives.get(driveId);
  if (!drive) return null;

  // Calculate live ranking preview
  const driveApps = getApplications({ driveId });
  const ranked = calculateMeritRanking(
    driveApps.map((a) => ({
      applicationId: a.id,
      studentId: a.studentId,
      studentName: a.studentName,
      studentAvatar: a.studentAvatar,
      university: a.university,
      degree: a.degree,
      branch: a.branch,
      assessmentScore: a.assessmentScore || 0,
      interviewScore: a.interviewScore || 0,
      cgpa: a.cgpa,
      selectionStatus: a.status === "SELECTED" ? "SELECTED" : a.status === "REJECTED" ? "REJECTED" : "WAITLISTED",
      notes: a.notes,
    })),
    drive.stageWeights
  );

  return {
    id: `res_${driveId}`,
    driveId,
    driveTitle: drive.title,
    company: drive.company,
    publishedAt: "",
    publishedBy: "",
    isLocked: false,
    totalSelected: ranked.filter((r) => r.selectionStatus === "SELECTED").length,
    totalWaitlisted: ranked.filter((r) => r.selectionStatus === "WAITLISTED").length,
    totalRejected: ranked.filter((r) => r.selectionStatus === "REJECTED").length,
    candidates: ranked,
  };
}

export function publishRecruitmentResults(
  driveId: string,
  publisherName: string,
  finalRoster: { applicationId: string; selectionStatus: 'SELECTED' | 'WAITLISTED' | 'REJECTED'; notes?: string }[]
): RecruitmentResultRecord | null {
  const drive = recruitmentStore.drives.get(driveId);
  if (!drive) return null;

  // Update drive status
  drive.status = "RESULTS_PUBLISHED";
  drive.updatedAt = new Date().toISOString();

  // Update applications
  finalRoster.forEach((item) => {
    const app = recruitmentStore.applications.get(item.applicationId);
    if (app) {
      app.status = item.selectionStatus;
      app.notes = item.notes || app.notes;
      app.updatedAt = new Date().toISOString();
      if (!app.history) app.history = [];
      app.history.push({
        stageId: app.currentStageId,
        stageName: "Final Selection & Results",
        status: item.selectionStatus,
        timestamp: new Date().toISOString(),
        actor: publisherName,
        note: `Results Published as ${item.selectionStatus}.`,
      });
    }
  });

  const driveApps = getApplications({ driveId });
  const ranked = calculateMeritRanking(
    driveApps.map((a) => {
      const rosterItem = finalRoster.find((r) => r.applicationId === a.id);
      return {
        applicationId: a.id,
        studentId: a.studentId,
        studentName: a.studentName,
        studentAvatar: a.studentAvatar,
        university: a.university,
        degree: a.degree,
        branch: a.branch,
        assessmentScore: a.assessmentScore || 0,
        interviewScore: a.interviewScore || 0,
        cgpa: a.cgpa,
        selectionStatus: rosterItem?.selectionStatus || (a.status === "SELECTED" ? "SELECTED" : a.status === "REJECTED" ? "REJECTED" : "WAITLISTED"),
        notes: rosterItem?.notes || a.notes,
      };
    }),
    drive.stageWeights
  );

  const resultRecord: RecruitmentResultRecord = {
    id: `result_${driveId}_${Date.now()}`,
    driveId,
    driveTitle: drive.title,
    company: drive.company,
    publishedAt: new Date().toISOString(),
    publishedBy: publisherName,
    isLocked: true,
    totalSelected: ranked.filter((r) => r.selectionStatus === "SELECTED").length,
    totalWaitlisted: ranked.filter((r) => r.selectionStatus === "WAITLISTED").length,
    totalRejected: ranked.filter((r) => r.selectionStatus === "REJECTED").length,
    candidates: ranked,
  };

  recruitmentStore.results.set(driveId, resultRecord);

  logRecruiterAction({
    driveId,
    driveTitle: drive.title,
    actorId: "recruiter_01",
    actorName: publisherName,
    actorRole: "RECRUITER",
    action: "RESULTS_PUBLISHED",
    targetType: "RESULT",
    targetId: resultRecord.id,
    targetName: drive.title,
    previousState: "SELECTION_IN_PROGRESS",
    newState: "RESULTS_PUBLISHED",
    details: `Official merit list and final results published for ${drive.title}. Selected: ${resultRecord.totalSelected}, Waitlisted: ${resultRecord.totalWaitlisted}, Rejected: ${resultRecord.totalRejected}. Results are now locked.`,
  });

  persistRecruitmentStoreToDisk();
  return resultRecord;
}

export function logRecruiterAction(
  entry: Omit<RecruiterAuditLogEntry, "id" | "timestamp">
): RecruiterAuditLogEntry {
  const fullEntry: RecruiterAuditLogEntry = {
    ...entry,
    id: `audit_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ipSessionRef: entry.ipSessionRef || "127.0.0.1 (Secure Session)",
  };

  recruitmentStore.auditLogs.unshift(fullEntry);
  persistRecruitmentStoreToDisk();
  return fullEntry;
}

export function getRecruiterAuditLogs(driveId?: string, limit = 100): RecruiterAuditLogEntry[] {
  let logs = recruitmentStore.auditLogs;
  if (driveId && driveId !== "all") {
    logs = logs.filter((l) => l.driveId === driveId);
  }
  return logs.slice(0, limit);
}

export function getRecruiterOverviewMetrics() {
  const drives = getRecruitmentDrives();
  const applications = getApplications();
  const allInterviews = getInterviews();

  const activeDrives = drives.filter(
    (d) =>
      d.status === "APPLICATIONS_OPEN" ||
      d.status === "SCREENING" ||
      d.status === "SELECTION_IN_PROGRESS" ||
      d.status === "PUBLISHED"
  );

  const totalApplications = applications.length;
  const eligibleCandidates = applications.filter((a) => a.eligibility?.status === "ELIGIBLE").length;
  const shortlistedCandidates = applications.filter(
    (a) => a.status === "SHORTLISTED" || a.status === "IN_SELECTION" || a.status === "SELECTED"
  ).length;
  const scheduledInterviews = allInterviews.filter((i) => i.status === "SCHEDULED").length;
  const selectedCandidates = applications.filter((a) => a.status === "SELECTED").length;

  return {
    kpis: {
      activeDrivesCount: activeDrives.length,
      totalApplicationsCount: totalApplications,
      eligibleCandidatesCount: eligibleCandidates,
      shortlistedCandidatesCount: shortlistedCandidates,
      interviewsCount: scheduledInterviews,
      selectedCandidatesCount: selectedCandidates,
    },
    activeDrives: activeDrives.slice(0, 4),
    recentApplications: applications.slice(0, 6),
    upcomingInterviews: allInterviews
      .filter((i) => i.status === "SCHEDULED" || i.status === "COMPLETED")
      .slice(0, 5),
    recentAuditLogs: recruitmentStore.auditLogs.slice(0, 6),
  };
}
