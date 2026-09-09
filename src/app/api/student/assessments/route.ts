import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent } from "@/lib/supabase/server";
import {
  getStudentAssessments,
  getRecruitmentDriveById,
} from "@/lib/recruitment-store";
import {
  getAssessmentConfigs,
  getAssessmentAttempt,
} from "@/lib/assessment-engine";
import { AssessmentRecord } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 401 });
    }
    const student = auth.student;
    const studentId = student.id;

    const legacyAssessments = getStudentAssessments(studentId);

    // Also find any AssessmentRecord assigned to this candidate
    const allConfigs = getAssessmentConfigs();
    const assignedConfigs = allConfigs.filter((cfg: AssessmentRecord) =>
      cfg.assignedCandidateIds.includes(studentId) ||
      cfg.assignedCandidateIds.includes("student") ||
      cfg.assignedCandidateIds.includes("student_123")
    );

    // Merge & enrich
    const enrichedList: any[] = [];

    assignedConfigs.forEach((cfg: AssessmentRecord) => {
      const drive = getRecruitmentDriveById(cfg.driveId);
      const attempt = getAssessmentAttempt(cfg.id, studentId);


      enrichedList.push({
        id: cfg.id,
        assessmentConfigId: cfg.id,
        driveId: cfg.driveId,
        driveTitle: cfg.driveTitle || drive?.title || "Recruitment Drive",
        company: cfg.companyName || drive?.company || "Company",
        companyLogo: drive?.companyLogo,
        assessmentName: cfg.title,
        description: cfg.description,
        instructions: cfg.instructions,
        duration: `${cfg.durationMinutes} mins`,
        durationMinutes: cfg.durationMinutes,
        maxScore: cfg.totalMarks,
        passingScore: cfg.passingMarks,
        passingPercentage: cfg.passingPercentage,
        questionCount: cfg.questionSnapshots?.length || 0,
        mode: cfg.mode,
        category: cfg.category,
        candidateScore: attempt?.totalScore,
        percentage: attempt?.percentage,
        passed: attempt?.passed,
        attemptStatus: attempt?.status || "NOT_STARTED",
        attemptId: attempt?.id,
        date: cfg.startDateTime ? cfg.startDateTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
        time: "Online Proctored",
        startDateTime: cfg.startDateTime,
        endDateTime: cfg.endDateTime,
        hasFullProctoring: cfg.mode === "PROCTORED",
        proctoringConfig: cfg.proctoringConfig,
        candidateRules: cfg.candidateRules,
      });
    });

    // Also include any legacy assessment records not already matched
    legacyAssessments.forEach((ass) => {
      if (!enrichedList.some((e) => e.driveId === ass.driveId && e.assessmentName === ass.assessmentName)) {
        const drive = getRecruitmentDriveById(ass.driveId);
        enrichedList.push({
          ...ass,
          driveTitle: drive?.title || "Recruitment Drive",
          company: drive?.company || "Company",
          companyLogo: drive?.companyLogo,
          attemptStatus: ass.candidateScore !== undefined ? "SUBMITTED" : "NOT_STARTED",
        });
      }
    });

    return NextResponse.json({
      success: true,
      assessments: enrichedList,
      totalCount: enrichedList.length,
    });
  } catch (err) {
    console.error("[GET /api/student/assessments] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

