import { NextRequest, NextResponse } from "next/server";
import { TrustSafetyEngine } from "@/lib/trust-safety-engine";
import { requireRole } from "@/lib/authorization";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { TrustSafetyEntityType, ReportPriority } from "@/types";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const roleUpper = (user.role || "").toUpperCase();
  const isAdmin = ["PLATFORM_ADMIN", "SUPER_ADMIN", "ADMIN", "VERIFICATION_OFFICER", "COLLEGE_ADMIN"].includes(roleUpper);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const category = searchParams.get("category") || undefined;
  const moderatorId = searchParams.get("moderatorId") || undefined;
  const targetId = searchParams.get("targetId") || undefined;

  // If not admin, restrict to reports submitted by this user
  const reporterId = isAdmin ? (searchParams.get("reporterId") || undefined) : user.userId;

  const reports = TrustSafetyEngine.getAllReports({
    search,
    status,
    priority,
    entityType,
    category,
    assignedModeratorId: moderatorId,
    reporterId,
    targetId,
  });

  // Non-admins should not see internal moderator notes
  const sanitizedReports = isAdmin
    ? reports
    : reports.map((r) => {
        const { internalNotes, ...rest } = r;
        return {
          ...rest,
          internalNotes: [], // stripped for privacy
        };
      });

  return NextResponse.json({
    success: true,
    count: sanitizedReports.length,
    reports: sanitizedReports,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required to submit a report" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      entityType,
      targetId,
      targetTitle,
      reportedUserId,
      reportedUserName,
      reportedCompanyId,
      reportedCompanyName,
      reportedOpportunityId,
      reportedContentId,
      category,
      description,
      evidence,
      additionalInfo,
      priority,
    } = body;

    if (!entityType || !targetId || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: entityType, targetId, category, description are mandatory.",
        },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a detailed description (minimum 10 characters).",
        },
        { status: 400 }
      );
    }

    const newReport = TrustSafetyEngine.createReport({
      reporterId: user.userId,
      reporterName: user.name || "Anonymous Student",
      reporterEmail: user.email,
      reporterRole: user.role,
      entityType: entityType as TrustSafetyEntityType,
      targetId,
      targetTitle: targetTitle || `${entityType} #${targetId}`,
      reportedUserId,
      reportedUserName,
      reportedCompanyId,
      reportedCompanyName,
      reportedOpportunityId,
      reportedContentId,
      category,
      description: description.trim(),
      evidence,
      additionalInfo,
      priority: priority as ReportPriority,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your report has been submitted successfully. Our Trust & Safety team will review it.",
        caseNumber: newReport.caseNumber,
        report: newReport,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}
