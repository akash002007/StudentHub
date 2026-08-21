"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  UserRole,
  StudentProfile,
  RecruiterProfile,
  VerificationType,
  VerificationStatus,
  StudentVerificationRequest,
  AdminProfile,
} from "@/types";
import { defaultStudentUser, defaultRecruiterUser, defaultAdminUser } from "@/data/mock-users";
import { isUniversityEmail } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  loginWithGoogle: (
    credential: string,
    role?: UserRole,
    metadata?: { university?: string; company?: string }
  ) => Promise<{
    success: boolean;
    user?: User;
    token?: string;
    refreshToken?: string;
    isNewUser?: boolean;
    redirectUrl?: string;
    error?: string;
  }>;
  registerStudent: (basicData: {
    name: string;
    email: string;
    university: string;
    password?: string;
  }) => Promise<StudentProfile>;
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
    college?: string;
    degree?: string;
    branch?: string;
    year?: string;
    studentIdNumber?: string;
    graduationYear?: string;
  }) => Promise<StudentVerificationRequest>;
  resubmitStudentVerification: (data: {
    documentName: string;
    documentSize: string;
    documentUrl: string;
    personalEmail?: string;
    notes?: string;
  }) => Promise<void>;
  reviewVerification: (status: "approved" | "rejected", rejectionReason?: string) => Promise<void>;
  resetVerificationForResubmission: () => void;
  refreshUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "studenthub_auth_user_v1";
const ROLE_STORAGE_KEY = "studenthub_auth_role_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to persist session
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

  const refreshUserSession = useCallback(async () => {
    if (!user || user.role !== "student") return;
    try {
      const res = await fetch(`/api/student/verification?studentId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setUser((prev) => {
            if (!prev) return null;
            const updated = {
              ...prev,
              ...data.student,
              verificationStatus: data.student.verificationStatus || data.verificationStatus,
              verificationRequest: data.request
                ? {
                    id: data.request.verificationId,
                    verificationId: data.request.verificationId,
                    studentId: data.request.studentId,
                    studentName: data.request.student.fullName,
                    university: data.request.student.college,
                    universityEmail: data.request.student.collegeEmail,
                    verificationType: data.request.verificationMethod === "College Email" ? "university_email" : data.request.verificationMethod === "Payment Receipt" ? "payment_receipt" : "student_id_card",
                    status: data.request.status === "Approved" ? "approved" : data.request.status === "Rejected" ? "rejected" : data.request.status === "Needs Information" ? "needs_information" : "pending",
                    documentName: data.request.document?.fileName || "Document.pdf",
                    documentSize: data.request.document?.fileSize || "1.5 MB",
                    documentUrl: data.request.document?.fileUrl || "#",
                    personalEmail: data.request.student.email,
                    submittedAt: data.request.submittedAt,
                    reviewedAt: data.request.reviewedAt,
                    reviewerName: data.request.reviewedBy,
                    rejectionReason: data.request.rejectionReason,
                    adminNotes: data.request.adminNotes,
                  }
                : (prev as StudentProfile).verificationRequest,
            } as StudentProfile;
            persistSession(updated, "student");
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn("Session refresh error:", err);
    }
  }, [user]);

  // Initialize from localStorage on mount & sync with server
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
      const storedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUserJson) {
        const parsedUser = JSON.parse(storedUserJson);
        setUser(parsedUser);
        const resolvedRole = storedRole || parsedUser.role || "student";
        setRole(resolvedRole);

        // If student, sync latest from backend
        if (resolvedRole === "student" && parsedUser.id) {
          fetch(`/api/student/verification?studentId=${encodeURIComponent(parsedUser.id)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.student) {
                const synched: StudentProfile = {
                  ...parsedUser,
                  ...d.student,
                  verificationStatus: d.student.verificationStatus || d.verificationStatus,
                };
                setUser(synched);
                persistSession(synched, "student");
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      console.warn("Failed to load auth session from localStorage");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (email: string, selectedRole: UserRole, customName?: string) => {
    let authenticatedUser: User;

    if (selectedRole === "recruiter") {
      authenticatedUser = {
        ...defaultRecruiterUser,
        email: email || defaultRecruiterUser.email,
        name: customName || defaultRecruiterUser.name,
      };
    } else if (selectedRole === "admin") {
      authenticatedUser = {
        ...defaultAdminUser,
        email: email || defaultAdminUser.email,
        name: customName || defaultAdminUser.name,
      } as AdminProfile;
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

    // Sync if student
    if (selectedRole === "student") {
      fetch(`/api/student/verification?studentId=${encodeURIComponent(authenticatedUser.id)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.student) {
            const synched: StudentProfile = {
              ...(authenticatedUser as StudentProfile),
              ...d.student,
              verificationStatus: d.student.verificationStatus || d.verificationStatus,
            };
            setUser(synched);
            persistSession(synched, "student");
          }
        })
        .catch(() => {});
    }
  };

  const loginWithGoogle = async (
    credential: string,
    targetRole: UserRole = "student",
    metadata?: { university?: string; company?: string }
  ) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential,
          role: targetRole,
          university: metadata?.university,
          company: metadata?.company,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setRole(data.user.role);
        persistSession(data.user, data.user.role);

        try {
          if (data.token) {
            localStorage.setItem("studenthub_access_token", data.token);
          }
          if (data.refreshToken) {
            localStorage.setItem("studenthub_refresh_token", data.refreshToken);
          }
        } catch {
          console.warn("Could not save auth tokens to localStorage");
        }

        return {
          success: true,
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
          isNewUser: data.isNewUser,
          redirectUrl: data.redirectUrl,
        };
      } else {
        return {
          success: false,
          error: data.error || "Google authentication failed",
        };
      }
    } catch {
      return {
        success: false,
        error: "Network error during Google authentication. Please try again.",
      };
    }
  };

  const registerStudent = async (basicData: {
    name: string;
    email: string;
    university: string;
    password?: string;
  }): Promise<StudentProfile> => {
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

    // Auto submit to backend if uni email
    if (isUni) {
      try {
        await fetch("/api/student/verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: newStudent.id,
            studentName: newStudent.name,
            email: newStudent.email,
            college: newStudent.university,
            degree: "Undergraduate",
            branch: "General",
            year: "1st Year",
            studentIdNumber: "AUTO-EDU-VERIFIED",
            graduationYear: newStudent.graduationYear,
            verificationType: "university_email",
            documentName: "Institutional Domain Check",
            documentSize: "Domain Verified",
            documentUrl: "#",
          }),
        });
      } catch (err) {
        console.warn("Failed to post uni verification to backend:", err);
      }
    }

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
    try {
      localStorage.removeItem("studenthub_access_token");
      localStorage.removeItem("studenthub_refresh_token");
    } catch {
      // ignore
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "recruiter") {
      setUser(defaultRecruiterUser);
      persistSession(defaultRecruiterUser, newRole);
    } else if (newRole === "admin") {
      setUser(defaultAdminUser);
      persistSession(defaultAdminUser, newRole);
    } else {
      setUser(defaultStudentUser);
      persistSession(defaultStudentUser, newRole);
      // Fetch latest student verification state from server store
      fetch(`/api/student/verification?studentId=${encodeURIComponent(defaultStudentUser.id)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.student) {
            const synched = { ...defaultStudentUser, ...d.student };
            setUser(synched);
            persistSession(synched, "student");
          }
        })
        .catch(() => {});
    }
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    if (!user || user.role !== "student") return;
    const updated = { ...user, ...updates } as StudentProfile;
    setUser(updated);
    persistSession(updated, "student");

    // Push to server API in background
    fetch(`/api/admin/students/${encodeURIComponent(updated.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const submitStudentVerification = async (data: {
    verificationType: VerificationType;
    documentName: string;
    documentSize: string;
    documentUrl: string;
    personalEmail?: string;
    college?: string;
    degree?: string;
    branch?: string;
    year?: string;
    studentIdNumber?: string;
    graduationYear?: string;
  }): Promise<StudentVerificationRequest> => {
    const student = user as StudentProfile;
    const studentId = student?.id || `student_${Date.now()}`;

    const payload = {
      studentId,
      studentName: student?.name || "Student",
      email: student?.email || "student@university.edu",
      college: data.college || student?.university || "University",
      degree: data.degree || student?.degree || "B.Tech",
      branch: data.branch || student?.branch || student?.specialization || "Computer Science",
      year: data.year || student?.yearOfStudy || "3rd Year",
      studentIdNumber: data.studentIdNumber || "STU-2026-REG",
      graduationYear: data.graduationYear || String(student?.graduationYear || 2027),
      phone: student?.phone,
      verificationType: data.verificationType,
      documentName: data.documentName,
      documentSize: data.documentSize,
      documentUrl: data.documentUrl,
      personalEmail: data.personalEmail || student?.personalEmail,
    };

    let serverRequest: any = null;
    try {
      const res = await fetch("/api/student/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        serverRequest = json.request;
      }
    } catch (err) {
      console.warn("Server verification submission error:", err);
    }

    const newRequest: StudentVerificationRequest = {
      id: serverRequest?.verificationId || `req_${Date.now()}`,
      verificationId: serverRequest?.verificationId || `VER-2026-${Date.now().toString().slice(-6)}`,
      studentId,
      studentName: payload.studentName,
      university: payload.college,
      universityEmail: payload.email,
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

  const resubmitStudentVerification = async (data: {
    documentName: string;
    documentSize: string;
    documentUrl: string;
    personalEmail?: string;
    notes?: string;
  }): Promise<void> => {
    if (!user || user.role !== "student") return;
    const student = user as StudentProfile;
    const verificationId = student.verificationRequest?.verificationId || "VER-CURRENT";

    try {
      const res = await fetch(`/api/student/verification/${encodeURIComponent(verificationId)}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          ...data,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.student) {
          setUser(json.student);
          persistSession(json.student, "student");
          return;
        }
      }
    } catch (err) {
      console.warn("Resubmit error:", err);
    }

    // Local fallback update
    const updatedRequest: StudentVerificationRequest = {
      ...(student.verificationRequest || {
        id: `req_${Date.now()}`,
        verificationId: `VER-2026-${Date.now().toString().slice(-6)}`,
        studentId: student.id,
        studentName: student.name,
        university: student.university,
        universityEmail: student.email,
        verificationType: "payment_receipt",
      }),
      status: "pending",
      documentName: data.documentName,
      documentSize: data.documentSize,
      documentUrl: data.documentUrl,
      personalEmail: data.personalEmail || student.personalEmail,
      submittedAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rejectionReason: undefined,
    };

    const updatedProfile: StudentProfile = {
      ...student,
      verificationStatus: "pending",
      verificationRequest: updatedRequest,
    };

    setUser(updatedProfile);
    persistSession(updatedProfile, "student");
  };

  const reviewVerification = async (status: "approved" | "rejected", rejectionReason?: string) => {
    if (!user || user.role !== "student") return;
    const student = user as StudentProfile;
    const currentReq = student.verificationRequest;
    const verId = currentReq?.verificationId || currentReq?.id || "VER-2026-004812";

    try {
      if (status === "approved") {
        await fetch(`/api/admin/verification/${encodeURIComponent(verId)}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminName: "StudentHub Admin Team" }),
        });
      } else {
        await fetch(`/api/admin/verification/${encodeURIComponent(verId)}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: rejectionReason || "Uploaded document was unreadable or expired.",
            adminName: "StudentHub Admin Team",
          }),
        });
      }
    } catch (err) {
      console.warn("Review API error:", err);
    }

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
        loginWithGoogle,
        registerStudent,
        registerRecruiter,
        logout,
        switchRole,
        updateStudentProfile,
        updateRecruiterProfile,
        submitStudentVerification,
        resubmitStudentVerification,
        reviewVerification,
        resetVerificationForResubmission,
        refreshUserSession,
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
