import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update a checklist item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const body = await request.json()
    const { title, isCompleted, position } = body

    const item = await db.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(position !== undefined && { position }),
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    )
  }
}

// DELETE a checklist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    await db.checklistItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ message: 'Checklist item deleted successfully' })
  } catch (error) {
    console.error('Error deleting checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to delete checklist item' },
      { status: 500 }
    )
  }
}
