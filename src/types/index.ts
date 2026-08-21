export type UserRole = 'student' | 'recruiter' | 'admin';

export type AcademicStream =
  | 'Engineering & Technology'
  | 'Management & Business'
  | 'Sciences & Mathematics'
  | 'Healthcare & Medicine'
  | 'Pharmacy'
  | 'Law & Legal Studies'
  | 'Design & Architecture'
  | 'Commerce & Finance'
  | 'Humanities & Social Sciences'
  | 'Arts & Humanities'
  | 'Media & Communication'
  | 'Education'
  | 'Hospitality & Tourism'
  | 'Agriculture & Life Sciences'
  | 'Other';

export type AcademicLevel =
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Doctorate'
  | 'Diploma'
  | 'Certificate'
  | 'Other';

export type AccountStatus =
  | 'account_created'
  | 'profile_incomplete'
  | 'profile_complete'
  | 'onboarding_complete';

export type VerificationType = 'university_email' | 'payment_receipt' | 'student_id_card';

export type VerificationStatus =
  | 'not_submitted'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_information';

export interface VerificationAttempt {
  attemptNumber: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_information';
  documentName?: string;
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
}

export interface StudentVerificationRequest {
  id: string;
  verificationId?: string;
  studentId: string;
  studentName: string;
  university: string;
  universityEmail: string;
  verificationType: VerificationType;
  status: VerificationStatus | VerificationQueueStatus;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  personalEmail?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  rejectionReason?: string;
  adminNotes?: string;
  requiredInformation?: string[];
  attempts?: VerificationAttempt[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: 'student';
  avatar: string;
  googleId?: string;
  emailVerified?: boolean;
  authProvider?: 'credentials' | 'google';
  headline: string;
  university: string;
  degree: string;
  branch: string; // Preserved for backward compatibility
  academicStream?: AcademicStream | string;
  specialization?: string;
  academicLevel?: AcademicLevel;
  yearOfStudy?: string;
  graduationYear: number;
  cgpa: string;
  location: string;
  bio: string;
  phone?: string;
  hasUniversityEmail?: boolean;
  isUniversityEmail?: boolean;
  personalEmail?: string;
  accountStatus?: AccountStatus;
  verificationStatus?: VerificationStatus;
  onboardingCompleted?: boolean;
  verificationRequest?: StudentVerificationRequest | null;
  status: 'Open to Summer 2026 Internships' | 'Looking for Part-time' | 'Actively Interviewing' | 'Not Looking';
  skills: string[];
  resume: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    url?: string;
  } | null;
  projects: Project[];
  certifications: Certification[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    leetcode?: string;
    portfolio?: string;
    twitter?: string;
    behance?: string;
    researchgate?: string;
    ssrn?: string;
  };
  stats: {
    profileViews: number;
    searchAppearances: number;
    applicationsCount: number;
    interviewsCount: number;
  };
}

export type RecruiterVerificationStatus =
  | 'Pending'
  | 'Email Verified'
  | 'Company Verified'
  | 'Recruiter Verified'
  | 'Verification Failed'
  | 'Suspended';

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'recruiter';
  avatar: string;
  googleId?: string;
  emailVerified?: boolean;
  authProvider?: 'credentials' | 'google';
  title: string;
  department?: string;
  company: string;
  companyLogo: string;
  companyWebsite?: string;
  companyLocation?: string;
  companySize?: string;
  companyType?: string;
  recruiterRole?: string;
  recruiterUsage?: string[];
  location: string;
  bio: string;
  verificationStatus?: RecruiterVerificationStatus;
  activeListingsCount: number;
  candidatesReviewed: number;
  interviewsConducted?: number;
}

export type ProjectType =
  | 'Personal'
  | 'Hackathon'
  | 'Capstone'
  | 'Open Source'
  | 'Business Project'
  | 'Research Project'
  | 'Healthcare Project'
  | 'Clinical Experience'
  | 'Design Project'
  | 'Marketing Project'
  | 'Case Study'
  | 'Academic Project'
  | 'Creative Work'
  | 'Leadership'
  | 'Volunteer Work'
  | 'Other';

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  tools?: string[];
  githubUrl?: string;
  liveUrl?: string;
  documentUrl?: string;
  date: string;
  type: ProjectType;
  featured?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  icon?: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite';
  stipend: string;
  duration: string;
  deadline: string;
  postedDate: string;
  department: string;
  requiredSkills: string[];
  matchPercentage: number;
  matchReasons: {
    matchingSkills: string[];
    academicMatch: string;
    projectSynergy: string;
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  applicantsCount: number;
  featured?: boolean;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected';

export interface Application {
  id: string;
  internshipId: string;
  company: string;
  companyLogo: string;
  role: string;
  appliedDate: string;
  status: ApplicationStatus;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite';
  stipend: string;
  nextStep?: string;
  interviewDate?: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    companyOrCollege: string;
    isOnline: boolean;
    type: 'peer' | 'recruiter' | 'mentor';
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isUnread: boolean;
  };
  messages: Message[];
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    headline: string;
  };
  title: string;
  content: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
  commentCount: number;
  tags: string[];
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  category:
    | 'AI & ML'
    | 'Web Development'
    | 'DSA & Prep'
    | 'Startups'
    | 'UI/UX Design'
    | 'Career Growth'
    | 'Business & Finance'
    | 'Bio & Healthcare'
    | 'Law & Policy'
    | 'Research & Sciences'
    | string;
  description: string;
  icon: string;
  bannerColor: string;
  membersCount: number;
  activeDiscussions: number;
  isJoined: boolean;
  featuredPost?: string;
  posts: CommunityPost[];
}

export interface NotificationItem {
  id: string;
  type: 'application' | 'internship' | 'message' | 'community' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  iconType?: string;
}

export interface ConnectedAccount {
  id: string;
  platform: 'github' | 'leetcode' | 'linkedin' | 'portfolio' | 'codeforces' | 'kaggle';
  name: string;
  description: string;
  icon: string;
  status: 'coming_soon' | 'connected' | 'not_connected';
  username?: string;
  metric?: string;
}

export type RecruiterInternshipStatus = 'Active' | 'Paused' | 'Closed';

export interface RecruiterInternship {
  id: string;
  title: string;
  department: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite';
  internshipType: string;
  stipend: string;
  duration: string;
  deadline: string;
  postedDate: string;
  status: RecruiterInternshipStatus;
  applicationsCount: number;
  shortlistedCount: number;
  viewsCount: number;
  openingsCount: number;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  degreeRequirements: string | string[];
  branchRequirements: string | string[];
  degreeLevels?: string[];
  eligibleBranches?: string[];
  minCgpa: string;
  gradYearRequirements: number[];
  experienceRequirements?: string;
}

export interface RecruiterApplicant {
  id: string;
  internshipId: string;
  internshipTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  university: string;
  degree: string;
  branch: string;
  academicStream?: AcademicStream | string;
  specialization?: string;
  graduationYear: number;
  cgpa: string;
  location: string;
  skills: string[];
  appliedDate: string;
  status: ApplicationStatus;
  matchScore: number;
  resumeUrl: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  behanceUrl?: string;
  researchGateUrl?: string;
  ssrnUrl?: string;
  bio: string;
  projects: Project[];
  certifications: Certification[];
  notes?: string;
}

export interface RecruiterStudentCandidate {
  id: string;
  name: string;
  avatar: string;
  university: string;
  degree: string;
  branch: string;
  academicStream?: AcademicStream | string;
  specialization?: string;
  graduationYear: number;
  cgpa: string;
  location: string;
  skills: string[];
  profileCompletion: number;
  status: string;
  bio: string;
  isShortlisted: boolean;
  projects: Project[];
  certifications: Certification[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  behanceUrl?: string;
  researchGateUrl?: string;
  ssrnUrl?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  bannerImage?: string;
  industry: string;
  website: string;
  location: string;
  companySize: string;
  foundedYear: number;
  tagline: string;
  description: string;
  about: string;
  perks: string[];
  techStack: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface RecruiterNotificationItem {
  id: string;
  type: 'application' | 'interview' | 'internship' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export type InterviewType =
  | 'Phone'
  | 'Video'
  | 'Technical'
  | 'HR'
  | 'Managerial'
  | 'Final';

export type InterviewStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled';

export interface RecruiterInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  candidateUniversity: string;
  candidateRole: string;
  candidateEmail?: string;
  internshipId?: string;
  internshipTitle: string;
  type: InterviewType;
  status: InterviewStatus;
  date: string;
  time: string;
  duration: string;
  interviewerName: string;
  meetingLink: string;
  location?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatar: string;
  googleId?: string;
  emailVerified?: boolean;
  authProvider?: 'credentials' | 'google';
  title: string;
  team: string;
}

export type VerificationQueueStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Information';

export type VerificationMethod =
  | 'College Email'
  | 'Google'
  | 'Payment Receipt'
  | 'Manual Review';

export type VerificationRiskLevel = 'Low' | 'Medium' | 'High';

export type VerificationPriority = 'Normal' | 'High Priority' | 'Review Required';

export type VerificationCheckState = 'Pending' | 'Verified' | 'Failed';

export interface VerificationChecklistItem {
  id: string;
  label: string;
  state: VerificationCheckState;
}

export interface VerificationAcademicField {
  label: string;
  value: string;
  verified: boolean;
}

export interface VerificationDocumentSummary {
  fileName: string;
  uploadDate: string;
  fileSize: string;
  documentType: string;
  studentNameDetected?: string;
  collegeNameDetected?: string;
  paymentDate?: string;
  receiptNumber?: string;
  fileUrl: string;
}

export interface DuplicateAccountCandidate {
  id: string;
  name: string;
  email: string;
  degree: string;
  college: string;
  studentId: string;
  phone: string;
  graduationYear: string;
}

export interface VerificationTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  actor: string;
  description?: string;
}

export interface VerificationRequest {
  verificationId: string;
  studentId: string;
  status: VerificationQueueStatus;
  verificationMethod: VerificationMethod;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  riskLevel: VerificationRiskLevel;
  priority: VerificationPriority;
  rejectionReason?: string;
  adminNotes?: string;
  student: {
    avatar: string;
    fullName: string;
    email: string;
    phone: string;
    college: string;
    degree: string;
    branch: string;
    year: string;
    semester: string;
    graduationYear: string;
    studentId: string;
    collegeEmail: string;
    accountCreatedAt: string;
  };
  academicFields: VerificationAcademicField[];
  verificationResult: string;
  checklist: VerificationChecklistItem[];
  document?: VerificationDocumentSummary;
  duplicateCandidates: DuplicateAccountCandidate[];
  timeline: VerificationTimelineEvent[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  student: string;
  previousStatus: string;
  newStatus: string;
  ipSessionRef: string;
  details: string;
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type:
    | 'verification_request'
    | 'document_uploaded'
    | 'resubmission'
    | 'risk_alert'
    | 'recruiter_request'
    | 'system';
}

export interface AdminOverviewMetrics {
  totalStudents: number;
  pendingVerification: number;
  verifiedStudents: number;
  rejectedApplications: number;
  verificationRate: number;
  avgVerificationTimeHours: number;
  newRegistrationsToday: number;
  newRegistrationsWeek: number;
  awaitingInformation: number;
  suspiciousAttempts: number;
}

export interface AdminStudentRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  year: string;
  verificationStatus: VerificationQueueStatus;
  profileCompletion: number;
  lastActive: string;
  joined: string;
}

export type User = StudentProfile | RecruiterProfile | AdminProfile;

