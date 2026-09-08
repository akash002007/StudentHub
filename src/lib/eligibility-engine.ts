import {
  EligibilityCriteria,
  EligibilityEvaluationResult,
  EligibilityItemResult,
  StudentProfile,
} from "@/types";

/**
 * Normalizes strings for robust case-insensitive comparison
 */
function normalize(str: string | undefined | null): string {
  return (str || "").trim().toLowerCase();
}

/**
 * Evaluates a candidate student profile against a recruitment drive's structured eligibility criteria.
 * Produces deterministic status: ELIGIBLE, NOT_ELIGIBLE, or REQUIRES_MANUAL_REVIEW.
 * Includes detailed itemized explanation of every evaluated criterion.
 */
export function evaluateCandidateEligibility(
  student: Partial<StudentProfile> & {
    backlogs?: number;
    experienceYears?: number;
  },
  criteria: EligibilityCriteria
): EligibilityEvaluationResult {
  const itemResults: EligibilityItemResult[] = [];
  const missingFields: string[] = [];

  // 1. Degree Evaluation
  if (criteria.degrees && criteria.degrees.length > 0) {
    const studentDegree = student.degree || "";
    if (!studentDegree) {
      missingFields.push("Degree");
      itemResults.push({
        name: "Degree Qualification",
        passed: false,
        required: criteria.degrees.join(", "),
        candidateValue: "Not Provided",
        isMissingInfo: true,
        details: "Candidate degree is missing from profile.",
      });
    } else {
      const normalizedStudentDeg = normalize(studentDegree);
      const isMatch = criteria.degrees.some((d) => {
        const normD = normalize(d);
        return (
          normD === normalizedStudentDeg ||
          normalizedStudentDeg.includes(normD) ||
          normD.includes(normalizedStudentDeg)
        );
      });
      itemResults.push({
        name: "Degree Qualification",
        passed: isMatch,
        required: criteria.degrees.join(", "),
        candidateValue: studentDegree,
        details: isMatch
          ? `Candidate degree (${studentDegree}) matches required degrees.`
          : `Candidate degree (${studentDegree}) does not match required (${criteria.degrees.join(", ")}).`,
      });
    }
  }

  // 2. Branch / Stream Evaluation
  if (criteria.branches && criteria.branches.length > 0) {
    const studentBranch = student.branch || student.specialization || "";
    if (!studentBranch) {
      missingFields.push("Branch / Specialization");
      itemResults.push({
        name: "Branch / Discipline",
        passed: false,
        required: criteria.branches.join(", "),
        candidateValue: "Not Provided",
        isMissingInfo: true,
        details: "Candidate branch is missing from profile.",
      });
    } else {
      const normalizedStudentBranch = normalize(studentBranch);
      const isMatch = criteria.branches.some((b) => {
        const normB = normalize(b);
        return (
          normB === normalizedStudentBranch ||
          normalizedStudentBranch.includes(normB) ||
          normB.includes(normalizedStudentBranch) ||
          (normB.includes("computer") && normalizedStudentBranch.includes("cse")) ||
          (normB.includes("cse") && normalizedStudentBranch.includes("computer")) ||
          (normB.includes("information") && normalizedStudentBranch.includes("it")) ||
          (normB.includes("it") && normalizedStudentBranch.includes("information"))
        );
      });
      itemResults.push({
        name: "Branch / Discipline",
        passed: isMatch,
        required: criteria.branches.join(", "),
        candidateValue: studentBranch,
        details: isMatch
          ? `Branch (${studentBranch}) is eligible.`
          : `Branch (${studentBranch}) is not in eligible branches (${criteria.branches.join(", ")}).`,
      });
    }
  }

  // 3. Minimum CGPA Evaluation
  if (criteria.minCgpa !== undefined && criteria.minCgpa > 0) {
    const rawCgpa = student.cgpa;
    const numCgpa = rawCgpa ? parseFloat(String(rawCgpa).replace(/[^0-9.]/g, "")) : NaN;
    if (isNaN(numCgpa)) {
      missingFields.push("CGPA");
      itemResults.push({
        name: "Minimum CGPA",
        passed: false,
        required: `>= ${criteria.minCgpa.toFixed(2)}`,
        candidateValue: rawCgpa || "Not Provided",
        isMissingInfo: true,
        details: "CGPA value is invalid or missing.",
      });
    } else {
      const isPassed = numCgpa >= criteria.minCgpa;
      itemResults.push({
        name: "Minimum CGPA",
        passed: isPassed,
        required: `>= ${criteria.minCgpa.toFixed(2)}`,
        candidateValue: `${numCgpa.toFixed(2)}`,
        details: isPassed
          ? `CGPA ${numCgpa.toFixed(2)} meets minimum requirement of ${criteria.minCgpa.toFixed(2)}.`
          : `CGPA ${numCgpa.toFixed(2)} is below minimum requirement of ${criteria.minCgpa.toFixed(2)}.`,
      });
    }
  }

  // 4. Maximum Allowed Active Backlogs Evaluation
  if (criteria.maxBacklogs !== undefined) {
    const backlogs = typeof student.backlogs === "number" ? student.backlogs : 0;
    const isPassed = backlogs <= criteria.maxBacklogs;
    itemResults.push({
      name: "Maximum Backlogs",
      passed: isPassed,
      required: `<= ${criteria.maxBacklogs} active backlog(s)`,
      candidateValue: `${backlogs} backlog(s)`,
      details: isPassed
        ? `Candidate backlogs (${backlogs}) within allowable limit (${criteria.maxBacklogs}).`
        : `Candidate has ${backlogs} backlogs, exceeding maximum allowed (${criteria.maxBacklogs}).`,
    });
  }

  // 5. Graduation Year Range / Cohort
  if (
    criteria.gradYears && criteria.gradYears.length > 0
  ) {
    const gradYear = student.graduationYear;
    if (!gradYear) {
      missingFields.push("Graduation Year");
      itemResults.push({
        name: "Graduation Cohort",
        passed: false,
        required: criteria.gradYears.join(", "),
        candidateValue: "Not Provided",
        isMissingInfo: true,
        details: "Graduation year missing from profile.",
      });
    } else {
      const isMatch = criteria.gradYears.includes(Number(gradYear));
      itemResults.push({
        name: "Graduation Cohort",
        passed: isMatch,
        required: criteria.gradYears.join(", "),
        candidateValue: `${gradYear}`,
        details: isMatch
          ? `Graduation year ${gradYear} is eligible.`
          : `Graduation year ${gradYear} is outside eligible cohort (${criteria.gradYears.join(", ")}).`,
      });
    }
  } else if (criteria.gradYearMin || criteria.gradYearMax) {
    const gradYear = student.graduationYear;
    const min = criteria.gradYearMin || 1900;
    const max = criteria.gradYearMax || 2100;
    if (!gradYear) {
      missingFields.push("Graduation Year");
      itemResults.push({
        name: "Graduation Cohort",
        passed: false,
        required: `${min} – ${max}`,
        candidateValue: "Not Provided",
        isMissingInfo: true,
        details: "Graduation year missing from profile.",
      });
    } else {
      const isMatch = gradYear >= min && gradYear <= max;
      itemResults.push({
        name: "Graduation Cohort",
        passed: isMatch,
        required: `${min} – ${max}`,
        candidateValue: `${gradYear}`,
        details: isMatch
          ? `Graduation year ${gradYear} is within ${min} – ${max}.`
          : `Graduation year ${gradYear} is outside eligible range (${min} – ${max}).`,
      });
    }
  }

  // 6. Required Skills Evaluation
  if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
    const candidateSkills = (student.skills || []).map(normalize);
    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];

    criteria.requiredSkills.forEach((reqSkill) => {
      const normReq = normalize(reqSkill);
      const hasSkill = candidateSkills.some(
        (candSkill) => candSkill.includes(normReq) || normReq.includes(candSkill)
      );
      if (hasSkill) {
        matchedRequired.push(reqSkill);
      } else {
        missingRequired.push(reqSkill);
      }
    });

    const passed = missingRequired.length === 0;
    itemResults.push({
      name: "Required Technical Skills",
      passed,
      required: criteria.requiredSkills.join(", "),
      candidateValue: matchedRequired.length > 0 ? matchedRequired.join(", ") : "None matched",
      details: passed
        ? `All required skills demonstrated (${matchedRequired.join(", ")}).`
        : `Missing required skills: ${missingRequired.join(", ")}.`,
    });
  }

  // 7. Location & Remote Policy
  if (criteria.eligibleLocations && criteria.eligibleLocations.length > 0) {
    if (criteria.remoteAllowed) {
      itemResults.push({
        name: "Location / Work Mode",
        passed: true,
        required: `${criteria.eligibleLocations.join(", ")} (Remote Allowed)`,
        candidateValue: student.location || "Remote",
        details: "Candidate eligible via remote work policy.",
      });
    } else {
      const candLoc = normalize(student.location);
      const isMatch = criteria.eligibleLocations.some((loc) => {
        const normLoc = normalize(loc);
        return candLoc.includes(normLoc) || normLoc.includes(candLoc);
      });
      itemResults.push({
        name: "Location Requirement",
        passed: isMatch,
        required: criteria.eligibleLocations.join(", "),
        candidateValue: student.location || "Not specified",
        details: isMatch
          ? `Location (${student.location}) meets requirements.`
          : `Location (${student.location}) is outside required areas (${criteria.eligibleLocations.join(", ")}).`,
      });
    }
  }

  // Calculate Overall Status and Score
  const totalCount = itemResults.length;
  const passedCount = itemResults.filter((r) => r.passed).length;
  const hasMissingCritical = itemResults.some((r) => r.isMissingInfo);
  const allPassed = passedCount === totalCount && totalCount > 0;

  let status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'REQUIRES_MANUAL_REVIEW';
  if (allPassed) {
    status = 'ELIGIBLE';
  } else if (hasMissingCritical && passedCount >= totalCount - 1) {
    status = 'REQUIRES_MANUAL_REVIEW';
  } else {
    status = 'NOT_ELIGIBLE';
  }

  const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

  return {
    status,
    score,
    criteria: itemResults,
    passedCount,
    totalCount,
    missingFields,
    evaluatedAt: new Date().toISOString(),
  };
}
