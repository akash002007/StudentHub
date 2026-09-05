import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getAuthenticatedStudent,
} from "@/lib/supabase/server";
import {
  SEEDED_INTERNSHIPS,
  localSavedInternships,
  localAppliedInternships,
  InternshipRow,
} from "@/lib/supabase/mock-data";
import { defaultStudentUser } from "@/data/mock-users";

function calculateMatchPercentage(internshipSkills: string[], studentSkills: string[]): number {
  if (!internshipSkills || internshipSkills.length === 0) return 85;
  if (!studentSkills || studentSkills.length === 0) return 50;
  
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
  const matchCount = internshipSkills.reduce((acc, skill) => {
    return acc + (studentSkillsLower.includes(skill.toLowerCase()) ? 1 : 0);
  }, 0);
  
  const basePercentage = 60; // Base match just for being in the same discipline (assumed)
  const skillsWeight = 40;
  
  const skillMatchPercentage = (matchCount / internshipSkills.length) * skillsWeight;
  return Math.min(100, Math.round(basePercentage + skillMatchPercentage));
}

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce Supabase Auth session and strictly validate STUDENT role
    const auth = await getAuthenticatedStudent(request);
    if (!auth.student) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    const studentId = auth.student.id;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const format = (searchParams.get("format") || "all").trim();
    const discipline = (searchParams.get("discipline") || "all").trim().toLowerCase();
    const tab = (searchParams.get("tab") || "all").trim().toLowerCase();

    // 3. Initialize Supabase Server Client
    const supabase = await createSupabaseServerClient();

    let fetchedInternships: any[] | null = null;

    try {
      // Build dynamic Supabase PostgreSQL query
      let query = supabase
        .from("internships")
        .select(`
          *,
          applications (id, user_id, status),
          saved_internships (id, user_id)
        `);

      // Filter by format (Remote/Hybrid/Onsite)
      if (format !== "all") {
        query = query.ilike("format", format);
      }

      // Filter by discipline
      if (discipline !== "all") {
        if (discipline === "tech") {
          query = query.ilike("discipline", "%Engineering%");
        } else if (discipline === "business") {
          query = query.ilike("discipline", "%Business%");
        } else if (discipline === "health") {
          query = query.ilike("discipline", "%Health%");
        } else if (discipline === "law") {
          query = query.ilike("discipline", "%Law%");
        } else if (discipline === "design") {
          query = query.ilike("discipline", "%Design%");
        } else {
          query = query.ilike("discipline", `%${discipline}%`);
        }
      }

      // Filter by Tab: All, Recommended (85%+), Saved, Remote
      if (tab === "recommended") {
        query = query.gte("match_percentage", 85);
      } else if (tab === "remote") {
        query = query.ilike("format", "remote");
      }

      // Text search in PostgreSQL
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%,match_reason.ilike.%${search}%`
        );
      }

      const { data, error } = await query.order("match_percentage", { ascending: false });

      if (!error && data) {
        fetchedInternships = data;
      }
    } catch {
      // Supabase connection unavailable or tables not yet migrated
    }

    // 4. Fallback to SEEDED_INTERNSHIPS if Supabase returned null or failed
    let rows: any[] = fetchedInternships || SEEDED_INTERNSHIPS;

    // Apply filters in memory if using fallback data or tab is 'saved'
    if (!fetchedInternships) {
      if (format !== "all") {
        rows = rows.filter((i) => i.format.toLowerCase() === format.toLowerCase());
      }

      if (discipline !== "all") {
        rows = rows.filter((i) => {
          const d = i.discipline.toLowerCase();
          if (discipline === "tech") return d.includes("engineering") || d.includes("tech");
          if (discipline === "business") return d.includes("business") || d.includes("finance");
          if (discipline === "health") return d.includes("health") || d.includes("bio");
          if (discipline === "law") return d.includes("law") || d.includes("policy");
          if (discipline === "design") return d.includes("design") || d.includes("creative");
          return d.includes(discipline);
        });
      }

      if (tab === "recommended") {
        rows = rows.filter((i) => (i.match_percentage || i.matchPercentage) >= 85);
      } else if (tab === "remote") {
        rows = rows.filter((i) => i.format.toLowerCase() === "remote");
      }

      if (search) {
        rows = rows.filter((i) => {
          const matchTitle = i.title.toLowerCase().includes(search);
          const matchCompany = i.company.toLowerCase().includes(search);
          const matchLocation = i.location.toLowerCase().includes(search);
          const matchSkills = (i.skills || []).some((s: string) =>
            s.toLowerCase().includes(search)
          );
          const matchReason = (i.match_reason || "").toLowerCase().includes(search);
          return matchTitle || matchCompany || matchLocation || matchSkills || matchReason;
        });
      }
    }

    // 5. Format results and attach user-specific isSaved & hasApplied flags
    const formatted = rows
      .map((item) => {
        let isSaved = false;
        let hasApplied = false;

        if (Array.isArray(item.saved_internships)) {
          isSaved = item.saved_internships.some((s: any) => s.user_id === studentId);
        } else {
          isSaved = localSavedInternships.has(item.id);
        }

        if (Array.isArray(item.applications)) {
          hasApplied = item.applications.some((a: any) => a.user_id === studentId);
        } else {
          hasApplied = localAppliedInternships.has(item.id);
        }

        // Standardize skills array
        const skills: string[] = Array.isArray(item.skills)
          ? item.skills
          : Array.isArray(item.requiredSkills)
          ? item.requiredSkills
          : [];

        // Support both camelCase and snake_case for maximum UI compatibility
        
        // Dynamic Match Calculation
        // In a real application, we'd fetch the student's actual profile from the DB.
        // For MVP, we use the default mock student's skills if the DB profile isn't available.
        let dynamicMatch = item.match_percentage ?? item.matchPercentage ?? 80;
        let dynamicMatchReason = item.match_reason || (item.matchReasons?.projectSynergy ?? "Aligns with your technical background");
        
        if (studentId) {
          const studentSkills = defaultStudentUser.skills || [];
          if (studentSkills.length > 0 && skills.length > 0) {
            dynamicMatch = calculateMatchPercentage(skills, studentSkills);
            dynamicMatchReason = `You have ${Math.round((dynamicMatch - 60) / 40 * skills.length)} of the ${skills.length} required skills for this role.`;
          }
        }

        return {
          id: item.id,
          title: item.title,
          company: item.company,
          companyLogo: item.company_logo || item.companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
          companyDescription: item.company_description || item.companyDescription || "",
          location: item.location,
          format: item.format || item.workType || "Remote",
          workType: item.format || item.workType || "Remote",
          discipline: item.discipline || "Engineering & Tech",
          pay: item.pay || item.stipend || "$45/hr",
          stipend: item.pay || item.stipend || "$45/hr",
          duration: item.duration || "12 Weeks",
          skills,
          requiredSkills: skills,
          deadline: typeof item.deadline === "string" ? item.deadline : "Summer 2026",
          match_percentage: dynamicMatch,
          matchPercentage: dynamicMatch,
          match_reason: dynamicMatchReason,
          matchReasons: {
            matchingSkills: skills.filter(s => defaultStudentUser.skills?.map(sk => sk.toLowerCase()).includes(s.toLowerCase())).slice(0, 3),
            academicMatch: item.discipline || "Computer Science",
            projectSynergy: dynamicMatchReason,
          },
          description: item.description || "",
          responsibilities: item.responsibilities || [],
          requirements: item.requirements || [],
          perks: item.perks || [],
          applicantsCount: item.applicants_count ?? item.applicantsCount ?? 0,
          applicants_count: item.applicants_count ?? item.applicantsCount ?? 0,
          isSaved,
          hasApplied,
        };
      })
      .filter((item) => {
        // Tab 'saved' filter: only show saved items
        if (tab === "saved") {
          return item.isSaved;
        }
        return true;
      });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/internships] Failed to fetch internships:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
