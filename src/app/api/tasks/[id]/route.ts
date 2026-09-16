import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, planId, targetDate, done, isRecurring } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (planId !== undefined) dataToUpdate.planId = planId || null;
    if (targetDate !== undefined) dataToUpdate.targetDate = targetDate ? new Date(targetDate) : null;
    if (done !== undefined) dataToUpdate.done = !!done;
    if (isRecurring !== undefined) dataToUpdate.isRecurring = !!isRecurring;

    const updated = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
