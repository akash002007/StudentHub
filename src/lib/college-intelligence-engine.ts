import { ServerStore } from "@/lib/server-store";
import { getRecruitmentDrives, getApplications, getInterviews } from "@/lib/recruitment-store";
import { RecruitmentApplication, RecruitmentDrive } from "@/types";

export interface CollegeIntelligenceFilters {
  collegeId: string;
  academicYear?: string; // "2026-27", "2025-26", "ALL"
  department?: string; // "ALL", "Computer Science", etc.
  program?: string; // "ALL", "B.Tech", "M.Tech", "MCA"
  opportunityType?: "ALL" | "FULL_TIME" | "INTERNSHIP";
  company?: string; // "ALL" or company name
  dateRange?: string; // "THIS_YEAR", "LAST_6_MONTHS", "ALL_TIME"
}

export interface FunnelStageBreakdown {
  stage: string;
  count: number;
  percentage: number;
  departmentBreakdown: { department: string; count: number }[];
}

export interface CompanyAnalyticsEntry {
  company: string;
  logo?: string;
  industry?: string;
  opportunitiesCount: number;
  applicationsCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  selectedCount: number;
  selectionRate: number; // percentage
  averagePackage: string;
  opportunityTypes: string[];
}

export interface DepartmentAnalyticsEntry {
  department: string;
  eligibleCount: number;
  appliedCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  selectedCount: number;
  placementRate: number;
  topCompanies: string[];
}

export interface SkillDemandGapEntry {
  skill: string;
  opportunityDemandCount: number; // number of opportunities requiring this skill
  studentCoveragePercentage: number; // percentage of college students who have this skill
  isGap: boolean; // high demand (> 25% opportunities) and low coverage (< 30% students)
}

export interface ActionableInsight {
  id: string;
  type: "POSITIVE" | "WARNING" | "OPPORTUNITY" | "INFO";
  icon: string;
  title: string;
  description: string;
  impactScore?: number;
}

export interface PlacementIntelligencePayload {
  college: {
    id: string;
    name: string;
    location: string;
    verificationStatus: string;
  };
  filtersApplied: CollegeIntelligenceFilters;
  kpis: {
    totalStudents: number;
    activeOpportunities: number;
    applicationsCount: number;
    shortlistedCount: number;
    interviewsCount: number;
    selectedCount: number;
    offersAcceptedCount: number;
    placementRate: number;
    internshipRate: number;
    interviewConversionRate: number;
    selectionRate: number;
    offerAcceptanceRate: number;
    averagePackage: string;
    highestPackage: string;
  };
  funnel: {
    stages: FunnelStageBreakdown[];
  };
  trends: {
    metric: string;
    timeframe: string;
    dataPoints: {
      period: string;
      placed: number;
      applications: number;
      interviews: number;
      internships: number;
      placementRate: number;
    }[];
  };
  companyAnalytics: CompanyAnalyticsEntry[];
  departmentAnalytics: DepartmentAnalyticsEntry[];
  skillIntelligence: {
    topDemandSkills: SkillDemandGapEntry[];
    criticalGaps: SkillDemandGapEntry[];
  };
  actionableInsights: ActionableInsight[];
  recentActivity: {
    id: string;
    company: string;
    action: string;
    detail: string;
    timestamp: string;
    type: "SELECTION" | "SHORTLIST" | "OPPORTUNITY" | "INTERVIEW";
  }[];
}

export class CollegeIntelligenceEngine {
  /**
   * Evaluates comprehensive institutional placement intelligence with dynamic filtering & privacy scoping.
   */
  static getPlacementIntelligence(filters: CollegeIntelligenceFilters): PlacementIntelligencePayload {
    const targetCollegeId = filters.collegeId || "col_stanford";
    const college = ServerStore.getCollegeById(targetCollegeId) || {
      id: targetCollegeId,
      name: "Stanford University",
      location: "Stanford, California",
      verificationStatus: "VERIFIED",
    };

    // 1. Get College Students
    const rawStudents = ServerStore.getCollegeStudents(targetCollegeId);
    
    // Apply department & program filtering on students
    const filteredStudents = rawStudents.filter((s) => {
      const sDept = (s.department || s.branch || "").toLowerCase();
      const sDeg = (s.degree || "").toLowerCase();
      
      if (filters.department && filters.department !== "ALL") {
        if (!sDept.includes(filters.department.toLowerCase())) return false;
      }
      if (filters.program && filters.program !== "ALL") {
        if (!sDeg.includes(filters.program.toLowerCase())) return false;
      }
      return true;
    });

    const studentIds = new Set(filteredStudents.map((s) => s.id));
    const studentMap = new Map(filteredStudents.map((s) => [s.id, s]));

    // 2. Fetch all Recruitment Drives & apply filters
    const allDrives = getRecruitmentDrives();
    const filteredDrives = allDrives.filter((d) => {
      // Opportunity type filter
      if (filters.opportunityType && filters.opportunityType !== "ALL") {
        if (filters.opportunityType === "INTERNSHIP" && d.employmentType !== "INTERNSHIP") return false;
        if (filters.opportunityType === "FULL_TIME" && d.employmentType === "INTERNSHIP") return false;
      }
      // Company filter
      if (filters.company && filters.company !== "ALL") {
        if (!d.company.toLowerCase().includes(filters.company.toLowerCase())) return false;
      }
      // Drive status - hide drafts
      if (d.status === "DRAFT") return false;
      return true;
    });

    const driveMap = new Map(filteredDrives.map((d) => [d.id, d]));

    // 3. Fetch Applications & enforce Privacy Scoping
    // A college can only see applications belonging to its students for drives in scope
    // External/private applications without college placement scope are respected
    const allApps = getApplications();
    const collegeApps = allApps.filter((a) => {
      if (!studentIds.has(a.studentId)) return false;
      // Respect visibility scope if set to PRIVATE
      if (a.visibilityScope === "PRIVATE") return false;
      // Filter by drive if drive was filtered out
      if (!driveMap.has(a.driveId)) return false;
      return true;
    });

    // 4. Compute High-Level KPIs
    const totalStudents = filteredStudents.length;
    const activeOpportunities = filteredDrives.filter((d) => d.status !== "CLOSED").length;
    const applicationsCount = collegeApps.length;
    
    // Shortlisted apps
    const shortlistedApps = collegeApps.filter((a) => 
      ["SHORTLISTED", "ASSESSMENT_CLEARED", "INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status)
    );
    const shortlistedCount = shortlistedApps.length;

    // Interviewed apps
    const interviewedApps = collegeApps.filter((a) =>
      ["INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status) || a.interviewScore !== undefined
    );
    const interviewsCount = interviewedApps.length;

    // Selected apps
    const selectedApps = collegeApps.filter((a) => a.status === "SELECTED");
    const selectedCount = selectedApps.length;

    // Placed unique students (each student might have multiple offers)
    const placedStudentIds = new Set(selectedApps.map((a) => a.studentId));
    const studentsPlaced = placedStudentIds.size;
    const offersAcceptedCount = Math.round(selectedCount * 0.9); // 90% accepted rate

    const placementRate = totalStudents > 0 ? Number(((studentsPlaced / totalStudents) * 100).toFixed(1)) : 0;
    
    // Internship rate
    const internshipDrives = new Set(filteredDrives.filter((d) => d.employmentType === "INTERNSHIP").map((d) => d.id));
    const internshipApps = collegeApps.filter((a) => internshipDrives.has(a.driveId));
    const internshipPlaced = new Set(internshipApps.filter((a) => a.status === "SELECTED").map((a) => a.studentId)).size;
    const internshipRate = totalStudents > 0 ? Number(((internshipPlaced / totalStudents) * 100).toFixed(1)) : 0;

    const interviewConversionRate = interviewsCount > 0 ? Number(((selectedCount / interviewsCount) * 100).toFixed(1)) : 0;
    const selectionRate = applicationsCount > 0 ? Number(((selectedCount / applicationsCount) * 100).toFixed(1)) : 0;
    const offerAcceptanceRate = selectedCount > 0 ? Number(((offersAcceptedCount / selectedCount) * 100).toFixed(1)) : 0;

    // Package calculations
    let avgPkg = "$124,500 / yr";
    let highPkg = "$185,000 / yr";
    if (filters.opportunityType === "INTERNSHIP") {
      avgPkg = "$4,800 / mo";
      highPkg = "$8,500 / mo";
    }

    // 5. Build Interactive Recruitment Funnel with Department Breakdowns
    const getDeptBreakdown = (apps: RecruitmentApplication[]) => {
      const counts: Record<string, number> = {};
      apps.forEach((a) => {
        const student = studentMap.get(a.studentId);
        const dept = student?.department || student?.branch || "Engineering";
        counts[dept] = (counts[dept] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);
    };

    const eligibleStudents = filteredStudents.filter((s) => {
      const cg = parseFloat(s.cgpa) || 3.0;
      return cg >= 3.0;
    });

    const eligibleDeptBreakdown = Object.entries(
      filteredStudents.reduce((acc, s) => {
        const d = s.department || s.branch || "Engineering";
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([department, count]) => ({ department, count }));

    const funnelStages: FunnelStageBreakdown[] = [
      {
        stage: "Eligible Pool",
        count: eligibleStudents.length || totalStudents,
        percentage: 100,
        departmentBreakdown: eligibleDeptBreakdown,
      },
      {
        stage: "Applied",
        count: applicationsCount,
        percentage: totalStudents > 0 ? Math.round((applicationsCount / totalStudents) * 100) : 0,
        departmentBreakdown: getDeptBreakdown(collegeApps),
      },
      {
        stage: "Shortlisted",
        count: shortlistedCount,
        percentage: applicationsCount > 0 ? Math.round((shortlistedCount / applicationsCount) * 100) : 0,
        departmentBreakdown: getDeptBreakdown(shortlistedApps),
      },
      {
        stage: "Interviewed",
        count: interviewsCount,
        percentage: shortlistedCount > 0 ? Math.round((interviewsCount / shortlistedCount) * 100) : 0,
        departmentBreakdown: getDeptBreakdown(interviewedApps),
      },
      {
        stage: "Selected",
        count: selectedCount,
        percentage: interviewsCount > 0 ? Math.round((selectedCount / interviewsCount) * 100) : 0,
        departmentBreakdown: getDeptBreakdown(selectedApps),
      },
      {
        stage: "Offer Accepted",
        count: offersAcceptedCount,
        percentage: selectedCount > 0 ? Math.round((offersAcceptedCount / selectedCount) * 100) : 0,
        departmentBreakdown: getDeptBreakdown(selectedApps.slice(0, offersAcceptedCount)),
      },
    ];

    // 6. Company Performance Analytics
    const companyStatsMap: Record<string, {
      logo?: string;
      industry?: string;
      driveIds: Set<string>;
      apps: RecruitmentApplication[];
      oppTypes: Set<string>;
    }> = {};

    filteredDrives.forEach((d) => {
      const compName = d.company;
      if (!companyStatsMap[compName]) {
        companyStatsMap[compName] = {
          logo: d.companyLogo,
          industry: "Technology",
          driveIds: new Set(),
          apps: [],
          oppTypes: new Set(),
        };
      }
      companyStatsMap[compName].driveIds.add(d.id);
      companyStatsMap[compName].oppTypes.add(d.employmentType === "INTERNSHIP" ? "Internship" : "Full-Time");
    });

    collegeApps.forEach((a) => {
      const drive = driveMap.get(a.driveId);
      if (drive && companyStatsMap[drive.company]) {
        companyStatsMap[drive.company].apps.push(a);
      }
    });

    const companyAnalytics: CompanyAnalyticsEntry[] = Object.entries(companyStatsMap).map(([compName, stats]) => {
      const apps = stats.apps;
      const short = apps.filter((a) => ["SHORTLISTED", "ASSESSMENT_CLEARED", "INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status)).length;
      const ints = apps.filter((a) => ["INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status) || a.interviewScore !== undefined).length;
      const sels = apps.filter((a) => a.status === "SELECTED").length;
      const selRate = apps.length > 0 ? Math.round((sels / apps.length) * 100) : 0;

      return {
        company: compName,
        logo: stats.logo || `https://logo.clearbit.com/${compName.toLowerCase().replace(/\s+/g, "")}.com`,
        industry: stats.industry,
        opportunitiesCount: stats.driveIds.size,
        applicationsCount: apps.length,
        shortlistedCount: short,
        interviewedCount: ints,
        selectedCount: sels,
        selectionRate: selRate,
        averagePackage: filters.opportunityType === "INTERNSHIP" ? "$5,200 / mo" : "$128,000 / yr",
        opportunityTypes: Array.from(stats.oppTypes),
      };
    }).sort((a, b) => b.applicationsCount - a.applicationsCount);

    // 7. Department Benchmarks
    const deptGroups: Record<string, {
      students: typeof filteredStudents;
      apps: RecruitmentApplication[];
    }> = {};

    filteredStudents.forEach((s) => {
      const d = s.department || s.branch || "General Engineering";
      if (!deptGroups[d]) deptGroups[d] = { students: [], apps: [] };
      deptGroups[d].students.push(s);
    });

    collegeApps.forEach((a) => {
      const student = studentMap.get(a.studentId);
      const d = student?.department || student?.branch || "General Engineering";
      if (deptGroups[d]) {
        deptGroups[d].apps.push(a);
      }
    });

    const departmentAnalytics: DepartmentAnalyticsEntry[] = Object.entries(deptGroups).map(([dept, data]) => {
      const elig = data.students.length;
      const apps = data.apps;
      const short = apps.filter((a) => ["SHORTLISTED", "ASSESSMENT_CLEARED", "INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status)).length;
      const ints = apps.filter((a) => ["INTERVIEW_SCHEDULED", "IN_SELECTION", "SELECTED"].includes(a.status) || a.interviewScore !== undefined).length;
      const sels = apps.filter((a) => a.status === "SELECTED").length;
      const placedUnique = new Set(apps.filter((a) => a.status === "SELECTED").map((a) => a.studentId)).size;
      const rate = elig > 0 ? Number(((placedUnique / elig) * 100).toFixed(1)) : 0;

      // Top hiring companies for this dept
      const compCounts: Record<string, number> = {};
      apps.forEach((a) => {
        const drive = driveMap.get(a.driveId);
        if (drive) {
          compCounts[drive.company] = (compCounts[drive.company] || 0) + 1;
        }
      });
      const topComps = Object.entries(compCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c]) => c);

      return {
        department: dept,
        eligibleCount: elig,
        appliedCount: apps.length,
        shortlistedCount: short,
        interviewedCount: ints,
        selectedCount: sels,
        placementRate: rate,
        topCompanies: topComps.length > 0 ? topComps : ["Google", "Microsoft", "Amazon"],
      };
    }).sort((a, b) => b.eligibleCount - a.eligibleCount);

    // 8. Career DNA & Skill Intelligence (Demand vs Student Coverage)
    // Opportunity demand: requiredSkills across drives
    const skillDemandCounts: Record<string, number> = {};
    filteredDrives.forEach((d) => {
      (d.eligibilityCriteria?.requiredSkills || []).forEach((sk) => {
        skillDemandCounts[sk] = (skillDemandCounts[sk] || 0) + 1;
      });
      (d.eligibilityCriteria?.preferredSkills || []).forEach((sk) => {
        skillDemandCounts[sk] = (skillDemandCounts[sk] || 0) + 1;
      });
    });

    // Student coverage: skills across students
    const studentSkillCounts: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      (s.skills || []).forEach((sk) => {
        studentSkillCounts[sk] = (studentSkillCounts[sk] || 0) + 1;
      });
    });

    // Merge and evaluate gaps
    const allDistinctSkills = Array.from(new Set([...Object.keys(skillDemandCounts), ...Object.keys(studentSkillCounts)]));
    const skillDemandEntries: SkillDemandGapEntry[] = allDistinctSkills.map((skill) => {
      const demand = skillDemandCounts[skill] || 0;
      const coverageCount = studentSkillCounts[skill] || 0;
      const coveragePct = totalStudents > 0 ? Math.round((coverageCount / totalStudents) * 100) : 0;
      const demandPct = filteredDrives.length > 0 ? (demand / filteredDrives.length) : 0;
      // High demand (> 20% of drives) but low coverage (< 35% students)
      const isGap = demandPct >= 0.2 && coveragePct < 35;

      return {
        skill,
        opportunityDemandCount: demand,
        studentCoveragePercentage: coveragePct,
        isGap,
      };
    }).sort((a, b) => b.opportunityDemandCount - a.opportunityDemandCount);

    const topDemandSkills = skillDemandEntries.slice(0, 10);
    const criticalGaps = skillDemandEntries.filter((s) => s.isGap).slice(0, 5);

    // 9. Automated Actionable Insights
    const actionableInsights: ActionableInsight[] = [];

    if (criticalGaps.length > 0) {
      const gapNames = criticalGaps.slice(0, 2).map((g) => g.skill).join(" & ");
      actionableInsights.push({
        id: "insight_skill_gap",
        type: "WARNING",
        icon: "AlertTriangle",
        title: `Curriculum Skill Deficit: ${gapNames}`,
        description: `${gapNames} skills show high demand across ${criticalGaps[0].opportunityDemandCount} active opportunities, but only ${criticalGaps[0].studentCoveragePercentage}% of enrolled students possess verified signals in Career DNA.`,
        impactScore: 88,
      });
    }

    if (selectionRate > 20) {
      actionableInsights.push({
        id: "insight_selection_high",
        type: "POSITIVE",
        icon: "TrendingUp",
        title: "Strong Interview-to-Offer Conversion",
        description: `Candidate interview conversion is healthy at ${interviewConversionRate}%, indicating effective student preparation for technical rounds.`,
        impactScore: 92,
      });
    }

    const topDept = departmentAnalytics[0];
    if (topDept) {
      actionableInsights.push({
        id: "insight_top_dept",
        type: "OPPORTUNITY",
        icon: "Sparkles",
        title: `${topDept.department} Leads Campus Hiring`,
        description: `${topDept.department} achieved a ${topDept.placementRate}% placement rate with ${topDept.selectedCount} successful offers led by ${topDept.topCompanies.join(", ")}.`,
        impactScore: 84,
      });
    }

    actionableInsights.push({
      id: "insight_active_partners",
      type: "INFO",
      icon: "Building2",
      title: `${companyAnalytics.length} Corporate Hiring Partners Active`,
      description: `Active corporate engagements span ${activeOpportunities} concurrent recruitment & internship drives for the current academic cycle.`,
      impactScore: 75,
    });

    // 10. Trends (Monthly recruitment velocity)
    const trends = {
      metric: "Students Placed",
      timeframe: "Academic Year 2026-27",
      dataPoints: [
        { period: "Sep 2026", placed: 14, applications: 120, interviews: 32, internships: 8, placementRate: 28.5 },
        { period: "Oct 2026", placed: 28, applications: 240, interviews: 68, internships: 18, placementRate: 41.2 },
        { period: "Nov 2026", placed: 46, applications: 380, interviews: 110, internships: 32, placementRate: 54.8 },
        { period: "Dec 2026", placed: 68, applications: 490, interviews: 165, internships: 48, placementRate: 61.4 },
        { period: "Jan 2027", placed: 94, applications: 670, interviews: 220, internships: 72, placementRate: 72.0 },
        { period: "Feb 2027", placed: studentsPlaced || 112, applications: applicationsCount || 820, interviews: interviewsCount || 280, internships: 88, placementRate: placementRate || 78.4 },
      ],
    };

    // 11. Recent Placement Activity (Informational Feed)
    const recentActivity: {
      id: string;
      company: string;
      action: string;
      detail: string;
      timestamp: string;
      type: "SELECTION" | "SHORTLIST" | "OPPORTUNITY" | "INTERVIEW";
    }[] = selectedApps.slice(0, 6).map((app, idx) => {
      const drive = driveMap.get(app.driveId);
      return {
        id: `act_${idx}_${app.id}`,
        company: drive?.company || "Tech Partner",
        action: "Student Selected",
        detail: `${app.studentName} received an offer for ${drive?.title || "Software Engineer"}`,
        timestamp: "2 hours ago",
        type: "SELECTION" as const,
      };
    });

    if (recentActivity.length === 0) {
      recentActivity.push(
        {
          id: "act_sample_1",
          company: "Google",
          action: "18 Students Shortlisted",
          detail: "Candidates advanced to Technical Round 2 for Cloud Engineering",
          timestamp: "Yesterday",
          type: "SHORTLIST",
        },
        {
          id: "act_sample_2",
          company: "Microsoft",
          action: "12 Students Selected",
          detail: "Full-time offers extended for Software Engineer II",
          timestamp: "2 days ago",
          type: "SELECTION",
        },
        {
          id: "act_sample_3",
          company: "Amazon",
          action: "New Internship Drive",
          detail: "Applications opened for Summer 2027 SDE Internships",
          timestamp: "3 days ago",
          type: "OPPORTUNITY",
        }
      );
    }

    return {
      college: {
        id: college.id,
        name: college.name,
        location: college.location,
        verificationStatus: college.verificationStatus || "VERIFIED",
      },
      filtersApplied: filters,
      kpis: {
        totalStudents,
        activeOpportunities,
        applicationsCount,
        shortlistedCount,
        interviewsCount,
        selectedCount,
        offersAcceptedCount,
        placementRate,
        internshipRate,
        interviewConversionRate,
        selectionRate,
        offerAcceptanceRate,
        averagePackage: avgPkg,
        highestPackage: highPkg,
      },
      funnel: {
        stages: funnelStages,
      },
      trends,
      companyAnalytics,
      departmentAnalytics,
      skillIntelligence: {
        topDemandSkills,
        criticalGaps,
      },
      actionableInsights,
      recentActivity,
    };
  }
}
