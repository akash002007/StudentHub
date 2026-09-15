import { StudentProfile } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "./server-store";
import { getAuthenticatedStudent } from "./supabase/server";
import { isStudentVerified, normalizeVerificationStatus } from "./student-access-policy";

/**
 * Centralized API route authorization helper.
 * Reusable across all sensitive student write/read endpoints.
 * Returns 403 Forbidden with standard code and message when verification is required.
 */
export async function requireVerifiedStudent(
  req: NextRequest,
  explicitStudentId?: string
): Promise<
  | { authorized: true; student: StudentProfile }
  | { authorized: false; errorResponse: NextResponse }
> {
  let studentId = explicitStudentId;

  if (!studentId) {
    try {
      const url = new URL(req.url);
      studentId =
        url.searchParams.get("studentId") ||
        url.searchParams.get("userId") ||
        undefined;
    } catch {
      // Ignore
    }
  }

  if (!studentId) {
    // Try Supabase auth
    try {
      const auth = await getAuthenticatedStudent(req);
      if (auth.student?.id) {
        studentId = auth.student.id;
      }
    } catch {
      // Ignore and fallback
    }
  }

  if (!studentId) {
    studentId = "student_01";
  }

  const student = ServerStore.getStudentProfileById(studentId);
  if (!student) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          code: "STUDENT_NOT_FOUND",
          error: "Student profile not found.",
        },
        { status: 404 }
      ),
    };
  }

  const verified = isStudentVerified(student);
  if (!verified) {
    const norm = normalizeVerificationStatus(student.verificationStatus);
    let message = "Student verification is required to perform this action.";

    if (norm === "MANUAL_REVIEW_REQUESTED" || norm === "UNDER_REVIEW") {
      message = "Your account is currently under verification review.";
    } else if (norm === "REJECTED") {
      message = student.rejectionReason
        ? `Your verification request was rejected: ${student.rejectionReason}`
        : "Your verification request was rejected. Please submit a new verification attempt.";
    } else if (norm === "VERIFICATION_FAILED") {
      message = "Your automated verification failed. Please try again or request manual review.";
    }

    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          code: "VERIFICATION_REQUIRED",
          message,
          verificationStatus: student.verificationStatus,
          accountAccessStatus: student.accountAccessStatus || "RESTRICTED",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    student,
  };
}
