import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeGoalMetrics } from '@/lib/summary';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        plans: {
          include: {
            tasks: {
              include: {
                instances: true,
                timeBlocks: true,
              },
            },
          },
          orderBy: { startDate: 'asc' },
        },
        tasks: {
          include: {
            instances: true,
            timeBlocks: true,
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            plans: true,
            tasks: true,
            notes: true,
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const metrics = computeGoalMetrics(
      {
        id: goal.id,
        startDate: goal.startDate,
        endDate: goal.endDate,
        tasks: goal.tasks,
      },
      180
    );

    return NextResponse.json({ ...goal, metrics });
  } catch (error) {
    console.error('Failed to fetch goal detail:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, startDate, endDate } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (category !== undefined) dataToUpdate.category = category.trim();
    if (startDate !== undefined) dataToUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;

    const updated = await prisma.goal.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
