"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, User, GraduationCap, Briefcase, Building, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const { login, registerStudent } = useAuth();
  const { success } = useToast();

  const [role, setRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [universityOrCompany, setUniversityOrCompany] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (role === "student" && !universityOrCompany.trim()) {
      setErrorMsg("Please enter your university or institution");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (role === "recruiter") {
        login(email, role, name);
        success(`Account created! Welcome to StudentHub, ${name}!`);
        router.push("/dashboard/recruiter");
      } else {
        registerStudent({
          name,
          email,
          university: universityOrCompany,
          password,
        });
        success(`Account created! Let's complete your profile & verification.`);
        router.push("/onboarding");
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

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
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
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Join the professional ecosystem built for college talent and top companies.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted border border-border">
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
              <span>Student Account</span>
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
              <span>Recruiter Account</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder={role === "student" ? "Alex Rivera" : "Sarah Chen"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label={role === "student" ? "University / College Email" : "Work Email"}
                type="email"
                placeholder={role === "student" ? "alex@stanford.edu" : "sarah@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label={role === "student" ? "University / Institution" : "Company Name"}
                placeholder={role === "student" ? "Stanford University" : "Stripe"}
                value={universityOrCompany}
                onChange={(e) => setUniversityOrCompany(e.target.value)}
                leftIcon={
                  role === "student" ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <Building className="w-4 h-4" />
                  )
                }
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

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
                Complete Registration
              </Button>
            </form>
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} StudentHub Platform
      </footer>
    </div>
  );
}
