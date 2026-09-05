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

    // Check if it's already saved
    const existing = await prisma.savedInternship.findFirst({
      where: {
        userId,
        internshipId: id
      }
    });

    if (existing) {
      // Toggle off
      await prisma.savedInternship.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Toggle on
      await prisma.savedInternship.create({
        data: {
          userId,
          internshipId: id
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Failed to save internship:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
