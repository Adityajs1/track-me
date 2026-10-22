import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (startDateStr && endDateStr) {
      whereClause.date = {
        gte: startOfDay(new Date(startDateStr)),
        lte: endOfDay(new Date(endDateStr)),
      };
    } else if (dateStr) {
      whereClause.date = {
        gte: startOfDay(new Date(dateStr)),
        lte: endOfDay(new Date(dateStr)),
      };
    }

    const blocks = await prisma.timeBlock.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            goal: { select: { id: true, name: true, category: true } },
          },
        },
        taskInstance: {
          include: {
            task: {
              include: {
                goal: { select: { id: true, name: true, category: true } },
              },
            },
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Failed to fetch time blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, color, taskId, taskInstanceId, date, startTime, endTime } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Time validation: endTime must be strictly greater than startTime
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be later than start time' },
        { status: 400 }
      );
    }

    const blockDate = startOfDay(new Date(date));
    if (isNaN(blockDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const block = await prisma.timeBlock.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        taskId: taskId || null,
        taskInstanceId: taskInstanceId || null,
        date: blockDate,
        startTime,
        endTime,
      },
      include: {
        task: {
          include: {
            goal: { select: { id: true, name: true, category: true } },
          },
        },
        taskInstance: {
          include: {
            task: {
              include: {
                goal: { select: { id: true, name: true, category: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('Failed to create time block:', error);
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 });
  }
}
