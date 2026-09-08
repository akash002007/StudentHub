import { StageWeights } from "@/types";

export interface ScoreCandidateInput {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  university: string;
  degree?: string;
  branch?: string;
  assessmentScore?: number; // 0-100
  interviewScore?: number;  // 0-100
  technicalScore?: number;  // 0-100
  communicationScore?: number; // 0-100
  cgpa?: string;
  selectionStatus?: 'SELECTED' | 'WAITLISTED' | 'REJECTED';
  notes?: string;
}

export interface RankedCandidateResult {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  university: string;
  degree?: string;
  branch?: string;
  rank: number;
  assessmentScore: number;
  interviewScore: number;
  finalScore: number;
  selectionStatus: 'SELECTED' | 'WAITLISTED' | 'REJECTED';
  notes?: string;
}

/**
 * Computes transparent weighted composite scores and ranks candidates.
 * Formula:
 * Final Score = (AssessmentScore * AssessmentWeight%) + (InterviewScore * InterviewWeight%)
 * Tie-breaker: Interview Score > Assessment Score > CGPA.
 */
export function calculateMeritRanking(
  candidates: ScoreCandidateInput[],
  weights: StageWeights = { assessmentWeight: 60, interviewWeight: 40 }
): RankedCandidateResult[] {
  const totalWeight = (weights.assessmentWeight || 60) + (weights.interviewWeight || 40);
  const normAssessmentWeight = totalWeight > 0 ? (weights.assessmentWeight || 60) / totalWeight : 0.6;
  const normInterviewWeight = totalWeight > 0 ? (weights.interviewWeight || 40) / totalWeight : 0.4;

  const scored = candidates.map((cand) => {
    const rawAssess = typeof cand.assessmentScore === "number" ? cand.assessmentScore : 0;
    
    // If interview score is explicitly present or derived from technical/comm scores
    let rawInterview = typeof cand.interviewScore === "number" ? cand.interviewScore : 0;
    if (!rawInterview && (cand.technicalScore !== undefined || cand.communicationScore !== undefined)) {
      const tech = cand.technicalScore || 0;
      const comm = cand.communicationScore || 0;
      rawInterview = Math.round((tech * 0.6) + (comm * 0.4));
    }

    const finalScore = Math.round(
      (rawAssess * normAssessmentWeight) + (rawInterview * normInterviewWeight)
    );

    const numCgpa = cand.cgpa ? parseFloat(String(cand.cgpa).replace(/[^0-9.]/g, "")) || 0 : 0;

    return {
      applicationId: cand.applicationId,
      studentId: cand.studentId,
      studentName: cand.studentName,
      studentAvatar: cand.studentAvatar,
      university: cand.university,
      degree: cand.degree,
      branch: cand.branch,
      assessmentScore: rawAssess,
      interviewScore: rawInterview,
      finalScore,
      numCgpa,
      selectionStatus: cand.selectionStatus || 'WAITLISTED',
      notes: cand.notes,
    };
  });

  // Sort descending: finalScore -> interviewScore -> assessmentScore -> numCgpa
  scored.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.interviewScore !== a.interviewScore) return b.interviewScore - a.interviewScore;
    if (b.assessmentScore !== a.assessmentScore) return b.assessmentScore - a.assessmentScore;
    return b.numCgpa - a.numCgpa;
  });

  // Assign ranks
  return scored.map((cand, index) => ({
    applicationId: cand.applicationId,
    studentId: cand.studentId,
    studentName: cand.studentName,
    studentAvatar: cand.studentAvatar,
    university: cand.university,
    degree: cand.degree,
    branch: cand.branch,
    rank: index + 1,
    assessmentScore: cand.assessmentScore,
    interviewScore: cand.interviewScore,
    finalScore: cand.finalScore,
    selectionStatus: cand.selectionStatus,
    notes: cand.notes,
  }));
}
