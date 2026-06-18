import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { use } from 'react'

// GET a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    const task = await db.task.findUnique({
      where: { id },
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
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PUT update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    const body = await request.json()
    const {
      title,
      description,
      priority,
      dueDate,
      type,
      status,
      assignedId,
      labels,
    } = body

    console.log('Updating task id:', id, 'with status:', status)

    const existingTask = await db.task.findUnique({
      where: { id },
      select: { assignedId: true, title: true, status: true },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Update task
    const updatedTask = await db.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(type && { type }),
        ...(status && { status }),
        ...(assignedId !== undefined && { assignedId: assignedId || null }),
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
      },
    })

    // Update labels if provided
    if (labels !== undefined) {
      await db.label.deleteMany({
        where: { taskId: id },
      })

      if (labels.length > 0) {
        await db.task.update({
          where: { id },
          data: {
            labels: {
              create: labels.map((label: { name: string; color: string }) => ({
                name: label.name,
                color: label.color || 'gray',
              })),
            },
          },
        })
      }
    }

    // Create notifications for status changes (role-aware)
    if (status && status !== existingTask.status) {
      const currentUser = await db.user.findUnique({
        where: { id: existingTask.assignedId || existingTask.createdById },
        select: { name: true, role: true },
      })

      const changerName = currentUser?.name || 'A user'
      const changerRole = currentUser?.role?.toUpperCase() || 'USER'

      const users = await db.user.findMany()

      for (const user of users) {
        if (user.id === (existingTask.assignedId || existingTask.createdById)) {
          continue
        }

        if (user.role?.toUpperCase() === 'ADMIN' && changerRole !== 'ADMIN') {
          await db.notification.create({
            data: {
              type: 'card_moved',
              message: `${changerName} moved task "${title || existingTask.title}" from ${existingTask.status} to ${status}`,
              taskId: id,
              userId: user.id,
            },
          })
        }
        else if (existingTask.assignedId === user.id) {
          await db.notification.create({
            data: {
              type: 'card_moved',
              message: `Task "${title || existingTask.title}" moved from ${existingTask.status} to ${status}`,
              taskId: id,
              userId: user.id,
            },
          })
        }
        else if (assignedId === user.id) {
          await db.notification.create({
            data: {
              type: 'card_assigned',
              message: `You have been assigned to task: ${title || existingTask.title}`,
              taskId: id,
              userId: user.id,
            },
          })
        }
      }
    }

    if (assignedId && assignedId !== existingTask.assignedId) {
      await db.notification.create({
        data: {
          type: 'card_assigned',
          message: `You have been assigned to task: ${title || existingTask.title}`,
          taskId: id,
          userId: assignedId,
        },
      })
    }

    const finalTask = await db.task.findUnique({
      where: { id },
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
      },
    })

    return NextResponse.json(finalTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    await db.task.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
