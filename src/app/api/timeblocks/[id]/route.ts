import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay } from 'date-fns';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 });
    }

    // Access control: Ensure user owns this time block
    if (existing.userId && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, color, startTime, endTime, date, taskId, taskInstanceId } = body;

    const newStartTime = startTime !== undefined ? startTime : existing.startTime;
    const newEndTime = endTime !== undefined ? endTime : existing.endTime;

    if (newEndTime <= newStartTime) {
      return NextResponse.json(
        { error: 'End time must be later than start time' },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
    if (color !== undefined) dataToUpdate.color = color;
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    if (date !== undefined) dataToUpdate.date = startOfDay(new Date(date));
    if (taskId !== undefined) dataToUpdate.taskId = taskId || null;
    if (taskInstanceId !== undefined) dataToUpdate.taskInstanceId = taskInstanceId || null;

    // Ensure block is owned by user
    if (!existing.userId) {
      dataToUpdate.userId = user.id;
    }

    const updated = await prisma.timeBlock.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update time block:', error);
    return NextResponse.json({ error: 'Failed to update time block' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.timeBlock.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 });
    }

    if (existing.userId && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.timeBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete time block:', error);
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 });
  }
}
