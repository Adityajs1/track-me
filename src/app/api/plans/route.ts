import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalId, name, startDate, endDate } = body;

    if (!goalId || !name?.trim() || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Goal ID, name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        goalId,
        name: name.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Failed to create plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
