import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET items for a checklist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params
    const items = await db.checklistItem.findMany({
      where: { checklistId },
      orderBy: {
        position: 'asc',
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching checklist items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklist items' },
      { status: 500 }
    )
  }
}

// POST create a new checklist item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ checklistId: string }> }
) {
  try {
    const { checklistId } = await params
    const body = await request.json()
    const { title, position } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const item = await db.checklistItem.create({
      data: {
        title,
        checklistId,
        position: position ?? 0,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to create checklist item' },
      { status: 500 }
    )
  }
}
