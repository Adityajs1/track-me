import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, goalId } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = title ? title.trim() : null;
    if (content !== undefined) dataToUpdate.content = content.trim();
    if (goalId !== undefined) dataToUpdate.goalId = goalId || null;

    const updated = await prisma.note.update({
      where: { id },
      data: dataToUpdate,
      include: {
        goal: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
