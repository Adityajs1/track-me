import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');
    const filter = searchParams.get('filter'); // 'all', 'goal', 'general'

    const whereClause: Record<string, unknown> = {};

    if (goalId) {
      whereClause.goalId = goalId;
    } else if (filter === 'general') {
      whereClause.goalId = null;
    } else if (filter === 'goal') {
      whereClause.goalId = { not: null };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        goal: {
          select: { id: true, name: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalId, title, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        goalId: goalId || null,
        title: title?.trim() || null,
        content: content.trim(),
      },
      include: {
        goal: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
