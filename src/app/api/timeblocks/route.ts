import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, startOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    const whereClause: Record<string, unknown> = {};

    if (dateStr) {
      const targetDate = startOfDay(new Date(dateStr));
      whereClause.date = targetDate;
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
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Failed to fetch time blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, taskInstanceId, date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const block = await prisma.timeBlock.create({
      data: {
        taskId: taskId || null,
        taskInstanceId: taskInstanceId || null,
        date: startOfDay(new Date(date)),
        startTime,
        endTime,
      },
      include: {
        task: {
          include: {
            goal: true,
          },
        },
        taskInstance: {
          include: {
            task: {
              include: {
                goal: true,
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
