"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  X,
  Briefcase,
  FolderPlus,
  UploadCloud,
  Users2,
  Bot,
  Send,
  CheckCircle,
  PlusCircle,
  Search,
  BarChart3,
  MessageSquare,
  GitPullRequest,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";

export function QuickActionsFab() {
  const router = useRouter();
  const { role } = useAuth();
  const { addProject } = useData();
  const { success } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  // Student Modals state triggered by FAB actions
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // AI Modal Mock Chat
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: "Hi Alex! I'm your StudentHub Career Advisor. Ask me anything about interview prep, resume tailoring, or finding the right engineering internships.",
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Project Modal State
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectTech, setNewProjectTech] = useState("");
  const [newProjectType, setNewProjectType] = useState<"Personal" | "Hackathon" | "Capstone">("Personal");

  // Resume Modal State
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const studentActions = [
    {
      id: "ai",
      label: "Ask StudentHub AI",
      icon: Bot,
      color: "from-purple-600 to-indigo-600",
      onClick: () => {
        setIsOpen(false);
        setIsAiModalOpen(true);
      },
    },
    {
      id: "internships",
      label: "Find Internships",
      icon: Briefcase,
      color: "from-blue-600 to-cyan-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/internships");
      },
    },
    {
      id: "project",
      label: "Add Project",
      icon: FolderPlus,
      color: "from-emerald-600 to-teal-600",
      onClick: () => {
        setIsOpen(false);
        setIsProjectModalOpen(true);
      },
    },
    {
      id: "resume",
      label: "Upload Resume",
      icon: UploadCloud,
      color: "from-amber-600 to-orange-600",
      onClick: () => {
        setIsOpen(false);
        setIsResumeModalOpen(true);
      },
    },
    {
      id: "mentor",
      label: "Find Mentor",
      icon: Users2,
      color: "from-fuchsia-600 to-rose-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/communities");
      },
    },
  ];

  const recruiterActions = [
    {
      id: "post_internship",
      label: "Post Internship",
      icon: PlusCircle,
      color: "from-purple-600 to-indigo-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/recruiter/post-internship");
      },
    },
    {
      id: "review_applications",
      label: "Review Applications",
      icon: GitPullRequest,
      color: "from-blue-600 to-cyan-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/recruiter/applications");
      },
    },
    {
      id: "find_students",
      label: "Find Students",
      icon: Search,
      color: "from-emerald-600 to-teal-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/recruiter/students");
      },
    },
    {
      id: "view_analytics",
      label: "View Analytics",
      icon: BarChart3,
      color: "from-amber-600 to-orange-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/recruiter/analytics");
      },
    },
    {
      id: "message_candidates",
      label: "Message Candidates",
      icon: MessageSquare,
      color: "from-fuchsia-600 to-rose-600",
      onClick: () => {
        setIsOpen(false);
        router.push("/dashboard/recruiter/messages");
      },
    },
  ];

  const actions = role === "recruiter" ? recruiterActions : studentActions;

  const handleSendAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt.trim();
    setAiMessages((prev) => [...prev, { role: "user", text: userText }]);
    setAiPrompt("");
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = "Based on your Stanford CS coursework and PulseFlow project, I recommend highlighting your real-time CRDT synchronization experience when applying to Linear and Stripe.";
      if (userText.toLowerCase().includes("resume")) {
        reply = "Tip: Make your project bullet points result-oriented. For example: 'Engineered WebSockets layer reducing canvas state latency by 45% for 1,200+ active users.'";
      } else if (userText.toLowerCase().includes("interview")) {
        reply = "For upcoming frontend rounds, practice explaining optimistic UI updates, debounced search patterns, and custom React hooks for browser APIs.";
      }
      setAiMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    addProject({
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || "A modern technical project built with cutting-edge tools.",
      technologies: newProjectTech
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      date: "Just now",
      type: newProjectType,
      featured: true,
      githubUrl: "https://github.com",
    });

    setNewProjectTitle("");
    setNewProjectDesc("");
    setNewProjectTech("");
    setIsProjectModalOpen(false);
  };

  const handleMockResumeUpload = () => {
    setIsUploadingResume(true);
    setTimeout(() => {
      setIsUploadingResume(false);
      setResumeUploaded(true);
      success("Resume uploaded and attached to your student profile!");
      setTimeout(() => {
        setIsResumeModalOpen(false);
        setResumeUploaded(false);
      }, 1000);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-20 lg:bottom-8 right-5 lg:right-8 z-40 flex flex-col items-end pointer-events-none">
        {/* Expanded Action List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-end gap-2.5 mb-3 pointer-events-auto"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      delay: (actions.length - 1 - index) * 0.04,
                    }}
                    onClick={action.onClick}
                    className="flex items-center gap-3 py-2 px-3.5 rounded-2xl bg-card border border-border/90 shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:scale-105 transition-all text-xs font-semibold text-foreground group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.label}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`pointer-events-auto w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-colors duration-300 border border-white/20 ${
            isOpen
              ? "bg-zinc-900 dark:bg-zinc-800 rotate-90"
              : role === "recruiter"
              ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-blue-600/30"
              : "bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 shadow-purple-600/30"
          }`}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Sparkles className="w-6 h-6 animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* AI Assistant Modal (Student Only) */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="StudentHub Career Advisor"
        description="Instant guidance for resume bullet points, interview questions, and tech internships."
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
              </div>
            )}
          </div>

          <form onSubmit={handleSendAiPrompt} className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask: 'How to prepare for Linear technical interview?'"
              className="flex-1 h-10 px-3.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              className="h-10 px-4 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </Modal>

      {/* Add Project Modal (Student Only) */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Add Proof-of-Work Project"
        description="Spotlight a technical project, hackathon demo, or capstone to showcase to recruiters."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Real-Time Distributed Cache"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Project Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Personal", "Hackathon", "Capstone"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewProjectType(type)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    newProjectType === type
                      ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Technologies Used (comma-separated)"
            placeholder="React, TypeScript, Rust, WebSockets"
            value={newProjectTech}
            onChange={(e) => setNewProjectTech(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Description &amp; Impact
            </label>
            <textarea
              rows={3}
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="What did you build, what problem did it solve, and what were the performance achievements?"
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Resume Modal (Student Only) */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title="Upload Student Resume"
        description="Attach your latest PDF resume to be automatically attached when applying to internships."
      >
        <div className="space-y-4">
          <div
            onClick={handleMockResumeUpload}
            className="p-8 border-2 border-dashed border-border hover:border-purple-500 rounded-2xl bg-muted/30 hover:bg-purple-500/5 transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              {isUploadingResume ? "Uploading & Processing..." : "Click or drag & drop your PDF resume"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, DOCX up to 5MB
            </p>
          </div>

          {resumeUploaded && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Alex_Rivera_Resume_Updated.pdf successfully attached!</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
