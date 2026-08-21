"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
  role?: UserRole;
  mode?: "login" | "signup";
  className?: string;
  university?: string;
  company?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  role = "student",
  mode = "login",
  className = "",
  university,
  company,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const gsiRenderRef = useRef<HTMLDivElement>(null);

  // Exact Next.js public environment variable
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Safe development debug check
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Google Client ID configured:",
        Boolean(googleClientId)
      );
    }
  }, [googleClientId]);

  // Handle credential returned by Google Identity Services or fallback
  const handleCredentialResponse = useCallback(
    async (credential: string) => {
      setIsLoading(true);
      try {
        const result = await loginWithGoogle(credential, role, {
          university,
          company,
        });

        if (result.success) {
          success(
            result.isNewUser
              ? `Account created! Welcome to StudentHub.`
              : `Welcome back, ${result.user?.name || "User"}!`
          );
          if (onSuccess) {
            onSuccess();
          } else if (result.redirectUrl) {
            router.push(result.redirectUrl);
          }
        } else {
          const message = result.error || "Google authentication failed";
          toastError(message);
          if (onError) onError(message);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Authentication error occurred";
        toastError(message);
        if (onError) onError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loginWithGoogle, role, university, company, onSuccess, onError, success, toastError, router]
  );

  // Load Google Identity Services SDK script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setIsGsiLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGsiLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => setIsGsiLoaded(true));
      if ((existingScript as any).readyState === "complete") {
        setIsGsiLoaded(true);
      }
    }
  }, []);

  // Initialize Google Identity Services with real Client ID when present
  useEffect(() => {
    const isValidClientId =
      googleClientId &&
      googleClientId !== "YOUR_CLIENT_ID_HERE" &&
      googleClientId.includes(".apps.googleusercontent.com");

    if (isGsiLoaded && isValidClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              handleCredentialResponse(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official GSI button in overlay container for direct user click handling
        if (gsiRenderRef.current) {
          gsiRenderRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(gsiRenderRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            width: 380,
          });
        }
      } catch (initErr) {
        console.warn("GSI initialization notice:", initErr);
      }
    }
  }, [isGsiLoaded, googleClientId, handleCredentialResponse, mode]);

  const handleCustomButtonClick = () => {
    const isValidClientId =
      googleClientId &&
      googleClientId !== "YOUR_CLIENT_ID_HERE" &&
      googleClientId.includes(".apps.googleusercontent.com");

    if (isValidClientId && window.google?.accounts?.id) {
      setIsLoading(true);
      try {
        window.google.accounts.id.prompt((notification) => {
          if (
            notification.isNotDisplayed() ||
            notification.isSkippedMoment() ||
            notification.isDismissedMoment()
          ) {
            setIsLoading(false);
          }
        });
      } catch {
        setIsLoading(false);
      }
    } else {
      // Development mock fallback if no valid Google Client ID is configured
      const demoEmail =
        role === "admin"
          ? "priya.menon@studenthub.io"
          : role === "recruiter"
          ? "recruiter.google@stripe-careers.com"
          : "alex.rivera@stanford.edu";

      const mockCredential = `mock_${encodeURIComponent(demoEmail)}_${Date.now()}`;
      handleCredentialResponse(mockCredential);
    }
  };

  const isValidClientId =
    googleClientId &&
    googleClientId !== "YOUR_CLIENT_ID_HERE" &&
    googleClientId.includes(".apps.googleusercontent.com");

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl group", className)}>
      {/* Native Google Identity Services iframe overlay (Direct click target when Client ID is active) */}
      {isGsiLoaded && isValidClientId && (
        <div
          ref={gsiRenderRef}
          className="absolute inset-0 opacity-[0.001] z-20 cursor-pointer flex items-center justify-center scale-150 overflow-hidden"
          aria-hidden="true"
        />
      )}

      {/* Premium StudentHub Styled Google Button */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={isLoading}
        aria-label="Continue with Google"
        className={cn(
          "w-full h-11 px-4 rounded-xl border border-border dark:border-[#2a3042] bg-card dark:bg-[#161924] hover:bg-muted/70 dark:hover:bg-[#1c202e] hover:border-purple-500/40 dark:hover:border-purple-500/30 text-foreground dark:text-slate-100 font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 cursor-pointer relative z-10"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
            <span className="text-muted-foreground text-xs sm:text-sm font-medium">
              Connecting with Google...
            </span>
          </>
        ) : (
          <>
            {/* Google Official Brand SVG Icon */}
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-foreground dark:text-slate-100">
              Continue with Google
            </span>
          </>
        )}
      </button>
    </div>
  );
}
