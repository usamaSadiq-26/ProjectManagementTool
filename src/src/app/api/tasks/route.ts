import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assigneeId = searchParams.get('assigneeId')

    const tasks = await db.task.findMany({
      where: {
        ...(status && { status }),
        ...(assigneeId && { assignedId: assigneeId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        checklists: {
          include: {
            items: {
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      priority,
      dueDate,
      type,
      status,
      createdById,
      assignedId,
      labels = [],
      position = 0,
    } = body

    console.log('Creating task with payload:', body)

    // Validate required fields
    if (!title || !createdById) {
      console.error('Validation failed:', { title, createdById })
      return NextResponse.json(
        { error: 'Title and createdById are required' },
        { status: 400 }
      )
    }

    // Get creator to determine role
    const creator = await db.user.findUnique({
      where: { id: createdById },
      select: { role: true },
    })

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        type,
        status: status || 'Backlog',
        createdById,
        assignedId: assignedId || null,
        position,
        labels: {
          create: labels.map((label: { name: string; color: string }) => ({
            name: label.name,
            color: label.color || 'gray',
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        labels: true,
      },
    })

    // Create notification for assigned user
    if (assignedId && assignedId !== createdById) {
      await db.notification.create({
        data: {
          type: 'card_assigned',
          message: `You have been assigned to task: ${title}`,
          taskId: task.id,
          userId: assignedId,
        },
      })
    }

    // If admin created the task, notify admin
    if (creator?.role === 'ADMIN') {
      await db.notification.create({
        data: {
          type: 'card_created',
          message: `Task "${title}" has been created`,
          taskId: task.id,
          userId: createdById,
        },
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
