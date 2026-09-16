import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, startOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD for daily check-in

    const whereClause: Record<string, unknown> = {};
    if (goalId) whereClause.goalId = goalId;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        goal: {
          select: { id: true, name: true, category: true, startDate: true, endDate: true },
        },
        plan: {
          select: { id: true, name: true },
        },
        instances: true,
        timeBlocks: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (dateStr) {
      // Filter tasks relevant to this specific date:
      // 1. One-off tasks with targetDate == dateStr
      // 2. Recurring tasks where goal is active on dateStr
      const targetDate = startOfDay(new Date(dateStr));
      const formattedTarget = format(targetDate, 'yyyy-MM-dd');

      const dailyTasks = tasks
        .filter((task) => {
          if (task.isRecurring) {
            const goalStart = startOfDay(new Date(task.goal.startDate));
            const goalEnd = task.goal.endDate ? startOfDay(new Date(task.goal.endDate)) : null;
            return targetDate >= goalStart && (!goalEnd || targetDate <= goalEnd);
          } else if (task.targetDate) {
            const tDateStr = format(new Date(task.targetDate), 'yyyy-MM-dd');
            return tDateStr === formattedTarget;
          }
          return false;
        })
        .map((task) => {
          if (task.isRecurring) {
            const instance = task.instances.find(
              (inst) => format(new Date(inst.date), 'yyyy-MM-dd') === formattedTarget
            );
            return {
              ...task,
              isDoneToday: !!instance?.done,
              instanceId: instance?.id || null,
            };
          }
          return {
            ...task,
            isDoneToday: task.done,
            instanceId: null,
          };
        });

      return NextResponse.json(dailyTasks);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalId, planId, title, targetDate, isRecurring } = body;

    if (!goalId || !title?.trim()) {
      return NextResponse.json(
        { error: 'Goal ID and title are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        goalId,
        planId: planId || null,
        title: title.trim(),
        targetDate: targetDate ? new Date(targetDate) : null,
        isRecurring: !!isRecurring,
        done: false,
      },
      include: {
        goal: true,
        plan: true,
        instances: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
