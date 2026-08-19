"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, StudentProfile, RecruiterProfile } from "@/types";
import { defaultStudentUser, defaultRecruiterUser } from "@/data/mock-users";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updateStudentProfile,
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
