import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeGoalMetrics } from '@/lib/summary';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    const whereClause: Record<string, unknown> = {};
    if (user) {
      whereClause.OR = [{ userId: user.id }, { userId: null }];
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        plans: {
          include: {
            tasks: true,
          },
        },
        tasks: {
          include: {
            instances: true,
          },
        },
        notes: true,
        _count: {
          select: {
            plans: true,
            tasks: true,
            notes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const goalsWithMetrics = goals.map((g) => {
      const metrics = computeGoalMetrics(
        {
          id: g.id,
          startDate: g.startDate,
          endDate: g.endDate,
          tasks: g.tasks,
        },
        90
      );
      return {
        ...g,
        metrics,
      };
    });

    return NextResponse.json(goalsWithMetrics);
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, startDate, endDate } = body;

    if (!name?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const user = await getAuthUser();

    const goal = await prisma.goal.create({
      data: {
        userId: user?.id || null,
        name: name.trim(),
        category: category.trim(),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        plans: true,
        tasks: true,
        notes: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
