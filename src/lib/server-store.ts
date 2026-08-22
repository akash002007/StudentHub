import fs from "fs";
import path from "path";
import {
  AdminNotificationItem,
  AdminOverviewMetrics,
  AdminStudentRecord,
  AuditLogEntry,
  NotificationItem,
  StudentProfile,
  RecruiterProfile,
  AdminProfile,
  User,
  UserRole,
  VerificationChecklistItem,
  VerificationQueueStatus,
  VerificationRequest,
  VerificationRiskLevel,
  VerificationStatus,
  VerificationType,
  GitHubRepository,
  CareerDNA,
  GitHubSyncStatus,
  ResumeRecord,
  CodeforcesConnection,
  CodeforcesDNA,
  LeetCodeConnection,
  LeetCodeDNA,
  CertificateRecord,
  CertificateDNA,
  HuggingFaceConnectionRecord,
  HuggingFaceDNA,
} from "@/types";
import { defaultStudentUser, defaultAdminUser, defaultRecruiterUser } from "@/data/mock-users";
import { verificationRequests as initialVerificationRequests, auditLogs as initialAuditLogs, adminNotifications as initialAdminNotifications } from "@/data/mock-admin-data";
import { initialMockNotifications } from "@/data/mock-notifications";
import { isUniversityEmail } from "@/lib/utils";

interface StoreState {
  verificationRequests: VerificationRequest[];
  studentProfiles: Map<string, StudentProfile>;
  recruiterProfiles: Map<string, RecruiterProfile>;
  adminProfiles: Map<string, AdminProfile>;
  auditLogs: AuditLogEntry[];
  adminNotifications: AdminNotificationItem[];
  studentNotifications: Map<string, NotificationItem[]>; // userId -> notifications
  githubConnections: Map<string, GitHubConnectionRecord>; // userId -> GitHubConnectionRecord
  githubRepositories: Map<string, GitHubRepository[]>; // userId -> GitHubRepository[]
  careerDNA: Map<string, CareerDNA>; // userId -> CareerDNA
  resumes: Map<string, ResumeRecord[]>; // userId -> ResumeRecord[]
  codeforcesConnections: Map<string, CodeforcesConnection>; // userId -> CodeforcesConnection
  codeforcesDNA: Map<string, CodeforcesDNA>; // userId -> CodeforcesDNA
  leetcodeConnections: Map<string, LeetCodeConnection>; // userId -> LeetCodeConnection
  leetcodeDNA: Map<string, LeetCodeDNA>; // userId -> LeetCodeDNA
  huggingfaceConnections: Map<string, HuggingFaceConnectionRecord>; // userId -> HuggingFaceConnectionRecord
  huggingfaceDNA: Map<string, HuggingFaceDNA>; // userId -> HuggingFaceDNA
  certificates: Map<string, CertificateRecord[]>; // userId -> CertificateRecord[]
  certificateDNA: Map<string, CertificateDNA>; // userId -> CertificateDNA
  verificationCounter: number;
}

export interface GitHubConnectionRecord {
  id: string;
  userId: string;
  githubUserId: string;
  githubUsername: string;
  githubDisplayName: string | null;
  githubAvatarUrl: string | null;
  githubProfileUrl: string;
  accessTokenEncrypted: string;
  syncStatus?: GitHubSyncStatus;
  syncStartedAt?: string | null;
  syncCompletedAt?: string | null;
  syncError?: string | null;
  repositoriesCount?: number;
  projectsDetectedCount?: number;
  skillsDetectedCount?: number;
  connectedAt: string;
  updatedAt: string;
}

// Global declaration to maintain single memory store during Next.js dev hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __STUDENTHUB_SERVER_STORE__: StoreState | undefined;
}

function initializeStore(): StoreState {
  const studentProfiles = new Map<string, StudentProfile>();
  const recruiterProfiles = new Map<string, RecruiterProfile>();
  const adminProfiles = new Map<string, AdminProfile>();
  const studentNotifications = new Map<string, NotificationItem[]>();
  const githubConnections = new Map<string, GitHubConnectionRecord>();
  const githubRepositories = new Map<string, GitHubRepository[]>();
  const careerDNA = new Map<string, CareerDNA>();
  const resumes = new Map<string, ResumeRecord[]>();
  const codeforcesConnections = new Map<string, CodeforcesConnection>();
  const codeforcesDNA = new Map<string, CodeforcesDNA>();

  // Initialize default student
  studentProfiles.set(defaultStudentUser.id, {
    ...defaultStudentUser,
    verificationStatus: "approved",
  });
  studentNotifications.set(defaultStudentUser.id, [...initialMockNotifications]);

  // Initialize default recruiter
  recruiterProfiles.set(defaultRecruiterUser.id, {
    ...defaultRecruiterUser,
  });

  // Initialize default admin
  adminProfiles.set(defaultAdminUser.id, {
    ...defaultAdminUser,
  });

  // Clone initial verification requests
  const verificationRequests = JSON.parse(JSON.stringify(initialVerificationRequests)) as VerificationRequest[];

  // Also populate student profiles from the verification requests so all records are 100% unified
  verificationRequests.forEach((req) => {
    if (!studentProfiles.has(req.studentId)) {
      const mappedStatus: VerificationStatus =
        req.status === "Approved"
          ? "approved"
          : req.status === "Rejected"
          ? "rejected"
          : req.status === "Needs Information"
          ? "needs_information"
          : "pending";

      studentProfiles.set(req.studentId, {
        id: req.studentId,
        name: req.student.fullName,
        email: req.student.email,
        role: "student",
        avatar: req.student.avatar,
        headline: `${req.student.degree} ${req.student.branch} @ ${req.student.college}`,
        university: req.student.college,
        degree: req.student.degree,
        branch: req.student.branch,
        academicStream: "Engineering & Technology",
        specialization: req.student.branch,
        academicLevel: "Undergraduate",
        yearOfStudy: req.student.year,
        graduationYear: parseInt(req.student.graduationYear, 10) || 2027,
        cgpa: "3.85",
        location: "Campus / Remote",
        bio: `Student at ${req.student.college} focusing on ${req.student.branch}.`,
        phone: req.student.phone,
        hasUniversityEmail: req.student.collegeEmail.endsWith(".edu") || req.student.collegeEmail.endsWith(".ac.in"),
        isUniversityEmail: req.student.collegeEmail.endsWith(".edu") || req.student.collegeEmail.endsWith(".ac.in"),
        personalEmail: req.student.email,
        accountStatus: "profile_complete",
        verificationStatus: mappedStatus,
        onboardingCompleted: true,
        verificationRequest: {
          id: `req_${req.verificationId}`,
          verificationId: req.verificationId,
          studentId: req.studentId,
          studentName: req.student.fullName,
          university: req.student.college,
          universityEmail: req.student.collegeEmail,
          verificationType: req.verificationMethod === "College Email" ? "university_email" : req.verificationMethod === "Payment Receipt" ? "payment_receipt" : "student_id_card",
          status: mappedStatus,
          documentName: req.document?.fileName || "Verification_Document.pdf",
          documentSize: req.document?.fileSize || "1.5 MB",
          documentUrl: req.document?.fileUrl || "#",
          personalEmail: req.student.email,
          submittedAt: req.submittedAt,
          reviewedAt: req.reviewedAt,
          reviewerName: req.reviewedBy,
          rejectionReason: req.rejectionReason,
          adminNotes: req.adminNotes,
        },
        status: "Open to Summer 2026 Internships",
        skills: ["React", "TypeScript", "Python", "Data Structures"],
        resume: {
          fileName: `${req.student.fullName.replace(" ", "_")}_Resume.pdf`,
          fileSize: "1.4 MB",
          uploadedAt: "Uploaded recently",
          url: "#",
        },
        projects: [
          {
            id: `proj_${req.studentId}_1`,
            title: "Campus Connect",
            description: "A collaborative academic hub for students and peers.",
            technologies: ["React", "TypeScript", "Node.js"],
            date: "Nov 2024",
            type: "Academic Project",
            featured: true,
          },
        ],
        certifications: [
          {
            id: `cert_${req.studentId}_1`,
            name: "Cloud Practitioner Certified",
            issuingOrganization: "AWS",
            issueDate: "2025",
            credentialId: `AWS-${req.studentId.toUpperCase()}`,
            credentialUrl: "https://aws.amazon.com",
          },
        ],
        socialLinks: {
          github: `https://github.com/${req.student.fullName.toLowerCase().replace(" ", "")}`,
          linkedin: `https://linkedin.com/in/${req.student.fullName.toLowerCase().replace(" ", "-")}`,
        },
        stats: {
          profileViews: 140,
          searchAppearances: 45,
          applicationsCount: 3,
          interviewsCount: 1,
        },
      });

      studentNotifications.set(req.studentId, [
        {
          id: `notif_${req.studentId}_1`,
          type: "system",
          title: "Account Created",
          description: "Welcome to StudentHub! Verification process is underway.",
          timestamp: req.student.accountCreatedAt || "Recently",
          isRead: true,
        },
      ]);
    }
  });

  const initialStore: StoreState = {
    verificationRequests,
    studentProfiles,
    recruiterProfiles,
    adminProfiles,
    auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    adminNotifications: JSON.parse(JSON.stringify(initialAdminNotifications)),
    studentNotifications,
    githubConnections,
    githubRepositories,
    careerDNA,
    resumes,
    codeforcesConnections,
    codeforcesDNA,
    leetcodeConnections: new Map<string, LeetCodeConnection>(),
    leetcodeDNA: new Map<string, LeetCodeDNA>(),
    huggingfaceConnections: new Map<string, HuggingFaceConnectionRecord>(),
    huggingfaceDNA: new Map<string, HuggingFaceDNA>(),
    certificates: new Map<string, CertificateRecord[]>(),
    certificateDNA: new Map<string, CertificateDNA>(),
    verificationCounter: 4814,
  };

  loadStoreFromDisk(initialStore);
  return initialStore;
}

const DB_FILE_PATH = path.join(process.cwd(), ".data", "server-store-db.json");

function loadStoreFromDisk(storeObj: StoreState): void {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) return;
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    if (!raw.trim()) return;
    const data = JSON.parse(raw);

    if (data.codeforcesConnections && Array.isArray(data.codeforcesConnections)) {
      data.codeforcesConnections.forEach(([key, val]: [string, CodeforcesConnection]) => {
        storeObj.codeforcesConnections.set(key, val);
      });
    }
    if (data.codeforcesDNA && Array.isArray(data.codeforcesDNA)) {
      data.codeforcesDNA.forEach(([key, val]: [string, CodeforcesDNA]) => {
        storeObj.codeforcesDNA.set(key, val);
      });
    }
    if (data.leetcodeConnections && Array.isArray(data.leetcodeConnections)) {
      data.leetcodeConnections.forEach(([key, val]: [string, LeetCodeConnection]) => {
        storeObj.leetcodeConnections.set(key, val);
      });
    }
    if (data.leetcodeDNA && Array.isArray(data.leetcodeDNA)) {
      data.leetcodeDNA.forEach(([key, val]: [string, LeetCodeDNA]) => {
        storeObj.leetcodeDNA.set(key, val);
      });
    }
    if (data.githubConnections && Array.isArray(data.githubConnections)) {
      data.githubConnections.forEach(([key, val]: [string, GitHubConnectionRecord]) => {
        storeObj.githubConnections.set(key, val);
      });
    }
    if (data.githubRepositories && Array.isArray(data.githubRepositories)) {
      data.githubRepositories.forEach(([key, val]: [string, GitHubRepository[]]) => {
        storeObj.githubRepositories.set(key, val);
      });
    }
    if (data.huggingfaceConnections && Array.isArray(data.huggingfaceConnections)) {
      data.huggingfaceConnections.forEach(([key, val]: [string, HuggingFaceConnectionRecord]) => {
        storeObj.huggingfaceConnections.set(key, val);
      });
    }
    if (data.huggingfaceDNA && Array.isArray(data.huggingfaceDNA)) {
      data.huggingfaceDNA.forEach(([key, val]: [string, HuggingFaceDNA]) => {
        storeObj.huggingfaceDNA.set(key, val);
      });
    }
    if (data.certificates && Array.isArray(data.certificates)) {
      data.certificates.forEach(([key, val]: [string, CertificateRecord[]]) => {
        storeObj.certificates.set(key, val);
      });
    }
    if (data.certificateDNA && Array.isArray(data.certificateDNA)) {
      data.certificateDNA.forEach(([key, val]: [string, CertificateDNA]) => {
        storeObj.certificateDNA.set(key, val);
      });
    }
    if (data.resumes && Array.isArray(data.resumes)) {
      data.resumes.forEach(([key, val]: [string, ResumeRecord[]]) => {
        storeObj.resumes.set(key, val);
      });
    }
    if (data.careerDNA && Array.isArray(data.careerDNA)) {
      data.careerDNA.forEach(([key, val]: [string, CareerDNA]) => {
        storeObj.careerDNA.set(key, val);
      });
    }
  } catch (err) {
    console.warn("Failed to load server store from disk:", err);
  }
}

export function persistStoreToDisk(): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const serializable = {
      codeforcesConnections: Array.from(store.codeforcesConnections.entries()),
      codeforcesDNA: Array.from(store.codeforcesDNA.entries()),
      leetcodeConnections: Array.from(store.leetcodeConnections.entries()),
      leetcodeDNA: Array.from(store.leetcodeDNA.entries()),
      githubConnections: Array.from(store.githubConnections.entries()),
      githubRepositories: Array.from(store.githubRepositories.entries()),
      huggingfaceConnections: Array.from(store.huggingfaceConnections.entries()),
      huggingfaceDNA: Array.from(store.huggingfaceDNA.entries()),
      certificates: Array.from(store.certificates.entries()),
      certificateDNA: Array.from(store.certificateDNA.entries()),
      resumes: Array.from(store.resumes.entries()),
      careerDNA: Array.from(store.careerDNA.entries()),
    };

    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(serializable, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist server store to disk:", err);
  }
}

const store: StoreState = global.__STUDENTHUB_SERVER_STORE__ || (global.__STUDENTHUB_SERVER_STORE__ = initializeStore());

export class ServerStore {
  static getUserById(userId: string): any {
    return (
      store.studentProfiles.get(userId) ||
      store.recruiterProfiles.get(userId) ||
      store.adminProfiles.get(userId) ||
      null
    );
  }

  static getMetrics(): AdminOverviewMetrics {
    const totalStudents = store.studentProfiles.size + 12400; // Realistic platform baseline
    const pendingVerification = store.verificationRequests.filter(
      (r) => r.status === "Pending" || r.status === "Under Review"
    ).length;
    const verifiedStudents = store.verificationRequests.filter((r) => r.status === "Approved").length + 11900;
    const rejectedApplications = store.verificationRequests.filter((r) => r.status === "Rejected").length + 360;
    const awaitingInformation = store.verificationRequests.filter((r) => r.status === "Needs Information").length + 45;

    const totalDecided = verifiedStudents + rejectedApplications;
    const verificationRate = totalDecided > 0 ? Number(((verifiedStudents / totalDecided) * 100).toFixed(1)) : 95.6;

    return {
      totalStudents,
      pendingVerification,
      verifiedStudents,
      rejectedApplications,
      verificationRate,
      avgVerificationTimeHours: 8.7,
      newRegistrationsToday: 32,
      newRegistrationsWeek: 248,
      awaitingInformation,
      suspiciousAttempts: 13,
    };
  }

  static getAllVerificationRequests(filters?: {
    search?: string;
    status?: string;
    method?: string;
    risk?: string;
    sort?: string;
  }): VerificationRequest[] {
    let list = [...store.verificationRequests];

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.verificationId.toLowerCase().includes(q) ||
          r.student.fullName.toLowerCase().includes(q) ||
          r.student.email.toLowerCase().includes(q) ||
          r.student.college.toLowerCase().includes(q) ||
          r.student.studentId.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== "All") {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters?.method && filters.method !== "All") {
      list = list.filter((r) => r.verificationMethod === filters.method);
    }

    if (filters?.risk && filters.risk !== "All") {
      list = list.filter((r) => r.riskLevel === filters.risk);
    }

    if (filters?.sort) {
      if (filters.sort === "Newest") {
        list.sort((a, b) => b.verificationId.localeCompare(a.verificationId));
      } else if (filters.sort === "Oldest") {
        list.sort((a, b) => a.verificationId.localeCompare(b.verificationId));
      } else if (filters.sort === "Risk level") {
        const rank = { High: 3, Medium: 2, Low: 1 } as const;
        list.sort((a, b) => rank[b.riskLevel] - rank[a.riskLevel]);
      } else {
        const rank = { "Review Required": 3, "High Priority": 2, Normal: 1 } as const;
        list.sort((a, b) => rank[b.priority] - rank[a.priority]);
      }
    }

    return list;
  }

  static getVerificationRequestById(verificationId: string): VerificationRequest | null {
    const req = store.verificationRequests.find(
      (r) => r.verificationId.toLowerCase() === verificationId.toLowerCase()
    );
    return req ? { ...req } : null;
  }

  static getVerificationRequestByStudentId(studentId: string): VerificationRequest | null {
    const req = store.verificationRequests.find((r) => r.studentId === studentId);
    return req ? { ...req } : null;
  }

  static updateChecklist(verificationId: string, items: VerificationChecklistItem[]): boolean {
    const req = store.verificationRequests.find(
      (r) => r.verificationId.toLowerCase() === verificationId.toLowerCase()
    );
    if (!req) return false;
    req.checklist = items;
    return true;
  }

  static approveVerification(verificationId: string, adminName: string = "Priya Menon", adminNotes?: string): { success: boolean; request?: VerificationRequest } {
    const req = store.verificationRequests.find(
      (r) => r.verificationId.toLowerCase() === verificationId.toLowerCase()
    );
    if (!req) return { success: false };

    const prevStatus = req.status;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    req.status = "Approved";
    req.reviewedAt = nowStr;
    req.reviewedBy = adminName;
    if (adminNotes) req.adminNotes = adminNotes;

    // Mark checklist as verified
    req.checklist = req.checklist.map((item) => ({ ...item, state: "Verified" }));

    // Add timeline event
    req.timeline.unshift({
      id: `t_${Date.now()}`,
      timestamp: nowStr,
      title: "Approved by Admin",
      actor: adminName,
      description: adminNotes || "Student account verified for full StudentHub platform access.",
    });

    // Update Student Profile
    const student = store.studentProfiles.get(req.studentId) || (req.studentId === defaultStudentUser.id ? defaultStudentUser : null);
    if (student) {
      student.verificationStatus = "approved";
      if (student.verificationRequest) {
        student.verificationRequest.status = "approved";
        student.verificationRequest.reviewedAt = nowStr;
        student.verificationRequest.reviewerName = adminName;
        student.verificationRequest.adminNotes = adminNotes;
      }
      store.studentProfiles.set(student.id, student);

      // Add student notification
      const studentNotifs = store.studentNotifications.get(student.id) || [];
      studentNotifs.unshift({
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Your StudentHub Account Has Been Verified",
        description: "Your student verification has been approved. You now have access to the full StudentHub experience including Fast-Track applications, messaging, and communities.",
        timestamp: "Just now",
        isRead: false,
        actionUrl: "/dashboard",
      });
      store.studentNotifications.set(student.id, studentNotifs);
    }

    // Log Audit Entry
    this.addAuditLog({
      admin: adminName,
      action: "ADMIN_APPROVED_STUDENT",
      student: req.student.fullName,
      previousStatus: prevStatus,
      newStatus: "Approved",
      ipSessionRef: "103.22.44.91 / sess_admin",
      details: adminNotes || `Approved student ${req.student.fullName} (${req.verificationId}). Verification checklist passed.`,
    });

    return { success: true, request: req };
  }

  static rejectVerification(
    verificationId: string,
    reason: string,
    adminName: string = "Priya Menon",
    adminNotes?: string
  ): { success: boolean; request?: VerificationRequest } {
    const req = store.verificationRequests.find(
      (r) => r.verificationId.toLowerCase() === verificationId.toLowerCase()
    );
    if (!req) return { success: false };

    const prevStatus = req.status;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    req.status = "Rejected";
    req.reviewedAt = nowStr;
    req.reviewedBy = adminName;
    req.rejectionReason = reason;
    if (adminNotes) req.adminNotes = adminNotes;

    // Add timeline event
    req.timeline.unshift({
      id: `t_${Date.now()}`,
      timestamp: nowStr,
      title: "Verification Rejected",
      actor: adminName,
      description: `Reason: ${reason}`,
    });

    // Update Student Profile
    const student = store.studentProfiles.get(req.studentId) || (req.studentId === defaultStudentUser.id ? defaultStudentUser : null);
    if (student) {
      student.verificationStatus = "rejected";
      if (student.verificationRequest) {
        student.verificationRequest.status = "rejected";
        student.verificationRequest.reviewedAt = nowStr;
        student.verificationRequest.reviewerName = adminName;
        student.verificationRequest.rejectionReason = reason;
        student.verificationRequest.adminNotes = adminNotes;
      }
      store.studentProfiles.set(student.id, student);

      // Add student notification
      const studentNotifs = store.studentNotifications.get(student.id) || [];
      studentNotifs.unshift({
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Student Verification Notice",
        description: `Your StudentHub verification could not be approved: ${reason}. Please review your document and resubmit.`,
        timestamp: "Just now",
        isRead: false,
        actionUrl: "/onboarding?step=verification",
      });
      store.studentNotifications.set(student.id, studentNotifs);
    }

    // Log Audit Entry
    this.addAuditLog({
      admin: adminName,
      action: "ADMIN_REJECTED_STUDENT",
      student: req.student.fullName,
      previousStatus: prevStatus,
      newStatus: "Rejected",
      ipSessionRef: "103.22.44.91 / sess_admin",
      details: `Rejection reason: ${reason}. ${adminNotes || ""}`,
    });

    return { success: true, request: req };
  }

  static requestInformation(
    verificationId: string,
    requirements: string[],
    message: string,
    adminName: string = "Priya Menon"
  ): { success: boolean; request?: VerificationRequest } {
    const req = store.verificationRequests.find(
      (r) => r.verificationId.toLowerCase() === verificationId.toLowerCase()
    );
    if (!req) return { success: false };

    const prevStatus = req.status;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    req.status = "Needs Information";
    req.reviewedAt = nowStr;
    req.reviewedBy = adminName;
    req.adminNotes = message;

    // Add timeline event
    req.timeline.unshift({
      id: `t_${Date.now()}`,
      timestamp: nowStr,
      title: "Requested Additional Information",
      actor: adminName,
      description: `${requirements.join(", ")} - ${message}`,
    });

    // Update Student Profile
    const student = store.studentProfiles.get(req.studentId) || (req.studentId === defaultStudentUser.id ? defaultStudentUser : null);
    if (student) {
      student.verificationStatus = "needs_information";
      if (student.verificationRequest) {
        student.verificationRequest.status = "needs_information";
        student.verificationRequest.reviewedAt = nowStr;
        student.verificationRequest.reviewerName = adminName;
        student.verificationRequest.adminNotes = message;
        student.verificationRequest.requiredInformation = requirements;
      }
      store.studentProfiles.set(student.id, student);

      // Add student notification
      const studentNotifs = store.studentNotifications.get(student.id) || [];
      studentNotifs.unshift({
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Additional Information Required",
        description: `Admin has requested additional information for verification: ${message}`,
        timestamp: "Just now",
        isRead: false,
        actionUrl: "/onboarding?step=verification",
      });
      store.studentNotifications.set(student.id, studentNotifs);
    }

    // Log Audit Entry
    this.addAuditLog({
      admin: adminName,
      action: "ADMIN_REQUESTED_INFORMATION",
      student: req.student.fullName,
      previousStatus: prevStatus,
      newStatus: "Needs Information",
      ipSessionRef: "103.22.44.91 / sess_admin",
      details: `Required: ${requirements.join(", ")}. Message: ${message}`,
    });

    return { success: true, request: req };
  }

  static submitStudentVerification(
    studentId: string,
    data: {
      studentName: string;
      email: string;
      college: string;
      degree: string;
      branch: string;
      year: string;
      studentIdNumber: string;
      graduationYear: string;
      phone?: string;
      verificationType: VerificationType;
      documentName: string;
      documentSize: string;
      documentUrl: string;
      personalEmail?: string;
    }
  ): VerificationRequest {
    const nextVerId = `VER-2026-${String(store.verificationCounter++).padStart(6, "0")}`;
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const isUni = data.email.endsWith(".edu") || data.email.endsWith(".ac.in");

    const newRequest: VerificationRequest = {
      verificationId: nextVerId,
      studentId,
      status: isUni ? "Approved" : "Pending",
      verificationMethod:
        data.verificationType === "university_email"
          ? "College Email"
          : data.verificationType === "payment_receipt"
          ? "Payment Receipt"
          : "Manual Review",
      submittedAt: nowStr,
      riskLevel: "Low",
      priority: "Normal",
      verificationResult: isUni
        ? "Automated institutional email domain verification verified successfully."
        : "Submitted for manual administrative review.",
      student: {
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
        fullName: data.studentName,
        email: data.email,
        phone: data.phone || "+1 (555) 342-8921",
        college: data.college,
        degree: data.degree,
        branch: data.branch,
        year: data.year,
        semester: "5",
        graduationYear: data.graduationYear,
        studentId: data.studentIdNumber,
        collegeEmail: data.email,
        accountCreatedAt: nowStr,
      },
      academicFields: [
        { label: "College", value: data.college, verified: isUni },
        { label: "Degree", value: data.degree, verified: isUni },
        { label: "Branch", value: data.branch, verified: isUni },
        { label: "Year", value: data.year, verified: isUni },
        { label: "Graduation Year", value: data.graduationYear, verified: isUni },
        { label: "Student ID", value: data.studentIdNumber, verified: false },
        { label: "College Email", value: data.email, verified: isUni },
      ],
      checklist: [
        { id: "c1", label: "Student name matches account", state: isUni ? "Verified" : "Pending" },
        { id: "c2", label: "College name matches submitted information", state: isUni ? "Verified" : "Pending" },
        { id: "c3", label: "Student ID is valid", state: isUni ? "Verified" : "Pending" },
        { id: "c4", label: "Academic information is consistent", state: isUni ? "Verified" : "Pending" },
        { id: "c5", label: "Document appears authentic", state: isUni ? "Verified" : "Pending" },
        { id: "c6", label: "Payment/receipt information is valid", state: isUni ? "Verified" : "Pending" },
        { id: "c7", label: "No duplicate account detected", state: "Verified" },
        { id: "c8", label: "No suspicious activity detected", state: "Verified" },
      ],
      document: {
        fileName: data.documentName,
        uploadDate: nowStr,
        fileSize: data.documentSize,
        documentType: data.verificationType === "payment_receipt" ? "College Fee Payment Receipt" : "College Student ID Card",
        studentNameDetected: data.studentName,
        collegeNameDetected: data.college,
        paymentDate: nowStr.split(",")[0],
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        fileUrl: data.documentUrl,
      },
      duplicateCandidates: [],
      timeline: [
        {
          id: `t_${Date.now()}`,
          timestamp: nowStr,
          title: "Application submitted",
          actor: data.studentName,
        },
      ],
    };

    // Prepend to verification requests list
    store.verificationRequests.unshift(newRequest);

    // Update / Save student profile
    const existing = store.studentProfiles.get(studentId) || (studentId === defaultStudentUser.id ? defaultStudentUser : null);
    const updatedProfile: StudentProfile = {
      ...(existing || defaultStudentUser),
      id: studentId,
      name: data.studentName,
      email: data.email,
      university: data.college,
      degree: data.degree,
      branch: data.branch,
      yearOfStudy: data.year,
      graduationYear: parseInt(data.graduationYear, 10) || 2027,
      phone: data.phone || existing?.phone || "",
      verificationStatus: isUni ? "approved" : "pending",
      personalEmail: data.personalEmail || existing?.personalEmail,
      verificationRequest: {
        id: `req_${nextVerId}`,
        verificationId: nextVerId,
        studentId,
        studentName: data.studentName,
        university: data.college,
        universityEmail: data.email,
        verificationType: data.verificationType,
        status: isUni ? "approved" : "pending",
        documentName: data.documentName,
        documentSize: data.documentSize,
        documentUrl: data.documentUrl,
        personalEmail: data.personalEmail,
        submittedAt: nowStr,
        reviewedAt: isUni ? nowStr : undefined,
        reviewerName: isUni ? "Automated Domain Verification System" : undefined,
      },
    };
    store.studentProfiles.set(studentId, updatedProfile);

    // Log Audit Entry
    this.addAuditLog({
      admin: "System / Student Self-Service",
      action: "STUDENT_SUBMITTED_VERIFICATION",
      student: data.studentName,
      previousStatus: "not_submitted",
      newStatus: isUni ? "Approved" : "Pending",
      ipSessionRef: "103.22.44.11 / sess_user",
      details: `Submitted verification (${nextVerId}) via ${data.verificationType}.`,
    });

    // Admin Notification
    store.adminNotifications.unshift({
      id: `an_${Date.now()}`,
      type: "verification_request",
      title: "New Student Verification Request",
      description: `${data.studentName} (${data.college}) submitted verification request ${nextVerId}.`,
      timestamp: "Just now",
      isRead: false,
    });

    return newRequest;
  }

  static resubmitStudentVerification(
    studentId: string,
    data: {
      documentName: string;
      documentSize: string;
      documentUrl: string;
      personalEmail?: string;
      notes?: string;
    }
  ): { success: boolean; request?: VerificationRequest } {
    let req = store.verificationRequests.find((r) => r.studentId === studentId);
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!req) {
      // Create if none existed
      const student = store.studentProfiles.get(studentId) || defaultStudentUser;
      req = this.submitStudentVerification(studentId, {
        studentName: student.name,
        email: student.email,
        college: student.university,
        degree: student.degree || "B.Tech",
        branch: student.branch || "Computer Science",
        year: student.yearOfStudy || "3rd Year",
        studentIdNumber: "STU-2026-REG",
        graduationYear: String(student.graduationYear || 2027),
        verificationType: "payment_receipt",
        documentName: data.documentName,
        documentSize: data.documentSize,
        documentUrl: data.documentUrl,
        personalEmail: data.personalEmail,
      });
    }

    const prevStatus = req.status;
    req.status = "Pending";
    req.submittedAt = nowStr;
    req.reviewedAt = undefined;
    req.reviewedBy = undefined;
    req.rejectionReason = undefined;

    if (req.document) {
      req.document.fileName = data.documentName;
      req.document.fileSize = data.documentSize;
      req.document.uploadDate = nowStr;
      req.document.fileUrl = data.documentUrl;
    }

    // Add timeline event
    req.timeline.unshift({
      id: `t_${Date.now()}`,
      timestamp: nowStr,
      title: "Updated Document Resubmitted",
      actor: req.student.fullName,
      description: data.notes || "Student uploaded an updated document for review.",
    });

    // Update Student Profile
    const student = store.studentProfiles.get(studentId) || (studentId === defaultStudentUser.id ? defaultStudentUser : null);
    if (student) {
      student.verificationStatus = "pending";
      if (student.verificationRequest) {
        student.verificationRequest.status = "pending";
        student.verificationRequest.documentName = data.documentName;
        student.verificationRequest.documentSize = data.documentSize;
        student.verificationRequest.documentUrl = data.documentUrl;
        student.verificationRequest.submittedAt = nowStr;
        student.verificationRequest.rejectionReason = undefined;
      }
      store.studentProfiles.set(studentId, student);
    }

    // Log Audit Entry
    this.addAuditLog({
      admin: "System / Student Self-Service",
      action: "STUDENT_RESUBMITTED_VERIFICATION",
      student: req.student.fullName,
      previousStatus: prevStatus,
      newStatus: "Pending",
      ipSessionRef: "103.22.44.11 / sess_user",
      details: `Resubmitted document ${data.documentName} for ${req.verificationId}.`,
    });

    // Admin Notification
    store.adminNotifications.unshift({
      id: `an_${Date.now()}`,
      type: "resubmission",
      title: "Verification Document Resubmitted",
      description: `${req.student.fullName} resubmitted document for ${req.verificationId}.`,
      timestamp: "Just now",
      isRead: false,
    });

    return { success: true, request: req };
  }

  static getAllStudents(query?: string, statusFilter?: string): AdminStudentRecord[] {
    const list: AdminStudentRecord[] = [];

    store.studentProfiles.forEach((p) => {
      let vStatus: VerificationQueueStatus = "Pending";
      if (p.verificationStatus === "approved") vStatus = "Approved";
      else if (p.verificationStatus === "rejected") vStatus = "Rejected";
      else if (p.verificationStatus === "needs_information") vStatus = "Needs Information";

      const dna = store.careerDNA.get(p.id);
      const githubConn = store.githubConnections.get(p.id);

      let careerDnaSummary = null;
      if (dna) {
        let scoreLabel = "Good";
        if (dna.overallScore >= 90) scoreLabel = "Exceptional";
        else if (dna.overallScore >= 80) scoreLabel = "Strong";
        else if (dna.overallScore >= 70) scoreLabel = "Good";
        else if (dna.overallScore >= 60) scoreLabel = "Developing";
        else scoreLabel = "Needs Improvement";

        careerDnaSummary = {
          score: dna.overallScore,
          rating: scoreLabel,
          confidence: dna.analysisConfidence || 85,
          primaryStrength: dna.potentialCareerDirections?.[0] || "Software Engineering",
          topSkills: (dna.topSkills || []).slice(0, 4).map((s) => s.name),
          projectsAnalyzed: dna.githubStats?.totalRepos || 0,
          verified: Boolean(githubConn && githubConn.syncStatus === "SYNCED"),
          lastAnalyzedAt: dna.updatedAt,
          summary: dna.summary,
          evidences: (dna.evidences || []).slice(0, 4),
          featuredProjects: dna.featuredProjects || [],
          skillGaps: dna.skillGaps || [],
          dimensions: dna.dimensions,
        };
      }

      const record: AdminStudentRecord = {
        id: p.id,
        name: p.name,
        email: p.email,
        college: p.university,
        degree: `${p.degree || "B.Tech"} ${p.branch || ""}`.trim(),
        year: p.yearOfStudy || "3rd Year",
        verificationStatus: vStatus,
        profileCompletion: p.skills.length > 0 && p.resume ? 95 : 80,
        lastActive: "Just now",
        joined: "Aug 2026",
        skills: p.skills || [],
        avatar: p.avatar,
        headline: p.headline,
        careerDNA: careerDnaSummary,
      };

      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.email.toLowerCase().includes(query.toLowerCase()) ||
        p.university.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = !statusFilter || statusFilter === "All" || vStatus === statusFilter;

      if (matchesQuery && matchesStatus) {
        list.push(record);
      }
    });

    return list;
  }

  static getStudentProfileById(studentId: string): StudentProfile | null {
    const profile = store.studentProfiles.get(studentId) || (studentId === defaultStudentUser.id ? defaultStudentUser : null);
    return profile ? JSON.parse(JSON.stringify(profile)) : null;
  }

  static updateStudentProfile(studentId: string, updates: Partial<StudentProfile>): StudentProfile | null {
    const profile = store.studentProfiles.get(studentId) || (studentId === defaultStudentUser.id ? defaultStudentUser : null);
    if (!profile) return null;
    const updated = { ...profile, ...updates };
    store.studentProfiles.set(studentId, updated);
    return updated;
  }

  static addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...entry,
    };
    store.auditLogs.unshift(newLog);
    return newLog;
  }

  static getAuditLogs(): AuditLogEntry[] {
    return [...store.auditLogs];
  }

  static getAdminNotifications(): AdminNotificationItem[] {
    return [...store.adminNotifications];
  }

  static markAdminNotificationAsRead(id: string) {
    store.adminNotifications = store.adminNotifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
  }

  static getStudentNotifications(studentId: string): NotificationItem[] {
    return store.studentNotifications.get(studentId) || [...initialMockNotifications];
  }

  static addStudentNotification(studentId: string, notification: Omit<NotificationItem, "id" | "timestamp" | "isRead">) {
    const list = store.studentNotifications.get(studentId) || [];
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      isRead: false,
      ...notification,
    };
    list.unshift(newNotif);
    store.studentNotifications.set(studentId, list);
    return newNotif;
  }

  static findUserByGoogleId(googleId: string): User | null {
    // Check students
    const students = Array.from(store.studentProfiles.values());
    for (let i = 0; i < students.length; i++) {
      if (students[i].googleId === googleId) return students[i];
    }
    // Check recruiters
    const recruiters = Array.from(store.recruiterProfiles.values());
    for (let i = 0; i < recruiters.length; i++) {
      if (recruiters[i].googleId === googleId) return recruiters[i];
    }
    // Check admins
    const admins = Array.from(store.adminProfiles.values());
    for (let i = 0; i < admins.length; i++) {
      if (admins[i].googleId === googleId) return admins[i];
    }
    return null;
  }

  static findUserByEmail(email: string): User | null {
    const normalized = email.trim().toLowerCase();
    // Check students
    const students = Array.from(store.studentProfiles.values());
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (student.email.trim().toLowerCase() === normalized) return student;
      if (student.personalEmail && student.personalEmail.trim().toLowerCase() === normalized) return student;
    }
    // Check recruiters
    const recruiters = Array.from(store.recruiterProfiles.values());
    for (let i = 0; i < recruiters.length; i++) {
      if (recruiters[i].email.trim().toLowerCase() === normalized) return recruiters[i];
    }
    // Check admins
    const admins = Array.from(store.adminProfiles.values());
    for (let i = 0; i < admins.length; i++) {
      if (admins[i].email.trim().toLowerCase() === normalized) return admins[i];
    }
    return null;
  }

  static handleGoogleAuth(params: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    role?: UserRole;
    university?: string;
    company?: string;
  }): { user: User; isNewUser: boolean; redirectUrl: string } | { error: string; status: number } {
    const { googleId, email, name, avatar, role = "student", university, company } = params;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user already exists with this googleId
    const existingGoogleUser = ServerStore.findUserByGoogleId(googleId);
    if (existingGoogleUser) {
      const redirectUrl =
        existingGoogleUser.role === "admin"
          ? "/admin"
          : existingGoogleUser.role === "recruiter"
          ? "/dashboard/recruiter"
          : (existingGoogleUser as StudentProfile).verificationStatus === "not_submitted"
          ? "/onboarding?step=verification"
          : "/dashboard";

      return { user: existingGoogleUser, isNewUser: false, redirectUrl };
    }

    // 2. Check if user already exists with this verified email (Account Linking)
    const existingEmailUser = ServerStore.findUserByEmail(normalizedEmail);
    if (existingEmailUser) {
      // Safely link the Google ID to existing account
      existingEmailUser.googleId = googleId;
      existingEmailUser.emailVerified = true;
      existingEmailUser.authProvider = "google";
      if (avatar && (!existingEmailUser.avatar || existingEmailUser.avatar.includes("unsplash") === false)) {
        existingEmailUser.avatar = avatar;
      }

      if (existingEmailUser.role === "student") {
        store.studentProfiles.set(existingEmailUser.id, existingEmailUser as StudentProfile);
      } else if (existingEmailUser.role === "recruiter") {
        store.recruiterProfiles.set(existingEmailUser.id, existingEmailUser as RecruiterProfile);
      } else if (existingEmailUser.role === "admin") {
        store.adminProfiles.set(existingEmailUser.id, existingEmailUser as AdminProfile);
      }

      const redirectUrl =
        existingEmailUser.role === "admin"
          ? "/admin"
          : existingEmailUser.role === "recruiter"
          ? "/dashboard/recruiter"
          : (existingEmailUser as StudentProfile).verificationStatus === "not_submitted"
          ? "/onboarding?step=verification"
          : "/dashboard";

      return { user: existingEmailUser, isNewUser: false, redirectUrl };
    }

    // 3. New User Registration Flow
    // Admin Security Rule: Public users CANNOT self-select Admin role on signup
    if (role === "admin") {
      const authorizedAdmins = ["priya.menon@studenthub.io", "admin@studenthub.io", "admin@studenthub.com"];
      const isAuthorized =
        authorizedAdmins.includes(normalizedEmail) ||
        Array.from(store.adminProfiles.values()).some((a) => a.email.toLowerCase() === normalizedEmail);

      if (!isAuthorized) {
        return {
          error: "Unauthorized: This Google account is not registered as an administrator. Please contact your system administrator.",
          status: 403,
        };
      }
    }

    if (role === "recruiter") {
      const newRecruiterId = `recruiter_${Date.now()}`;
      const newRecruiter: RecruiterProfile = {
        id: newRecruiterId,
        name: name || "Recruiter",
        email: normalizedEmail,
        role: "recruiter",
        avatar: avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        title: "Talent Acquisition Specialist",
        company: company || "Partner Company",
        companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        location: "San Francisco, CA / Remote",
        bio: `Recruiting talent at ${company || "our organization"}.`,
        verificationStatus: "Pending",
        activeListingsCount: 0,
        candidatesReviewed: 0,
        googleId,
        emailVerified: true,
        authProvider: "google",
      };

      store.recruiterProfiles.set(newRecruiterId, newRecruiter);
      return { user: newRecruiter, isNewUser: true, redirectUrl: "/dashboard/recruiter" };
    }

    // Default: Student Registration
    const isUni = isUniversityEmail(normalizedEmail);
    const newStudentId = `student_${Date.now()}`;
    const newStudent: StudentProfile = {
      id: newStudentId,
      name: name || "Student Candidate",
      email: normalizedEmail,
      role: "student",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      headline: `Student @ ${university || "University"}`,
      university: university || (isUni ? normalizedEmail.split("@")[1] : "University"),
      degree: "Undergraduate Studies",
      branch: "Computer Science & Engineering",
      academicStream: "Engineering & Technology",
      specialization: "General",
      academicLevel: "Undergraduate",
      yearOfStudy: "1st Year",
      graduationYear: new Date().getFullYear() + 4,
      cgpa: "",
      location: "Campus / Remote",
      bio: "Ambitious student exploring technology and software engineering opportunities.",
      hasUniversityEmail: isUni,
      isUniversityEmail: isUni,
      personalEmail: normalizedEmail,
      accountStatus: isUni ? "profile_complete" : "account_created",
      // Non-university emails MUST go through StudentHub verification!
      verificationStatus: isUni ? "approved" : "not_submitted",
      onboardingCompleted: isUni,
      verificationRequest: null,
      status: "Open to Summer 2026 Internships",
      skills: ["Problem Solving", "Collaboration"],
      resume: null,
      projects: [],
      certifications: [],
      socialLinks: {},
      stats: {
        profileViews: 0,
        searchAppearances: 0,
        applicationsCount: 0,
        interviewsCount: 0,
      },
      googleId,
      emailVerified: true,
      authProvider: "google",
    };

    store.studentProfiles.set(newStudentId, newStudent);

    // Add initial welcome notification
    store.studentNotifications.set(newStudentId, [
      {
        id: `notif_${newStudentId}_1`,
        type: "system",
        title: "Welcome to StudentHub!",
        description: isUni
          ? "Your institutional email was automatically verified. Complete your profile to get discovered!"
          : "Your Google account is connected. Please submit your student verification to unlock full student perks.",
        timestamp: "Just now",
        isRead: false,
      },
    ]);

    const redirectUrl = isUni ? "/dashboard" : "/onboarding?step=verification";
    return { user: newStudent, isNewUser: true, redirectUrl };
  }
}

/**
 * Gets a student's connected GitHub record by userId
 */
export function getGitHubConnection(userId: string): GitHubConnectionRecord | null {
  return store.githubConnections.get(userId) || null;
}

/**
 * Checks if a GitHub account is already linked to any user
 */
export function getGitHubConnectionByGithubId(githubUserId: string): GitHubConnectionRecord | null {
  const connections = Array.from(store.githubConnections.values());
  for (const conn of connections) {
    if (String(conn.githubUserId) === String(githubUserId)) {
      return conn;
    }
  }
  return null;
}

/**
 * Saves or updates a GitHub connection for a student user
 */
export function saveGitHubConnection(
  data: Omit<GitHubConnectionRecord, "id" | "connectedAt" | "updatedAt">
): GitHubConnectionRecord {
  const existing = store.githubConnections.get(data.userId);
  const now = new Date().toISOString();

  const record: GitHubConnectionRecord = {
    id: existing?.id || `gh_conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    connectedAt: existing?.connectedAt || now,
    updatedAt: now,
  };

  store.githubConnections.set(data.userId, record);

  // Synchronize student profile GitHub social link and connection metadata
  const student = store.studentProfiles.get(data.userId);
  if (student) {
    student.socialLinks = {
      ...student.socialLinks,
      github: data.githubProfileUrl,
    };
    student.githubConnection = {
      id: record.id,
      userId: record.userId,
      githubUserId: record.githubUserId,
      githubUsername: record.githubUsername,
      githubDisplayName: record.githubDisplayName,
      githubAvatarUrl: record.githubAvatarUrl,
      githubProfileUrl: record.githubProfileUrl,
      connectedAt: record.connectedAt,
      updatedAt: record.updatedAt,
    };
  }

  return record;
}

/**
 * Disconnects a GitHub account from a student profile
 */
export function deleteGitHubConnection(userId: string): boolean {
  const deleted = store.githubConnections.delete(userId);
  store.githubRepositories.delete(userId);

  const student = store.studentProfiles.get(userId);
  if (student) {
    if (student.socialLinks) {
      delete student.socialLinks.github;
    }
    delete student.githubConnection;
  }

  return deleted;
}

/**
 * Updates the GitHub sync status and metadata for a user
 */
export function updateGitHubSyncStatus(
  userId: string,
  syncStatus: GitHubSyncStatus,
  metadata?: Partial<GitHubConnectionRecord>
): GitHubConnectionRecord | null {
  const existing = store.githubConnections.get(userId);
  if (!existing) return null;

  const updated: GitHubConnectionRecord = {
    ...existing,
    syncStatus,
    ...metadata,
    updatedAt: new Date().toISOString(),
  };

  store.githubConnections.set(userId, updated);

  const student = store.studentProfiles.get(userId);
  if (student && student.githubConnection) {
    student.githubConnection = {
      ...student.githubConnection,
      syncStatus,
      ...metadata,
      updatedAt: updated.updatedAt,
    };
  }

  return updated;
}

/**
 * Saves normalized GitHub repositories for a user
 */
export function saveGitHubRepositories(userId: string, repos: GitHubRepository[]): GitHubRepository[] {
  store.githubRepositories.set(userId, repos);
  return repos;
}

/**
 * Retrieves normalized GitHub repositories for a user
 */
export function getGitHubRepositories(userId: string): GitHubRepository[] {
  return store.githubRepositories.get(userId) || [];
}

/**
 * Saves Career DNA for a user
 */
export function saveCareerDNA(userId: string, dna: CareerDNA): CareerDNA {
  store.careerDNA.set(userId, dna);

  // Sync featured projects & top skills into student profile if student exists
  const student = store.studentProfiles.get(userId);
  if (student) {
    if (dna.featuredProjects && dna.featuredProjects.length > 0) {
      // Merge unique projects without duplicate IDs
      const existingIds = new Set(student.projects.map((p: any) => p.id));
      const newProjects = dna.featuredProjects.filter((p: any) => !existingIds.has(p.id));
      student.projects = [...student.projects, ...newProjects];
    }

    if (dna.topSkills && dna.topSkills.length > 0) {
      const existingSkillsSet = new Set(student.skills.map((s: string) => s.toLowerCase()));
      const newSkillNames = dna.topSkills
        .map((s: { name: string }) => s.name)
        .filter((name: string) => !existingSkillsSet.has(name.toLowerCase()));
      student.skills = [...student.skills, ...newSkillNames];
    }
  }

  return dna;
}

/**
 * Retrieves Career DNA for a user
 */
export function getCareerDNA(userId: string): CareerDNA | null {
  return store.careerDNA.get(userId) || null;
}

/**
 * Saves or updates a ResumeRecord for a user
 */
export function saveResumeRecord(userId: string, record: ResumeRecord): ResumeRecord {
  const existingList = store.resumes.get(userId) || [];
  const existingIndex = existingList.findIndex((r) => r.id === record.id);

  let updatedList: ResumeRecord[];
  if (existingIndex >= 0) {
    updatedList = [...existingList];
    updatedList[existingIndex] = record;
  } else {
    updatedList = [record, ...existingList];
  }

  store.resumes.set(userId, updatedList);

  // Sync resume metadata to student profile if record is active
  if (record.isActive) {
    const student = store.studentProfiles.get(userId);
    if (student) {
      student.resume = {
        fileName: record.fileName,
        fileSize: record.fileSize,
        uploadedAt: record.uploadedAt,
        url: "#",
      };
    }
  }

  return record;
}

/**
 * Retrieves the current active ResumeRecord for a user
 */
export function getActiveResumeRecord(userId: string): ResumeRecord | null {
  const list = store.resumes.get(userId) || [];
  return list.find((r) => r.isActive && r.status !== "SUPERSEDED") || null;
}

/**
 * Retrieves full resume history for a user
 */
export function getResumeHistory(userId: string): ResumeRecord[] {
  return store.resumes.get(userId) || [];
}

/**
 * Retrieves a specific resume record by ID
 */
export function getResumeById(userId: string, resumeId: string): ResumeRecord | null {
  const list = store.resumes.get(userId) || [];
  return list.find((r) => r.id === resumeId) || null;
}

/**
 * Marks all previous active resumes for a user as SUPERSEDED (except exceptId if provided)
 */
export function deactivatePreviousResumes(userId: string, exceptId?: string): void {
  const list = store.resumes.get(userId) || [];
  const now = new Date().toISOString();

  const updated = list.map((r) => {
    if (r.id !== exceptId && r.isActive) {
      return {
        ...r,
        isActive: false,
        status: "SUPERSEDED" as const,
        supersededAt: now,
      };
    }
    return r;
  });

  store.resumes.set(userId, updated);
}

/**
 * Saves CodeforcesConnection for a user
 */
export function saveCodeforcesConnection(userId: string, conn: CodeforcesConnection): CodeforcesConnection {
  store.codeforcesConnections.set(userId, conn);

  // Sync to student profile socialLinks
  const student = store.studentProfiles.get(userId);
  if (student) {
    if (!student.socialLinks) {
      student.socialLinks = {};
    }
    student.socialLinks.codeforces = `https://codeforces.com/profile/${conn.handle}`;
  }

  persistStoreToDisk();
  return conn;
}

/**
 * Retrieves CodeforcesConnection for a user
 */
export function getCodeforcesConnection(userId: string): CodeforcesConnection | null {
  return store.codeforcesConnections.get(userId) || null;
}

/**
 * Deletes CodeforcesConnection for a user
 */
export function deleteCodeforcesConnection(userId: string): boolean {
  store.codeforcesDNA.delete(userId);
  const result = store.codeforcesConnections.delete(userId);
  persistStoreToDisk();
  return result;
}

/**
 * Saves CodeforcesDNA for a user
 */
export function saveCodeforcesDNA(userId: string, dna: CodeforcesDNA): CodeforcesDNA {
  store.codeforcesDNA.set(userId, dna);
  persistStoreToDisk();
  return dna;
}

/**
 * Retrieves CodeforcesDNA for a user
 */
export function getCodeforcesDNA(userId: string): CodeforcesDNA | null {
  return store.codeforcesDNA.get(userId) || null;
}

// --------------------------------------------------
// LEETCODE INTELLIGENCE STORAGE HELPERS
// --------------------------------------------------

/**
 * Saves LeetCodeConnection for a user
 */
export function saveLeetCodeConnection(userId: string, conn: LeetCodeConnection): LeetCodeConnection {
  store.leetcodeConnections.set(userId, conn);

  // Sync to student profile socialLinks
  const student = store.studentProfiles.get(userId);
  if (student) {
    if (!student.socialLinks) {
      student.socialLinks = {};
    }
    student.socialLinks.leetcode = `https://leetcode.com/${conn.leetcodeId}`;
  }

  persistStoreToDisk();
  return conn;
}

/**
 * Retrieves LeetCodeConnection for a user
 */
export function getLeetCodeConnection(userId: string): LeetCodeConnection | null {
  return store.leetcodeConnections.get(userId) || null;
}

/**
 * Deletes LeetCodeConnection for a user
 */
export function deleteLeetCodeConnection(userId: string): boolean {
  store.leetcodeDNA.delete(userId);
  const result = store.leetcodeConnections.delete(userId);

  // Clean up social link
  const student = store.studentProfiles.get(userId);
  if (student?.socialLinks?.leetcode) {
    delete student.socialLinks.leetcode;
  }

  persistStoreToDisk();
  return result;
}

/**
 * Saves LeetCodeDNA for a user
 */
export function saveLeetCodeDNA(userId: string, dna: LeetCodeDNA): LeetCodeDNA {
  store.leetcodeDNA.set(userId, dna);
  persistStoreToDisk();
  return dna;
}

/**
 * Retrieves LeetCodeDNA for a user
 */
export function getLeetCodeDNA(userId: string): LeetCodeDNA | null {
  return store.leetcodeDNA.get(userId) || null;
}

// --------------------------------------------------
// CERTIFICATE INTELLIGENCE STORAGE HELPERS
// --------------------------------------------------

/**
 * Saves or updates a CertificateRecord for a user
 */
export function saveCertificate(userId: string, certificate: CertificateRecord): CertificateRecord {
  const existing = store.certificates.get(userId) || [];
  const index = existing.findIndex((c) => c.id === certificate.id);

  if (index >= 0) {
    existing[index] = certificate;
  } else {
    existing.unshift(certificate);
  }

  store.certificates.set(userId, existing);
  persistStoreToDisk();
  return certificate;
}

/**
 * Retrieves all CertificateRecords for a user
 */
export function getCertificates(userId: string): CertificateRecord[] {
  return store.certificates.get(userId) || [];
}

/**
 * Retrieves a specific CertificateRecord by ID
 */
export function getCertificateById(userId: string, id: string): CertificateRecord | null {
  const list = store.certificates.get(userId) || [];
  return list.find((c) => c.id === id) || null;
}

/**
 * Deletes a CertificateRecord by ID
 */
export function deleteCertificate(userId: string, id: string): boolean {
  const list = store.certificates.get(userId) || [];
  const updated = list.filter((c) => c.id !== id);
  store.certificates.set(userId, updated);
  persistStoreToDisk();
  return list.length !== updated.length;
}

/**
 * Saves CertificateDNA for a user
 */
export function saveCertificateDNA(userId: string, dna: CertificateDNA): CertificateDNA {
  store.certificateDNA.set(userId, dna);
  persistStoreToDisk();
  return dna;
}

/**
 * Retrieves CertificateDNA for a user
 */
export function getCertificateDNA(userId: string): CertificateDNA | null {
  return store.certificateDNA.get(userId) || null;
}

/**
 * Retrieves StudentProfile for a user
 */
export function getStudentProfile(userId: string): StudentProfile | null {
  return store.studentProfiles.get(userId) || null;
}

// --------------------------------------------------
// HUGGING FACE INTELLIGENCE STORAGE HELPERS
// --------------------------------------------------

/**
 * Saves or updates a HuggingFaceConnectionRecord for a user
 */
export function saveHuggingFaceConnection(
  connection: HuggingFaceConnectionRecord
): HuggingFaceConnectionRecord {
  store.huggingfaceConnections.set(connection.userId, connection);
  persistStoreToDisk();
  return connection;
}

/**
 * Retrieves a HuggingFaceConnectionRecord for a user
 */
export function getHuggingFaceConnection(
  userId: string
): HuggingFaceConnectionRecord | null {
  return store.huggingfaceConnections.get(userId) || null;
}

/**
 * Deletes a HuggingFaceConnectionRecord and associated HuggingFaceDNA for a user
 */
export function deleteHuggingFaceConnection(userId: string): boolean {
  const existed = store.huggingfaceConnections.delete(userId);
  store.huggingfaceDNA.delete(userId);
  persistStoreToDisk();
  return existed;
}

/**
 * Saves HuggingFaceDNA for a user
 */
export function saveHuggingFaceDNA(
  userId: string,
  dna: HuggingFaceDNA
): HuggingFaceDNA {
  store.huggingfaceDNA.set(userId, dna);
  persistStoreToDisk();
  return dna;
}

/**
 * Retrieves HuggingFaceDNA for a user
 */
export function getHuggingFaceDNA(userId: string): HuggingFaceDNA | null {
  return store.huggingfaceDNA.get(userId) || null;
}


