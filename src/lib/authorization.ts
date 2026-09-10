import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, AuthenticatedUser } from "./supabase/server";

/**
 * Ensures the request is authenticated and the user has one of the allowed roles.
 * Returns the authenticated user, or a NextResponse to halt the request.
 */
export async function requireRole(
  request: NextRequest | Request,
  allowedRoles: string[]
): Promise<{ user: AuthenticatedUser | null; errorResponse: NextResponse | null }> {
  const { user, error, status } = await getAuthenticatedUser(request, allowedRoles);

  if (!user || error) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: error || "Unauthorized" }, { status: status || 401 }),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Validates Object-Level Authorization to prevent IDOR vulnerabilities.
 * Checks if the user's organizational context matches the target resource's context.
 */
export function authorizeResourceAccess(
  user: AuthenticatedUser,
  resource: { companyId?: string; collegeId?: string; userId?: string }
): boolean {
  // Super Admins and Platform Admins can access all resources
  if (["SUPER_ADMIN", "PLATFORM_ADMIN"].includes(user.role)) {
    return true;
  }

  // Company Admins & Recruiters can only access resources belonging to their company
  if (["COMPANY_ADMIN", "RECRUITER"].includes(user.role)) {
    if (resource.companyId && user.company_id === resource.companyId) {
      return true;
    }
    return false; // Strict deny if they are trying to access another company's resource or a resource without a company
  }

  // College Admins and Placement Officers can only access resources belonging to their college
  if (["COLLEGE_ADMIN", "COLLEGE_PLACEMENT_OFFICER"].includes(user.role)) {
    if (resource.collegeId && user.college_id === resource.collegeId) {
      return true;
    }
    return false;
  }

  // Students can only access their own resources
  if (user.role === "STUDENT") {
    if (resource.userId && user.id === resource.userId) {
      return true;
    }
    return false;
  }

  // Default deny
  return false;
}

/**
 * Implements Mass Assignment protection by aggressively stripping out 
 * any sensitive keys from incoming JSON bodies.
 */
export function stripPrivilegedFields(payload: Record<string, any>): Record<string, any> {
  const privilegedFields = [
    "role",
    "account_status",
    "verification_status",
    "company_id",
    "college_id",
    "is_verified",
    "id", // Prevent ID reassignment
  ];

  const sanitized = { ...payload };

  privilegedFields.forEach((field) => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });

  return sanitized;
}
