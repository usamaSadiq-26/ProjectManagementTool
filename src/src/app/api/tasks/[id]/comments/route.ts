import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET comments for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await db.comment.findMany({
      where: { taskId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST add a comment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, userId } = body

    // Validate required fields
    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and userId are required' },
        { status: 400 }
      )
    }

    // Check if task exists
    const task = await db.task.findUnique({
      where: { id },
      select: { title: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const comment = await db.comment.create({
      data: {
        content,
        taskId: id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    // Create notification for task assignee and creator
    const taskData = await db.task.findUnique({
      where: { id },
      select: { assignedId: true, createdById: true },
    })

    if (taskData) {
      const userIdsToNotify = [taskData.assignedId, taskData.createdById].filter(
        (id): id is string => id !== null && id !== userId
      )

      for (const notifyUserId of new Set(userIdsToNotify)) {
        await db.notification.create({
          data: {
            type: 'card_commented',
            message: `New comment on task: ${task.title}`,
            taskId: id,
            userId: notifyUserId,
          },
        })
      }
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
