import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay, endOfDay, subDays } from 'date-fns';

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

    if (dateStr) {
      const targetDate = startOfDay(new Date(dateStr));
      const checkIn = await prisma.dailyCheckIn.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: targetDate,
          },
        },
      });
      return NextResponse.json(checkIn || null);
    }

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (startDateStr && endDateStr) {
      whereClause.date = {
        gte: startOfDay(new Date(startDateStr)),
        lte: endOfDay(new Date(endDateStr)),
      };
    } else {
      // Default to last 30 days
      whereClause.date = {
        gte: startOfDay(subDays(new Date(), 30)),
      };
    }

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Failed to fetch check-ins:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, energy, mood, reflection } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const targetDate = startOfDay(new Date(date));
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Upsert check-in for this user on this date
    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: targetDate,
        },
      },
      create: {
        userId: user.id,
        date: targetDate,
        energy: energy !== undefined ? Number(energy) : null,
        mood: mood?.trim() || null,
        reflection: reflection?.trim() || null,
      },
      update: {
        energy: energy !== undefined ? Number(energy) : null,
        mood: mood?.trim() || null,
        reflection: reflection?.trim() || null,
      },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Failed to save daily check-in:', error);
    return NextResponse.json({ error: 'Failed to save daily check-in' }, { status: 500 });
  }
}
