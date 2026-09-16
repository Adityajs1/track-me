import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, startOfDay } from 'date-fns';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, done } = body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.isRecurring) {
      // Recurring task: toggle or set TaskInstance for the given date
      const targetDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());
      const dateStr = format(targetDate, 'yyyy-MM-dd');

      // Find existing instance for this date
      const existingInstances = await prisma.taskInstance.findMany({
        where: {
          taskId: id,
        },
      });

      const matched = existingInstances.find(
        (inst) => format(new Date(inst.date), 'yyyy-MM-dd') === dateStr
      );

      const nextDone = done !== undefined ? !!done : !(matched?.done || false);

      let instance;
      if (matched) {
        instance = await prisma.taskInstance.update({
          where: { id: matched.id },
          data: { done: nextDone },
        });
      } else {
        instance = await prisma.taskInstance.create({
          data: {
            taskId: id,
            date: targetDate,
            done: nextDone,
          },
        });
      }

      return NextResponse.json({
        task,
        instance,
        isDone: instance.done,
      });
    } else {
      // One-off task: toggle task.done directly
      const nextDone = done !== undefined ? !!done : !task.done;
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { done: nextDone },
      });

      return NextResponse.json({
        task: updatedTask,
        instance: null,
        isDone: updatedTask.done,
      });
    }
  } catch (error) {
    console.error('Failed to toggle task:', error);
    return NextResponse.json({ error: 'Failed to toggle task' }, { status: 500 });
  }
}
