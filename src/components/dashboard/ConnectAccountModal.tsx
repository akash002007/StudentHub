"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import {
  Github,
  Code,
  Trophy,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Link2,
} from "lucide-react";

export interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IntegrationStatus {
  github: boolean;
  leetcode: boolean;
  codeforces: boolean;
  huggingface: boolean;
}

export function ConnectAccountModal({ isOpen, onClose }: ConnectAccountModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [statuses, setStatuses] = useState<IntegrationStatus>({
    github: false,
    leetcode: false,
    codeforces: false,
    huggingface: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirectingGithub, setIsRedirectingGithub] = useState(false);

  // Fetch connection statuses when modal opens
  const fetchStatuses = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [ghRes, lcRes, cfRes, hfRes] = await Promise.allSettled([
        fetch(`/api/integrations/github/status?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/integrations/leetcode/status?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/integrations/codeforces/status?userId=${encodeURIComponent(user.id)}`),
        fetch(`/api/integrations/huggingface/status?userId=${encodeURIComponent(user.id)}`),
      ]);

      const ghData = ghRes.status === "fulfilled" && ghRes.value.ok ? await ghRes.value.json() : null;
      const lcData = lcRes.status === "fulfilled" && lcRes.value.ok ? await lcRes.value.json() : null;
      const cfData = cfRes.status === "fulfilled" && cfRes.value.ok ? await cfRes.value.json() : null;
      const hfData = hfRes.status === "fulfilled" && hfRes.value.ok ? await hfRes.value.json() : null;

      setStatuses({
        github: Boolean(ghData?.connected),
        leetcode: Boolean(lcData?.connected),
        codeforces: Boolean(cfData?.connected),
        huggingface: Boolean(hfData?.connected),
      });
    } catch {
      // Ignore background errors
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchStatuses();
    }
  }, [isOpen, fetchStatuses]);

  const handleConnectGithub = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsRedirectingGithub(true);
    window.location.href = `/api/integrations/github/connect?userId=${encodeURIComponent(user.id)}`;
  };

  const handleNavigateToAccounts = () => {
    onClose();
    router.push("/dashboard/connected-accounts");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect an Account"
      description="Connect your external accounts to strengthen your StudentHub profile and Career DNA."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Supported Integrations List */}
        <div className="space-y-2.5">
          {/* 1. GitHub Integration */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    GitHub
                  </h4>
                  {statuses.github && (
                    <Badge variant="emerald" size="sm" className="text-[10px] py-0">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Connect repositories, commits, and code velocity
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {statuses.github ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToAccounts}
                  className="text-xs font-semibold h-8 px-3"
                >
                  Manage
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnectGithub}
                  disabled={isRedirectingGithub}
                  className="text-xs font-semibold h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRedirectingGithub ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* 2. LeetCode Integration */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    LeetCode
                  </h4>
                  {statuses.leetcode && (
                    <Badge variant="emerald" size="sm" className="text-[10px] py-0">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Connect algorithmic problem-solving and contest rating
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant={statuses.leetcode ? "outline" : "primary"}
                size="sm"
                onClick={handleNavigateToAccounts}
                className={`text-xs font-semibold h-8 px-3.5 ${
                  statuses.leetcode
                    ? ""
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {statuses.leetcode ? "Manage" : "Connect"}
              </Button>
            </div>
          </div>

          {/* 3. Codeforces Integration */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    Codeforces
                  </h4>
                  {statuses.codeforces && (
                    <Badge variant="emerald" size="sm" className="text-[10px] py-0">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Connect competitive programming handle and rank
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant={statuses.codeforces ? "outline" : "primary"}
                size="sm"
                onClick={handleNavigateToAccounts}
                className={`text-xs font-semibold h-8 px-3.5 ${
                  statuses.codeforces
                    ? ""
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {statuses.codeforces ? "Manage" : "Connect"}
              </Button>
            </div>
          </div>

          {/* 4. Hugging Face Integration */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    Hugging Face
                  </h4>
                  {statuses.huggingface && (
                    <Badge variant="emerald" size="sm" className="text-[10px] py-0">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Connected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Connect machine learning models, spaces, and datasets
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant={statuses.huggingface ? "outline" : "primary"}
                size="sm"
                onClick={handleNavigateToAccounts}
                className={`text-xs font-semibold h-8 px-3.5 ${
                  statuses.huggingface
                    ? ""
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {statuses.huggingface ? "Manage" : "Connect"}
              </Button>
            </div>
          </div>

          {/* 5. More Integrations Coming Soon */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-dashed border-border/70 bg-muted/20 flex items-center justify-between gap-3 opacity-80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  More Integrations
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  LinkedIn, Kaggle, GitLab, and HackerRank in development
                </p>
              </div>
            </div>

            <Badge variant="outline" size="sm" className="text-[10px] text-muted-foreground shrink-0">
              Coming soon
            </Badge>
          </div>
        </div>

        {/* Footer Link to Full Connected Accounts Hub */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            All integrations are verified & end-to-end encrypted.
          </span>
          <button
            type="button"
            onClick={handleNavigateToAccounts}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Integration Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
