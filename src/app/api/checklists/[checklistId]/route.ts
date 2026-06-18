import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update a checklist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params
    const body = await request.json()
    const { title } = body

    const checklist = await db.checklist.update({
      where: { id: checklistId },
      data: {
        ...(title && { title }),
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Error updating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    )
  }
}

// DELETE a checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params
    await db.checklist.delete({
      where: { id: checklistId },
    })

    return NextResponse.json({ message: 'Checklist deleted successfully' })
  } catch (error) {
    console.error('Error deleting checklist:', error)
    return NextResponse.json(
      { error: 'Failed to delete checklist' },
      { status: 500 }
    )
  }
}
