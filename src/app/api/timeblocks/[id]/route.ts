import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { startTime, endTime, date } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    if (date !== undefined) dataToUpdate.date = new Date(date);

    const updated = await prisma.timeBlock.update({
      where: { id },
      data: dataToUpdate,
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
    const { id } = await params;
    await prisma.timeBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete time block:', error);
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 });
  }
}
