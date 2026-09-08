import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth-jwt";
import {
  defaultStudentUser,
  defaultRecruiterUser,
  defaultAdminUser,
} from "@/data/mock-users";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  company_id?: string;
  college_id?: string;
  account_status?: string;
}

export interface AuthenticatedStudent extends AuthenticatedUser {
  role: "STUDENT";
}

export interface AuthenticatedRecruiter extends AuthenticatedUser {
  role: "RECRUITER";
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
 * Unified authentication function that checks Supabase Auth or local JWT tokens,
 * validates against an array of allowed roles, and returns the authenticated user.
 */
export async function getAuthenticatedUser(
  request: NextRequest | Request,
  allowedRoles?: string[]
): Promise<{ user: AuthenticatedUser | null; error: string | null; status: number }> {
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

    let userRole = "";
    let authenticatedUser: AuthenticatedUser | null = null;

    if (supabaseUser) {
      const rawRole =
        supabaseUser.user_metadata?.role ||
        supabaseUser.app_metadata?.role ||
        supabaseUser.role;

      userRole = typeof rawRole === "string" ? rawRole.toUpperCase() : "";
      
      authenticatedUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        role: userRole,
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
        company_id: supabaseUser.app_metadata?.company_id || supabaseUser.user_metadata?.company_id,
        college_id: supabaseUser.app_metadata?.college_id || supabaseUser.user_metadata?.college_id,
        account_status: supabaseUser.app_metadata?.account_status || "ACTIVE"
      };
    } 
    // 3. Fallback to Bearer token decoding (if it's a valid local JWT)
    else if (bearerToken) {
      const jwtPayload = await verifyAccessToken(bearerToken);
      if (jwtPayload && jwtPayload.userId) {
        userRole = (jwtPayload.role || "").toUpperCase();
        authenticatedUser = {
          id: jwtPayload.userId,
          email: jwtPayload.email || "",
          role: userRole,
          name: (jwtPayload.name as string) || "",
          company_id: jwtPayload.company_id as string | undefined,
          college_id: jwtPayload.college_id as string | undefined,
        };
      }
    } 
    // 4. Fallback to Cookie processing
    else {
      const cookieStore = await cookies();
      const tokenCookie =
        cookieStore.get("studenthub_access_token")?.value ||
        cookieStore.get("sb-access-token")?.value;
        
      if (tokenCookie) {
        const jwtPayload = await verifyAccessToken(tokenCookie);
        if (jwtPayload && jwtPayload.userId) {
          userRole = (jwtPayload.role || "").toUpperCase();
          authenticatedUser = {
            id: jwtPayload.userId,
            email: jwtPayload.email || "",
            role: userRole,
            name: (jwtPayload.name as string) || "",
            company_id: jwtPayload.company_id as string | undefined,
            college_id: jwtPayload.college_id as string | undefined,
          };
        }
      }
    }

    // 5. Mock header logic for testing/service access
    if (!authenticatedUser) {
      const headerUserId = request.headers.get("x-user-id");
      if (headerUserId) {
        const trimmedId = headerUserId.trim();
        let user: any = null;
        if (trimmedId === defaultStudentUser.id || trimmedId === "student" || trimmedId === "student_123") {
          user = defaultStudentUser;
        } else if (trimmedId === defaultRecruiterUser.id || trimmedId === "recruiter") {
          user = defaultRecruiterUser;
        } else if (trimmedId === defaultAdminUser.id || trimmedId === "admin") {
          user = defaultAdminUser;
        }

        if (user) {
          userRole = (user.role || "").toUpperCase();
          authenticatedUser = {
            id: user.id || trimmedId,
            email: user.email || "mock@example.com",
            role: userRole,
            name: user.name || "Mock User",
          };
        }
      }
    }

    // 6. Default fallback for local dev
    if (!authenticatedUser && process.env.NODE_ENV === "development") {
      // We default to STUDENT if running locally and no session provided, unless a recruiter route is being hit
      // We can inspect URL path if possible, but request.url is available.
      const url = request.url || "";
      if (url.includes("/recruiter")) {
        userRole = "RECRUITER";
        authenticatedUser = {
          id: defaultRecruiterUser.id,
          email: defaultRecruiterUser.email || "recruiter@example.com",
          role: "RECRUITER",
          name: defaultRecruiterUser.name || "Mock Recruiter",
        };
      } else {
        userRole = "STUDENT";
        authenticatedUser = {
          id: defaultStudentUser.id,
          email: defaultStudentUser.email || "student@example.com",
          role: "STUDENT",
          name: defaultStudentUser.name || "Mock Student",
        };
      }
    }

    if (!authenticatedUser) {
      return {
        user: null,
        error: "Unauthorized: Active session required",
        status: 401,
      };
    }

    // 7. Check suspended status
    if (authenticatedUser.account_status === "SUSPENDED") {
      return {
        user: null,
        error: "Forbidden: Account is suspended",
        status: 403,
      };
    }

    // 8. Validate against allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      const upperAllowed = allowedRoles.map(r => r.toUpperCase());
      if (!upperAllowed.includes(userRole)) {
        return {
          user: null,
          error: `Forbidden: Endpoint requires one of roles: ${allowedRoles.join(", ")}`,
          status: 403,
        };
      }
    }

    return {
      user: authenticatedUser,
      error: null,
      status: 200,
    };
  } catch (err) {
    console.error("[Supabase Auth] Verification error:", err);
    return {
      user: null,
      error: "Unauthorized: Authentication verification failed",
      status: 401,
    };
  }
}

/**
 * Legacy wrapper: strictly validates that the user role is STUDENT.
 */
export async function getAuthenticatedStudent(
  request: NextRequest | Request
): Promise<{ student: AuthenticatedStudent | null; error: string | null; status: number }> {
  const { user, error, status } = await getAuthenticatedUser(request, ["STUDENT"]);
  return {
    student: user as AuthenticatedStudent | null,
    error,
    status
  };
}

/**
 * Legacy wrapper: strictly validates that the user role is RECRUITER.
 */
export async function getAuthenticatedRecruiter(
  request: NextRequest | Request
): Promise<{ recruiter: AuthenticatedRecruiter | null; error: string | null; status: number }> {
  const { user, error, status } = await getAuthenticatedUser(request, ["RECRUITER"]);
  return {
    recruiter: user as AuthenticatedRecruiter | null,
    error,
    status
  };
}
