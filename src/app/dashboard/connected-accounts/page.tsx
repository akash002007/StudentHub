"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Link2,
  Github,
  Linkedin,
  Code,
  Globe,
  Trophy,
  Database,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { GitHubConnection, CodeforcesConnection } from "@/types";
import { GitHubInsights } from "@/components/dashboard/GitHubInsights";
import { CodeforcesInsights } from "@/components/dashboard/CodeforcesInsights";
import { ConnectCodeforcesModal } from "@/components/dashboard/ConnectCodeforcesModal";
import { CareerDNADisplay } from "@/components/dashboard/CareerDNADisplay";

export default function ConnectedAccountsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [githubConnection, setGithubConnection] = useState<GitHubConnection | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Codeforces Integration State
  const [codeforcesConn, setCodeforcesConn] = useState<CodeforcesConnection | null>(null);
  const [isLoadingCf, setIsLoadingCf] = useState(true);
  const [showCodeforcesModal, setShowCodeforcesModal] = useState(false);
  const [showDisconnectCfModal, setShowDisconnectCfModal] = useState(false);
  const [isSyncingCf, setIsSyncingCf] = useState(false);
  const [isDisconnectingCf, setIsDisconnectingCf] = useState(false);

  // Hugging Face Integration State
  const [hfConn, setHfConn] = useState<any | null>(null);
  const [isLoadingHf, setIsLoadingHf] = useState(true);
  const [isSyncingHf, setIsSyncingHf] = useState(false);
  const [isDisconnectingHf, setIsDisconnectingHf] = useState(false);
  const [showDisconnectHfModal, setShowDisconnectHfModal] = useState(false);

  const fetchGithubConnection = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/integrations/github/status?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.connected && data.connection) {
          setGithubConnection(data.connection);
        } else {
          setGithubConnection(null);
        }
      }
    } catch {
      console.warn("Failed to fetch GitHub connection status");
    } finally {
      setIsLoadingGithub(false);
    }
  }, [user]);

  const fetchCodeforcesConnection = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/integrations/codeforces/status?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.connected && data.connection) {
          setCodeforcesConn(data.connection);
        } else {
          setCodeforcesConn(null);
        }
      }
    } catch {
      console.warn("Failed to fetch Codeforces status");
    } finally {
      setIsLoadingCf(false);
    }
  }, [user]);

  const fetchHuggingFaceConnection = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/integrations/huggingface/status?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.connected && data.connection) {
          setHfConn(data.connection);
        } else {
          setHfConn(null);
        }
      }
    } catch {
      console.warn("Failed to fetch Hugging Face status");
    } finally {
      setIsLoadingHf(false);
    }
  }, [user]);

  // Handle URL notifications and fetch initial status
  useEffect(() => {
    fetchGithubConnection();
    fetchCodeforcesConnection();
    fetchHuggingFaceConnection();

    const status = searchParams.get("status");
    const errorParam = searchParams.get("error");

    if (status === "huggingface_connected") {
      success("Hugging Face connected successfully! Models & spaces sync in background.");
      router.replace("/dashboard/connected-accounts");
    } else if (errorParam === "missing_hf_client_id") {
      toastError("Hugging Face Client ID is not configured in .env.local.");
      router.replace("/dashboard/connected-accounts");
    } else if (errorParam === "hf_access_denied") {
      info("Hugging Face OAuth connection was cancelled.");
      router.replace("/dashboard/connected-accounts");
    }

    if (status === "github_connected") {
      success("GitHub account connected! Background sync initiated.");
      router.replace("/dashboard/connected-accounts");
    } else if (errorParam) {
      if (errorParam === "github_cancelled") {
        toastError("GitHub authorization was cancelled.");
      } else if (errorParam === "missing_client_id") {
        toastError("GitHub Client ID is missing. Set GITHUB_CLIENT_ID in your .env.local file.");
      } else if (errorParam === "invalid_state") {
        toastError("GitHub connection failed. Please try again.");
      } else if (errorParam === "account_already_linked") {
        toastError("Your GitHub account is already connected to another StudentHub user.");
      } else {
        toastError("GitHub connection failed. Please try again.");
      }
      router.replace("/dashboard/connected-accounts");
    }
  }, [searchParams, fetchGithubConnection, router, success, toastError]);

  // Polling interval when GitHub sync status is SYNCING
  useEffect(() => {
    if (!githubConnection || githubConnection.syncStatus !== "SYNCING") return;
    const timer = setInterval(() => {
      fetchGithubConnection();
    }, 3000);
    return () => clearInterval(timer);
  }, [githubConnection, fetchGithubConnection]);

  const handleConnectGithub = () => {
    console.log("Connect GitHub clicked");
    if (!user) {
      console.error("Connect GitHub failed: No authenticated user session found.");
      toastError("Unable to connect GitHub. StudentHub session expired. Please sign in again.");
      return;
    }
    setIsConnecting(true);
    // Redirect browser to backend OAuth start route
    window.location.href = `/api/integrations/github/connect?userId=${encodeURIComponent(user.id)}`;
  };

  const handleManualSync = async () => {
    if (!user || !githubConnection) return;
    setIsSyncingManual(true);
    try {
      const res = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("GitHub sync job queued in background!");
        fetchGithubConnection();
      } else {
        toastError(data.error || "Failed to trigger GitHub sync.");
      }
    } catch {
      toastError("Network error triggering GitHub sync.");
    } finally {
      setIsSyncingManual(false);
    }
  };

  const handleDisconnectGithub = async () => {
    if (!user) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch(`/api/integrations/github?userId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGithubConnection(null);
        setShowDisconnectModal(false);
        success("GitHub account disconnected successfully.");
      } else {
        toastError("Failed to disconnect GitHub account.");
      }
    } catch {
      toastError("Error disconnecting GitHub account.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSyncCodeforces = async () => {
    if (!user || !codeforcesConn) return;
    setIsSyncingCf(true);
    try {
      const res = await fetch("/api/integrations/codeforces/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Codeforces sync job queued in background!");
        fetchCodeforcesConnection();
      } else {
        toastError(data.error || "Failed to trigger Codeforces sync.");
      }
    } catch {
      toastError("Network error syncing Codeforces profile.");
    } finally {
      setIsSyncingCf(false);
    }
  };

  const handleDisconnectCodeforces = async () => {
    if (!user) return;
    setIsDisconnectingCf(true);
    try {
      const res = await fetch(`/api/integrations/codeforces?userId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCodeforcesConn(null);
        setShowDisconnectCfModal(false);
        success("Codeforces account disconnected successfully.");
      } else {
        toastError("Failed to disconnect Codeforces account.");
      }
    } catch {
      toastError("Error disconnecting Codeforces account.");
    } finally {
      setIsDisconnectingCf(false);
    }
  };

  const handleConnectHuggingFace = () => {
    if (!user) return;
    window.location.href = `/api/integrations/huggingface/connect?userId=${encodeURIComponent(user.id)}`;
  };

  const handleSyncHuggingFace = async () => {
    if (!user || !hfConn) return;
    setIsSyncingHf(true);
    try {
      const res = await fetch(`/api/integrations/huggingface/sync?userId=${encodeURIComponent(user.id)}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Hugging Face sync started in background!");
        fetchHuggingFaceConnection();
      } else {
        toastError(data.error || "Failed to trigger Hugging Face sync.");
      }
    } catch {
      toastError("Network error syncing Hugging Face repositories.");
    } finally {
      setIsSyncingHf(false);
    }
  };

  const handleDisconnectHuggingFace = async () => {
    if (!user) return;
    setIsDisconnectingHf(true);
    try {
      const res = await fetch(`/api/integrations/huggingface?userId=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHfConn(null);
        setShowDisconnectHfModal(false);
        success("Hugging Face account disconnected successfully.");
      } else {
        toastError("Failed to disconnect Hugging Face account.");
      }
    } catch {
      toastError("Error disconnecting Hugging Face account.");
    } finally {
      setIsDisconnectingHf(false);
    }
  };

  const integrationPlatforms = [
    {
      id: "leetcode",
      name: "LeetCode",
      platform: "leetcode",
      metric: "Problems solved & contest rating",
      description: "Display verified problem-solving count, global ranking, and badge achievements.",
      status: "coming_soon",
    },
    {
      id: "codeforces",
      name: "Codeforces",
      platform: "codeforces",
      metric: "Rank & Max Rating",
      description: "Sync competitive programming rank (Candidate Master, Specialist) and contest history.",
      status: "coming_soon",
    },
    {
      id: "huggingface",
      name: "Hugging Face",
      platform: "huggingface",
      metric: "Models & Datasets published",
      description: "Showcase open-source AI models, Space demos, and machine learning research assets.",
      status: "coming_soon",
    },
    {
      id: "kaggle",
      name: "Kaggle",
      platform: "kaggle",
      metric: "Data Science & AI rank",
      description: "Highlight Notebooks, Grandmaster rankings, and ML competition benchmarks.",
      status: "coming_soon",
    },
  ];

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Connected Accounts &amp; Developer Profiles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Link your external coding, research, and portfolio platforms to power automated recruiter discovery.
          </p>
        </div>

        {/* Notice Banner */}
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground">GitHub Production Intelligence Integration:</span>{" "}
            GitHub OAuth, background repository synchronization, Skill Intelligence, and Career DNA updates are now active.
          </div>
        </div>

        {/* Grid of Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* GitHub Card (Live Integration) */}
          <Card
            hoverEffect
            className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-foreground shrink-0">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">GitHub</h3>
                    {githubConnection ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        @{githubConnection.githubUsername}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Repositories &amp; Technical Activity
                      </p>
                    )}
                  </div>
                </div>

                <Badge
                  variant={
                    isLoadingGithub
                      ? "secondary"
                      : !githubConnection
                      ? "secondary"
                      : githubConnection.syncStatus === "SYNCING"
                      ? "purple"
                      : githubConnection.syncStatus === "FAILED"
                      ? "rose"
                      : "emerald"
                  }
                  size="sm"
                  className="font-semibold"
                >
                  {isLoadingGithub
                    ? "Checking..."
                    : !githubConnection
                    ? "Not Connected"
                    : githubConnection.syncStatus === "SYNCING"
                    ? "Syncing..."
                    : githubConnection.syncStatus === "FAILED"
                    ? "Sync Failed"
                    : "Connected"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {githubConnection
                  ? githubConnection.syncStatus === "SYNCING"
                    ? "Synchronizing repositories and building Skill Intelligence in background..."
                    : githubConnection.syncStatus === "FAILED"
                    ? githubConnection.syncError || "Background synchronization encountered an error."
                    : `Connected as @${githubConnection.githubUsername}. Repositories, skills, and Career DNA synchronized.`
                  : "Connect your GitHub account to automatically power your StudentHub Career DNA."}
              </p>

              {githubConnection && (
                <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span>Profile Link:</span>
                    <a
                      href={githubConnection.githubProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {githubConnection.githubUsername} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Repositories Processed:</span>
                    <span className="font-semibold text-foreground">
                      {githubConnection.repositoriesCount ?? 0} repos
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Skills Detected:</span>
                    <span className="font-semibold text-foreground">
                      {githubConnection.skillsDetectedCount ?? 0} skills
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Synced:</span>
                    <span className="font-medium text-foreground">
                      {githubConnection.syncCompletedAt
                        ? new Date(githubConnection.syncCompletedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Initial Sync Pending"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-2 border-t border-border/40 flex items-center gap-2">
              {githubConnection ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleManualSync}
                    disabled={isSyncingManual || githubConnection.syncStatus === "SYNCING"}
                  >
                    {isSyncingManual || githubConnection.syncStatus === "SYNCING" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800"
                    onClick={() => setShowDisconnectModal(true)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleConnectGithub}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Redirecting to GitHub...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" /> Connect GitHub
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Codeforces Integration Card */}
          <Card
            hoverEffect
            className="p-6 border-rose-500/20 bg-gradient-to-br from-card via-card to-rose-500/5 dark:to-rose-950/20 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Codeforces</h3>
                    <p className="text-xs text-muted-foreground">Competitive Programming Profile</p>
                  </div>
                </div>

                <Badge
                  variant={
                    codeforcesConn?.status === "VERIFIED"
                      ? "rose"
                      : codeforcesConn?.status === "PENDING_VERIFICATION"
                      ? "amber"
                      : "secondary"
                  }
                  size="sm"
                  className="font-semibold capitalize"
                >
                  {isLoadingCf
                    ? "Checking..."
                    : !codeforcesConn
                    ? "Not Connected"
                    : codeforcesConn.status === "PENDING_VERIFICATION"
                    ? "Verification Required"
                    : codeforcesConn.syncStatus === "SYNCING"
                    ? "Syncing..."
                    : codeforcesConn.syncStatus === "FAILED"
                    ? "Sync Failed"
                    : "Verified"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {codeforcesConn
                  ? codeforcesConn.status === "PENDING_VERIFICATION"
                    ? `Handle @${codeforcesConn.handle} attached. Complete ownership verification to add competitive programming data to Career DNA.`
                    : `Connected as @${codeforcesConn.handle}. Rating ${codeforcesConn.rating} (${codeforcesConn.rank}). Solved ${codeforcesConn.solvedProblemsCount} problems.`
                  : "Connect your Codeforces profile to analyze competitive programming activity and add it to Career DNA."}
              </p>

              {codeforcesConn && (
                <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span>Profile Handle:</span>
                    <a
                      href={`https://codeforces.com/profile/${codeforcesConn.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      @{codeforcesConn.handle} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ownership Status:</span>
                    <span className={`font-bold ${codeforcesConn.status === "VERIFIED" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {codeforcesConn.status === "VERIFIED" ? "Verified Owner" : "Pending Verification"}
                    </span>
                  </div>
                  {codeforcesConn.status === "VERIFIED" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Current Rating:</span>
                        <span className="font-bold text-foreground">{codeforcesConn.rating} (Max: {codeforcesConn.maxRating})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Solved Problems:</span>
                        <span className="font-bold text-foreground">{codeforcesConn.solvedProblemsCount} problems</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-2 border-t border-border/40 flex items-center gap-2">
              {codeforcesConn && codeforcesConn.status === "VERIFIED" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleSyncCodeforces}
                    disabled={isSyncingCf || codeforcesConn.syncStatus === "SYNCING"}
                  >
                    {isSyncingCf || codeforcesConn.syncStatus === "SYNCING" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800"
                    onClick={() => setShowDisconnectCfModal(true)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : codeforcesConn && codeforcesConn.status === "PENDING_VERIFICATION" ? (
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => setShowCodeforcesModal(true)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Verify Ownership
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 dark:text-rose-400"
                    onClick={() => setShowDisconnectCfModal(true)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full text-xs font-semibold"
                  onClick={() => setShowCodeforcesModal(true)}
                >
                  <Trophy className="w-4 h-4 mr-2" /> Connect Codeforces
                </Button>
              )}
            </div>
          </Card>

          {/* 3. HUGGING FACE CARD */}
          <Card
            hoverEffect
            className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Hugging Face</h3>
                    <p className="text-xs text-muted-foreground">Models, Datasets & Space Demos</p>
                  </div>
                </div>
                {hfConn ? (
                  <Badge variant="emerald" size="md">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="sm">
                    Not Connected
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Showcase open-source AI models, Space demos, datasets, and machine learning research assets.
              </p>

              {hfConn && (
                <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span>Profile Link:</span>
                    <a
                      href={hfConn.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      @{hfConn.username} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI Models:</span>
                    <span className="font-bold text-foreground">{hfConn.modelsCount} models</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Datasets:</span>
                    <span className="font-bold text-foreground">{hfConn.datasetsCount} datasets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Spaces:</span>
                    <span className="font-bold text-foreground">{hfConn.spacesCount} spaces</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-2 border-t border-border/40 flex items-center gap-2">
              {hfConn ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleSyncHuggingFace}
                    disabled={isSyncingHf || hfConn.syncStatus === "SYNCING"}
                  >
                    {isSyncingHf || hfConn.syncStatus === "SYNCING" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Sync Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800"
                    onClick={() => setShowDisconnectHfModal(true)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleConnectHuggingFace}
                >
                  <Globe className="w-4 h-4 mr-2" /> Connect Hugging Face
                </Button>
              )}
            </div>
          </Card>

          {/* Other Platforms Cards */}
          {integrationPlatforms
            .filter((acc: any) => acc.id !== "codeforces" && acc.id !== "huggingface")
            .map((acc: any) => (
            <Card
              key={acc.id}
              hoverEffect
              className="p-6 border-border/80 bg-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted border border-border/60 flex items-center justify-center text-foreground shrink-0">
                      {acc.platform === "leetcode" && <Code className="w-6 h-6 text-amber-500" />}
                      {acc.platform === "linkedin" && <Linkedin className="w-6 h-6 text-blue-500" />}
                      {acc.platform === "codeforces" && <Trophy className="w-6 h-6 text-rose-500" />}
                      {acc.platform === "portfolio" && <Globe className="w-6 h-6 text-purple-500" />}
                      {acc.platform === "kaggle" && <Database className="w-6 h-6 text-cyan-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{acc.name}</h3>
                      <p className="text-xs text-muted-foreground">{acc.metric}</p>
                    </div>
                  </div>

                  <Badge variant="secondary" size="sm" className="font-semibold">
                    Coming Soon
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {acc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" /> Integration in Next Phase
                </span>
                <Button variant="secondary" size="sm" disabled className="h-8 text-xs opacity-60">
                  Coming Soon
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* GitHub Insights & Data Results Section */}
        {user && (
          <>
            <GitHubInsights
              userId={user.id}
              onSyncClick={handleManualSync}
              isSyncingManual={isSyncingManual}
            />
            <CodeforcesInsights
              userId={user.id}
              onSyncClick={handleSyncCodeforces}
              isSyncingManual={isSyncingCf}
            />
            <CareerDNADisplay userId={user.id} />
          </>
        )}

        {/* Connect Codeforces Modal */}
        <ConnectCodeforcesModal
          isOpen={showCodeforcesModal}
          onClose={() => setShowCodeforcesModal(false)}
          onSuccess={() => fetchCodeforcesConnection()}
        />

        {/* Disconnect GitHub Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-bold text-lg text-foreground">Disconnect GitHub Account?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your GitHub repositories, synchronization data, and GitHub connection will be disconnected from StudentHub. You can connect another GitHub account later.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectModal(false)}
                  disabled={isDisconnecting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisconnectGithub}
                  disabled={isDisconnecting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect GitHub"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Disconnect Codeforces Confirmation Modal */}
        {showDisconnectCfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-bold text-lg text-foreground">Disconnect Codeforces Account?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your Codeforces account will be disconnected from StudentHub. Your existing Career DNA data can remain available until the next recalculation.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectCfModal(false)}
                  disabled={isDisconnectingCf}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisconnectCodeforces}
                  disabled={isDisconnectingCf}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDisconnectingCf ? "Disconnecting..." : "Disconnect Codeforces"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Disconnect Hugging Face Confirmation Modal */}
        {showDisconnectHfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-bold text-lg text-foreground">Disconnect Hugging Face?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your Hugging Face repositories, models, datasets, and spaces will be disconnected from StudentHub. Your Hugging Face data will no longer be synchronized with Career DNA.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectHfModal(false)}
                  disabled={isDisconnectingHf}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDisconnectHuggingFace}
                  disabled={isDisconnectingHf}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDisconnectingHf ? "Disconnecting..." : "Disconnect Hugging Face"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
