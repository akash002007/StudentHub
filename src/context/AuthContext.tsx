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
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
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
      graduationYear: new Date().getFullYear() + 3,
      cgpa: "",
      location: "Campus / Remote",
      bio: "",
      phone: "",
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
      verificationStatus: "not_submitted",
      onboardingCompleted: false,
      verificationRequest: null,
    };

    setUser(newStudent);
    setRole("student");
    persistSession(newStudent, "student");
    return newStudent;
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
      accountStatus: "onboarding_complete",
      verificationStatus: "pending",
      onboardingCompleted: true,
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
      accountStatus: "profile_complete",
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
        logout,
        switchRole,
        updateStudentProfile,
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

