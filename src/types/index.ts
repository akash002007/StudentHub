export type UserRole = 'student' | 'recruiter';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: 'student';
  avatar: string;
  headline: string;
  university: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: string;
  location: string;
  bio: string;
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
  };
  stats: {
    profileViews: number;
    searchAppearances: number;
    applicationsCount: number;
    interviewsCount: number;
  };
}

export interface RecruiterProfile {
  id: string;
  name: string;
  email: string;
  role: 'recruiter';
  avatar: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  bio: string;
  activeListingsCount: number;
  candidatesReviewed: number;
}

export type User = StudentProfile | RecruiterProfile;

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  type: 'Personal' | 'Hackathon' | 'Capstone' | 'Open Source';
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
  category: 'AI & ML' | 'Web Development' | 'DSA & Prep' | 'Startups' | 'UI/UX Design' | 'Career Growth';
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
  degreeRequirements: string;
  branchRequirements: string;
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

