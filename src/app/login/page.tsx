"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, Briefcase, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleQuickFill = (fillRole: UserRole) => {
    setRole(fillRole);
    if (fillRole === "student") {
      setEmail("alex.rivera@stanford.edu");
      setPassword("studenthub123");
    } else if (fillRole === "recruiter") {
      setEmail("sarah.chen@stripe-careers.com");
      setPassword("recruiter123");
    } else {
      setEmail("priya.menon@studenthub.io");
      setPassword("admin123");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (!password || password.trim().length === 0) {
      setErrorMsg("Password cannot be empty");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      login(email, role);
      success(
        `Welcome back! Logged in as ${
          role === "student"
            ? "Alex Rivera (Student)"
            : role === "recruiter"
            ? "Sarah Chen (Recruiter)"
            : "Priya Menon (Admin)"
        }`
      );
      if (role === "recruiter") {
        router.push("/dashboard/recruiter");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Auth Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                StudentHub
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your credentials or continue with Google for instant access.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted border border-border">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === "student"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === "recruiter"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === "admin"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            {/* Google Authentication Button */}
            <div className="space-y-3">
              <GoogleSignInButton
                role={role}
                mode="login"
              />
              <div className="relative flex items-center justify-center">
                <div className="border-t border-border w-full" />
                <span className="bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">
                  Or continue with email
                </span>
                <div className="border-t border-border w-full" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder={role === "student" ? "you@university.edu" : "name@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                    Password
                  </label>
                  <span className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-sm font-semibold justify-center shadow-md shadow-purple-600/20"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In as {role === "student" ? "Student" : role === "recruiter" ? "Recruiter" : "Admin"}
              </Button>
            </form>

            {/* Quick-fill shortcut for hassle-free evaluation */}
            <div className="pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground text-center mb-2.5">
                Quick Demo Login (One-Click Fill)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickFill("student")}
                >
                  Fill Student Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickFill("recruiter")}
                >
                  Fill Recruiter Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickFill("admin")}
                >
                  Fill Admin Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Switch to Sign up */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} StudentHub Platform
      </footer>
    </div>
  );
}
