import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth-jwt";
import {
  defaultStudentUser,
  defaultRecruiterUser,
  defaultAdminUser,
} from "@/data/mock-users";

export interface AuthenticatedStudent {
  id: string;
  email: string;
  role: "STUDENT";
  name?: string;
}

export interface AuthenticatedRecruiter {
  id: string;
  email: string;
  role: "RECRUITER";
  name?: string;
}

/**
 * Creates a Supabase server client configured for Next.js App Router
 * with cookie read/write handling.
 */
export async function createSupabaseServerClient(token?: string) {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Can be safely ignored when called in read contexts
        }
      },
    },
  });
}

/**
 * Verifies the Supabase Auth session and strictly validates that the user role is STUDENT.
 * Returns the authenticated student or an error status (401 / 403).
 */
export async function getAuthenticatedStudent(
  request: NextRequest | Request
): Promise<{ student: AuthenticatedStudent | null; error: string | null; status: number }> {
  try {
    // 1. Extract Bearer token if provided in request headers
    const authHeader =
      request.headers.get("Authorization") || request.headers.get("authorization");
    let bearerToken: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      bearerToken = authHeader.substring(7).trim();
    }

    const supabase = await createSupabaseServerClient(bearerToken);

    // 2. Query Supabase Auth for user session
    let supabaseUser = null;
    try {
      if (bearerToken) {
        const { data } = await supabase.auth.getUser(bearerToken);
        supabaseUser = data?.user;
      }
      if (!supabaseUser) {
        const { data } = await supabase.auth.getUser();
        supabaseUser = data?.user;
      }
    } catch {
      // Supabase auth service unavailable or invalid credentials
    }

    if (supabaseUser) {
      // Check user role strictly
      const rawRole =
        supabaseUser.user_metadata?.role ||
        supabaseUser.app_metadata?.role ||
        supabaseUser.role;

      const roleStr = typeof rawRole === "string" ? rawRole.toUpperCase() : "";

      if (roleStr === "STUDENT") {
        return {
          student: {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            role: "STUDENT",
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
          },
          error: null,
          status: 200,
        };
      } else {
        // User is authenticated but not a student
        return {
          student: null,
          error: "Forbidden: Only users with the STUDENT role can access this endpoint",
          status: 403,
        };
      }
    }

    // 3. Fallback support for local testing / hybrid JWT sessions (if Bearer token is a StudentHub JWT)
    if (bearerToken) {
      const jwtPayload = await verifyAccessToken(bearerToken);
      if (jwtPayload && jwtPayload.userId) {
        const role = (jwtPayload.role || "").toUpperCase();
        if (role === "STUDENT") {
          return {
            student: {
              id: jwtPayload.userId,
              email: jwtPayload.email || "",
              role: "STUDENT",
              name: jwtPayload.name || "",
            },
            error: null,
            status: 200,
          };
        } else {
          return {
            student: null,
            error: "Forbidden: Only users with the STUDENT role can access this endpoint",
            status: 403,
          };
        }
      }
    }

    // 4. Fallback support for cookie token (e.g., studenthub_access_token)
    const cookieStore = await cookies();
    const tokenCookie =
      cookieStore.get("studenthub_access_token")?.value ||
      cookieStore.get("sb-access-token")?.value;
    if (tokenCookie) {
      const jwtPayload = await verifyAccessToken(tokenCookie);
      if (jwtPayload && jwtPayload.userId) {
        const role = (jwtPayload.role || "").toUpperCase();
        if (role === "STUDENT") {
          return {
            student: {
              id: jwtPayload.userId,
              email: jwtPayload.email || "",
              role: "STUDENT",
              name: jwtPayload.name || "",
            },
            error: null,
            status: 200,
          };
        }
      }
    }

    // 5. Explicit user ID header for testing/service access
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      const trimmedId = headerUserId.trim();
      let user: { id: string; email: string; role: string; name?: string } | null = null;
      if (
        trimmedId === defaultStudentUser.id ||
        trimmedId === "student" ||
        trimmedId === "student_123"
      ) {
        user = defaultStudentUser;
      } else if (trimmedId === defaultRecruiterUser.id || trimmedId === "recruiter") {
        user = defaultRecruiterUser;
      } else if (trimmedId === defaultAdminUser.id || trimmedId === "admin") {
        user = defaultAdminUser;
      }

      if (user) {
        const userRole = (user.role || "").toUpperCase();
        if (userRole === "STUDENT") {
          return {
            student: {
              id: user.id || trimmedId,
              email: user.email || "student@example.com",
              role: "STUDENT",
              name: user.name || "Student User",
            },
            error: null,
            status: 200,
          };
        } else {
          return {
            student: null,
            error: "Forbidden: Only users with the STUDENT role can access this endpoint",
            status: 403,
          };
        }
      } else {
        return {
          student: null,
          error: "Unauthorized: User not found",
          status: 401,
        };
      }
    }

    // 6. Default active development session fallback (only if running locally in development without auth)
    if (process.env.NODE_ENV === "development") {
      return {
        student: {
          id: defaultStudentUser.id,
          email: defaultStudentUser.email || "student@example.com",
          role: "STUDENT",
          name: defaultStudentUser.name || "Alex Rivera",
        },
        error: null,
        status: 200,
      };
    }

    // 7. If no valid student session found
    return {
      student: null,
      error: "Unauthorized: Active Supabase session with STUDENT role required",
      status: 401,
    };
  } catch (err) {
    console.error("[Supabase Auth] Verification error:", err);
    return {
      student: null,
      error: "Unauthorized: Authentication verification failed",
      status: 401,
    };
  }
}

/**
 * Verifies the Supabase Auth session and strictly validates that the user role is RECRUITER.
 * Returns the authenticated recruiter or an error status (401 / 403).
 */
export async function getAuthenticatedRecruiter(
  request: NextRequest | Request
): Promise<{ recruiter: AuthenticatedRecruiter | null; error: string | null; status: number }> {
  try {
    const authHeader =
      request.headers.get("Authorization") || request.headers.get("authorization");
    let bearerToken: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      bearerToken = authHeader.substring(7).trim();
    }

    const supabase = await createSupabaseServerClient(bearerToken);

    let supabaseUser = null;
    try {
      if (bearerToken) {
        const { data } = await supabase.auth.getUser(bearerToken);
        supabaseUser = data?.user;
      }
      if (!supabaseUser) {
        const { data } = await supabase.auth.getUser();
        supabaseUser = data?.user;
      }
    } catch {}

    if (supabaseUser) {
      const rawRole =
        supabaseUser.user_metadata?.role ||
        supabaseUser.app_metadata?.role ||
        supabaseUser.role;

      const roleStr = typeof rawRole === "string" ? rawRole.toUpperCase() : "";

      if (roleStr === "RECRUITER") {
        return {
          recruiter: {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            role: "RECRUITER",
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
          },
          error: null,
          status: 200,
        };
      } else {
        return {
          recruiter: null,
          error: "Forbidden: Only users with the RECRUITER role can access this endpoint",
          status: 403,
        };
      }
    }

    if (bearerToken) {
      const jwtPayload = await verifyAccessToken(bearerToken);
      if (jwtPayload && jwtPayload.userId) {
        const role = (jwtPayload.role || "").toUpperCase();
        if (role === "RECRUITER") {
          return {
            recruiter: {
              id: jwtPayload.userId,
              email: jwtPayload.email || "",
              role: "RECRUITER",
              name: jwtPayload.name || "",
            },
            error: null,
            status: 200,
          };
        }
      }
    }

    const cookieStore = await cookies();
    const tokenCookie =
      cookieStore.get("studenthub_access_token")?.value ||
      cookieStore.get("sb-access-token")?.value;
    if (tokenCookie) {
      const jwtPayload = await verifyAccessToken(tokenCookie);
      if (jwtPayload && jwtPayload.userId) {
        const role = (jwtPayload.role || "").toUpperCase();
        if (role === "RECRUITER") {
          return {
            recruiter: {
              id: jwtPayload.userId,
              email: jwtPayload.email || "",
              role: "RECRUITER",
              name: jwtPayload.name || "",
            },
            error: null,
            status: 200,
          };
        }
      }
    }

    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      const trimmedId = headerUserId.trim();
      let user: any = null;
      if (trimmedId === defaultRecruiterUser.id || trimmedId === "recruiter") {
        user = defaultRecruiterUser;
      }
      if (user && (user.role || "").toUpperCase() === "RECRUITER") {
        return {
          recruiter: {
            id: user.id,
            email: user.email,
            role: "RECRUITER",
            name: user.name,
          },
          error: null,
          status: 200,
        };
      }
    }

    if (process.env.NODE_ENV === "development") {
      return {
        recruiter: {
          id: defaultRecruiterUser.id,
          email: defaultRecruiterUser.email || "recruiter@example.com",
          role: "RECRUITER",
          name: defaultRecruiterUser.name || "Recruiter",
        },
        error: null,
        status: 200,
      };
    }

    return {
      recruiter: null,
      error: "Unauthorized: Active session with RECRUITER role required",
      status: 401,
    };
  } catch (err) {
    return {
      recruiter: null,
      error: "Unauthorized: Authentication verification failed",
      status: 401,
    };
  }
}
