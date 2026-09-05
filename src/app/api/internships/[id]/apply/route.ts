import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In a real app, this comes from the authenticated session
    const userId = "student_123";
    const { id } = await params;
    
    // In Next.js 15, params is a Promise, so we await it above

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        internshipId: id
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        internshipId: id,
        status: "Applied"
      }
    });

    // Also increment applicants count on the internship model
    await prisma.internship.update({
      where: { id },
      data: {
        applicantsCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Failed to apply for internship:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
