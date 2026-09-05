import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock student profile for MVP match calculation
const MOCK_STUDENT_SKILLS = ["React", "TypeScript", "Python", "JavaScript", "HTML", "CSS"];

function calculateMatch(internshipSkillsStr: string) {
  try {
    const internshipSkills: string[] = JSON.parse(internshipSkillsStr);
    const matchingSkills = internshipSkills.filter(skill => MOCK_STUDENT_SKILLS.includes(skill));
    
    // Calculate a percentage based on how many required skills the student has
    const percentage = internshipSkills.length > 0 
      ? Math.round((matchingSkills.length / internshipSkills.length) * 100)
      : 100;
      
    return {
      percentage,
      matchingSkills,
      reasons: {
        matchingSkills,
        academicMatch: "Computer Science",
        projectSynergy: matchingSkills.length > 0 
          ? `Strong overlap with your experience in ${matchingSkills.join(", ")}`
          : "General technical background aligns with role"
      }
    };
  } catch {
    return {
      percentage: 50,
      matchingSkills: [],
      reasons: { matchingSkills: [], academicMatch: "General Match", projectSynergy: "Role matches your field" }
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const format = searchParams.get('format') || 'all';
    const discipline = searchParams.get('discipline') || 'all';
    // 'tab' logic will be handled on the frontend for 'saved' and 'applied', but we handle basic filtering here

    // Build the query
    const whereClause: any = {};

    if (format !== 'all') {
      // remote, hybrid, onsite
      whereClause.workType = {
        equals: format,
        // sqlite doesn't support mode: 'insensitive' out of the box in prisma unless configured,
        // but we'll do a basic filter. The frontend sends 'remote', 'hybrid', etc.
      };
    }

    if (discipline !== 'all') {
      if (discipline === 'tech') {
        whereClause.department = { contains: 'Engineering' };
      } else if (discipline === 'business') {
        whereClause.department = { contains: 'Business' };
      }
    }

    // MVP mocked user id
    const userId = "student_123";

    let internships = await prisma.internship.findMany({
      where: whereClause,
      include: {
        savedBy: {
          where: { userId }
        },
        applications: {
          where: { userId }
        }
      }
    });

    // Post-process for search (since SQLite doesn't have great OR search across many fields)
    if (search) {
      const q = search.toLowerCase();
      internships = internships.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        (i.location && i.location.toLowerCase().includes(q))
      );
    }

    // Post-process to parse JSON strings and calculate match
    const formattedInternships = internships.map(i => {
      const match = calculateMatch(i.requiredSkills);
      const isSaved = i.savedBy.length > 0;
      const hasApplied = i.applications.length > 0;
      
      // omit relation arrays from the final payload for cleanliness
      const { savedBy, applications, ...rest } = i;

      return {
        ...rest,
        requiredSkills: JSON.parse(i.requiredSkills || "[]"),
        responsibilities: JSON.parse(i.responsibilities || "[]"),
        requirements: JSON.parse(i.requirements || "[]"),
        perks: JSON.parse(i.perks || "[]"),
        matchPercentage: match.percentage,
        matchReasons: match.reasons,
        isSaved,
        hasApplied
      };
    });

    return NextResponse.json(formattedInternships);
  } catch (error) {
    console.error("Failed to fetch internships:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
