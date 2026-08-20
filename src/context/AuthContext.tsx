"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  UserRole,
  StudentProfile,
  RecruiterProfile,
  VerificationType,
  VerificationStatus,
  StudentVerificationRequest,
} from "@/types";
import { defaultStudentUser, defaultRecruiterUser } from "@/data/mock-users";
import { isUniversityEmail } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  registerStudent: (basicData: {
    name: string;
    email: string;
    university: string;
    password?: string;
  }) => StudentProfile;
  registerRecruiter: (data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    companyName: string;
    companyWebsite?: string;
    companyLocation?: string;
    companySize?: string;
    companyType?: string;
    jobTitle?: string;
    department?: string;
    recruiterRole?: string;
    recruiterUsage?: string[];
  }) => RecruiterProfile;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  updateRecruiterProfile: (updates: Partial<RecruiterProfile>) => void;
  submitStudentVerification: (data: {
    verificationType: VerificationType;
    documentName: string;
    documentSize: string;
    documentUrl: string;
    personalEmail?: string;
  }) => StudentVerificationRequest;
  reviewVerification: (status: "approved" | "rejected", rejectionReason?: string) => void;
  resetVerificationForResubmission: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "studenthub_auth_user_v1";
const ROLE_STORAGE_KEY = "studenthub_auth_role_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
      const storedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUserJson) {
        const parsedUser = JSON.parse(storedUserJson);
        setUser(parsedUser);
        setRole(storedRole || parsedUser.role || "student");
      }
    } catch {
      console.warn("Failed to load auth session from localStorage");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when user/role changes
  const persistSession = (newUser: User | null, newRole: UserRole) => {
    try {
      if (newUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.setItem(ROLE_STORAGE_KEY, newRole);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
    } catch {
      console.warn("Failed to save auth session to localStorage");
    }
  };

  const login = (email: string, selectedRole: UserRole, customName?: string) => {
    let authenticatedUser: User;

    if (selectedRole === "recruiter") {
      authenticatedUser = {
        ...defaultRecruiterUser,
        email: email || defaultRecruiterUser.email,
        name: customName || defaultRecruiterUser.name,
      };
    } else {
      authenticatedUser = {
        ...defaultStudentUser,
        email: email || defaultStudentUser.email,
        name: customName || defaultStudentUser.name,
      };
    }

    setUser(authenticatedUser);
    setRole(selectedRole);
    persistSession(authenticatedUser, selectedRole);
  };

  const registerStudent = (basicData: {
    name: string;
    email: string;
    university: string;
    password?: string;
  }): StudentProfile => {
    const isUni = isUniversityEmail(basicData.email);

    const newStudent: StudentProfile = {
      id: `student_${Date.now()}`,
      name: basicData.name.trim(),
      email: basicData.email.trim(),
      role: "student",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      headline: `Student @ ${basicData.university.trim() || "University"}`,
      university: basicData.university.trim(),
      degree: "",
      branch: "",
      academicStream: "Engineering & Technology",
      specialization: "",
      academicLevel: "Undergraduate",
      yearOfStudy: "1st Year",
      graduationYear: new Date().getFullYear() + 4,
      cgpa: "",
      location: "Campus / Remote",
      bio: "",
      phone: "",
      hasUniversityEmail: isUni,
      isUniversityEmail: isUni,
      personalEmail: "",
      status: "Looking for Part-time",
      skills: [],
      resume: null,
      projects: [],
      certifications: [],
      socialLinks: {},
      stats: {
        profileViews: 1,
        searchAppearances: 0,
        applicationsCount: 0,
        interviewsCount: 0,
      },
      accountStatus: "account_created",
      verificationStatus: isUni ? "approved" : "not_submitted",
      onboardingCompleted: false,
      verificationRequest: isUni
        ? {
            id: `req_uni_${Date.now()}`,
            studentId: `student_${Date.now()}`,
            studentName: basicData.name.trim(),
            university: basicData.university.trim(),
            universityEmail: basicData.email.trim(),
            verificationType: "university_email",
            status: "approved",
            documentName: "Institutional Email Verification",
            documentSize: "Verified Domain",
            documentUrl: "#",
            submittedAt: new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            reviewedAt: new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            reviewerName: "Institutional Domain Verification System",
          }
        : null,
    };

    setUser(newStudent);
    setRole("student");
    persistSession(newStudent, "student");
    return newStudent;
  };

  const registerRecruiter = (data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    companyName: string;
    companyWebsite?: string;
    companyLocation?: string;
    companySize?: string;
    companyType?: string;
    jobTitle?: string;
    department?: string;
    recruiterRole?: string;
    recruiterUsage?: string[];
  }): RecruiterProfile => {
    const newRecruiter: RecruiterProfile = {
      id: `recruiter_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || "",
      role: "recruiter",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      title: data.jobTitle?.trim() || "University Talent Partner",
      department: data.department?.trim() || "University Talent & Early Career",
      company: data.companyName.trim() || "Technology Partner",
      companyLogo:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80",
      companyWebsite: data.companyWebsite?.trim() || "",
      companyLocation: data.companyLocation?.trim() || "San Francisco, CA",
      companySize: data.companySize || "500 - 1,000 employees",
      companyType: data.companyType || "Technology & Software",
      recruiterRole: data.recruiterRole || "Talent Acquisition",
      recruiterUsage: data.recruiterUsage || ["Hire interns", "Discover student talent"],
      location: data.companyLocation?.trim() || "San Francisco, CA",
      bio: `Hiring ambitious college students and university talent at ${data.companyName.trim() || "our company"}.`,
      verificationStatus: "Recruiter Verified",
      activeListingsCount: 0,
      candidatesReviewed: 0,
      interviewsConducted: 0,
    };

    setUser(newRecruiter);
    setRole("recruiter");
    persistSession(newRecruiter, "recruiter");
    return newRecruiter;
  };

  const updateRecruiterProfile = (updates: Partial<RecruiterProfile>) => {
    if (!user || user.role !== "recruiter") return;
    const updated = { ...user, ...updates } as RecruiterProfile;
    setUser(updated);
    persistSession(updated, "recruiter");
  };

  const logout = () => {
    setUser(null);
    setRole("student");
    persistSession(null, "student");
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "recruiter") {
      setUser(defaultRecruiterUser);
      persistSession(defaultRecruiterUser, newRole);
    } else {
      setUser(defaultStudentUser);
      persistSession(defaultStudentUser, newRole);
    }
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    if (!user || user.role !== "student") return;
    const updated = { ...user, ...updates } as StudentProfile;
    setUser(updated);
    persistSession(updated, "student");
  };

  const submitStudentVerification = (data: {
    verificationType: VerificationType;
    documentName: string;
    documentSize: string;
    documentUrl: string;
    personalEmail?: string;
  }): StudentVerificationRequest => {
    const student = user as StudentProfile;
    const newRequest: StudentVerificationRequest = {
      id: `req_${Date.now()}`,
      studentId: student?.id || `student_${Date.now()}`,
      studentName: student?.name || "Student",
      university: student?.university || "University",
      universityEmail: student?.email || "",
      verificationType: data.verificationType,
      status: "pending",
      documentName: data.documentName,
      documentSize: data.documentSize,
      documentUrl: data.documentUrl,
      personalEmail: data.personalEmail || student?.personalEmail,
      submittedAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedProfile: StudentProfile = {
      ...student,
      verificationStatus: "pending",
      personalEmail: data.personalEmail || student?.personalEmail,
      verificationRequest: newRequest,
    };

    setUser(updatedProfile);
    persistSession(updatedProfile, "student");
    return newRequest;
  };

  const reviewVerification = (status: "approved" | "rejected", rejectionReason?: string) => {
    if (!user || user.role !== "student") return;
    const student = user as StudentProfile;
    const currentReq = student.verificationRequest;

    const updatedReq: StudentVerificationRequest | null = currentReq
      ? {
          ...currentReq,
          status,
          reviewedAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          reviewerName: "StudentHub Administration Team",
          rejectionReason:
            status === "rejected"
              ? rejectionReason || "The uploaded document is unreadable, expired, or invalid. Please upload a clear valid copy."
              : undefined,
        }
      : null;

    const updatedProfile: StudentProfile = {
      ...student,
      verificationStatus: status,
      verificationRequest: updatedReq,
    };

    setUser(updatedProfile);
    persistSession(updatedProfile, "student");
  };

  const resetVerificationForResubmission = () => {
    if (!user || user.role !== "student") return;
    const student = user as StudentProfile;

    const updatedProfile: StudentProfile = {
      ...student,
      verificationStatus: "not_submitted",
      verificationRequest: null,
    };

    setUser(updatedProfile);
    persistSession(updatedProfile, "student");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoaded,
        login,
        registerStudent,
        registerRecruiter,
        logout,
        switchRole,
        updateStudentProfile,
        updateRecruiterProfile,
        submitStudentVerification,
        reviewVerification,
        resetVerificationForResubmission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

