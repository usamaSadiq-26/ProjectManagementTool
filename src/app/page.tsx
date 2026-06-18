'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus,
  MoreVertical,
  Calendar,
  User,
  CheckSquare2,
  MessageSquare,
  Paperclip,
  X,
  LogOut,
  LogIn,
  ArrowRight,
  GripVertical,
  Check,
  Bell,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TaskModal } from '@/components/TaskModal'
import { TaskDetail } from '@/components/TaskDetail'
import { ClientOnly } from '@/components/ClientOnly'
import { PersonalizeMenu } from '@/components/PersonalizeMenu'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'review', title: 'Review', color: 'bg-brand' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

const PRIORITIES = {
  High: { color: 'bg-red-500 text-white', icon: '⚡' },
  Medium: { color: 'bg-amber-500 text-white', icon: '⚡' },
  Low: { color: 'bg-green-500 text-white', icon: '⚡' },
}

const CARD_TYPES = {
  Task: { color: 'bg-slate-100 text-slate-700', icon: '📋' },
  Bug: { color: 'bg-red-100 text-red-700', icon: '🐛' },
  Feature: { color: 'bg-brand text-brand', icon: '✨' },
}

const LABEL_COLORS = {
  Urgent: 'bg-red-500',
  Feature: 'bg-brand',
  Bug: 'bg-orange-500',
  Research: 'bg-blue-500',
  Design: 'bg-pink-500',
  Testing: 'bg-cyan-500',
  Documentation: 'bg-slate-500',
}

// Sortable Card Component
function SortableCard({ task, onEdit, onViewDetail, onMoveToColumn, highlighted, onDelete, isAdmin }: { task: any; onEdit: (task: any) => void; onViewDetail: (task: any) => void; onMoveToColumn: (taskId: string, columnId: string) => void; onDelete?: (taskId: string) => void; highlighted?: boolean; isAdmin?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
  const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

  const totalChecklistItems = task.checklists?.reduce((sum: number, checklist: any) => sum + (checklist.items?.length || 0), 0) || 0
  const completedChecklistItems = task.checklists?.reduce((sum: number, checklist: any) => sum + (checklist.items?.filter((i: any) => i.isCompleted).length || 0), 0) || 0
  const checklistProgress = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : null

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`cursor-pointer hover:shadow-2xl hover:shadow-brand/20 transition-all duration-300 bg-slate-900/90 backdrop-blur-lg border ${highlighted ? 'border-brand/50 shadow-brand/30 ring-2 ring-brand/50' : 'border-white/10'}`}
        onClick={(e) => {
          console.log('Card clicked:', task.title, task.id)
          onViewDetail(task)
        }}
        data-task-id={task.id}
      >
        <CardHeader className="p-3 pb-2">
          {/* Top Row: Type, Priority, and Menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing text-slate-500 hover:text-slate-300"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full">
                {CARD_TYPES[task.type as keyof typeof CARD_TYPES]?.icon || '📋'}
              </span>
              <Badge variant="outline" className={`text-xs border-0 ${PRIORITIES[task.priority as keyof typeof PRIORITIES]?.color || 'bg-slate-500 text-white'}`}>
                {task.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 text-slate-500 hover:text-white hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800/95 border-white/10">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete && onDelete(task.id)
                        }}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300"
                      >
                        Delete Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                    </>
                  )}
                  {COLUMNS.filter((col) => col.title !== task.status).map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Moving task:', task.id, 'from status:', task.status, 'to column:', column.id, 'to status:', column.title)
                        onMoveToColumn(task.id, column.id)
                      }}
                      className="text-slate-200 hover:bg-brand/20 hover:text-white focus:bg-brand/20 focus:text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to {column.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title */}
          <CardTitle className="text-sm font-medium text-slate-200 line-clamp-2 mb-2">
            {task.title}
          </CardTitle>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.slice(0, 3).map((label: any) => (
                <Badge
                  key={label.id}
                  className={`text-white ${LABEL_COLORS[label.name as keyof typeof LABEL_COLORS] || 'bg-slate-500'}`}
                >
                  {label.name}
                </Badge>
              ))}
              {task.labels.length > 3 && (
                <Badge className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300">
                  +{task.labels.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Bottom Row: Assignee, Due Date, Comments, Checklist */}
          <div className="flex items-center justify-between gap-2 mt-2 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Due Date */}
              {dueDateFormatted && (
                <div className={`flex items-center gap-1 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} title={isOverdue ? 'Overdue' : 'Due date'}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{dueDateFormatted}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Checklist Progress */}
              {checklistProgress !== null && (
                <div className="flex items-center gap-1 text-slate-400" title={`${completedChecklistItems}/${totalChecklistItems} items completed`}>
                  <CheckSquare2 className="h-3.5 w-3.5" />
                  <span>{checklistProgress}%</span>
                </div>
              )}

              {/* Comments Count */}
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-slate-400" title={`${task.comments.length} comments`}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}

              {/* Attachments Count */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-slate-400" title={`${task.attachments.length} attachments`}>
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignee Section */}
          {task.assignedTo && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2" title={`Assigned to ${task.assignedTo.name}`}>
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">
                Assigned to: <span className="text-slate-200 font-medium ml-1">{task.assignedTo.name}</span>
              </span>
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({ id, title, color, tasks, isAdmin, onEdit, onViewDetail, onMoveToColumn, onDelete, highlighted, onAddTask }: { id: string; title: string; color: string; tasks: any[]; isAdmin: boolean; onEdit: (task: any) => void; onViewDetail: (task: any) => void; onMoveToColumn: (taskId: string, columnId: string) => void; onDelete?: (taskId: string) => void; highlighted?: string; onAddTask?: (columnId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  console.log(`Column "${title}" (id: ${id}) received ${tasks.length} tasks`)

  return (
    <div
      ref={setNodeRef}
      key={id}
      id={id}
      className="flex-shrink-0 w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col shadow-xl shadow-brand/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h2 className="font-semibold text-slate-200">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-brand hover:text-brand hover:bg-brand/20"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddTask && onAddTask(id)
                }}
                title="Add task to this column"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white hover:bg-black/50">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </>
          )}
          {!isAdmin && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-slate-300 border-white/10">
              {tasks.length || 0}
            </Badge>
          )}
        </div>
      </div>
      
      <div className={`flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 custom-scrollbar rounded-xl ${isOver ? 'bg-brand/10' : 'bg-slate-800'}`}>
        <SortableContext items={tasks.map((t: any) => ({ id: t.id, ...t }))} id={id} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p className="text-sm">No tasks in {title}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onViewDetail={onViewDetail}
                onMoveToColumn={onMoveToColumn}
                onDelete={onDelete}
                isAdmin={isAdmin}
                highlighted={highlighted === task.id}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [tasks, setTasks] = useState<any>({ backlog: [], todo: [], inprogress: [], review: [], done: [] })
  const [notifications, setNotifications] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedColumn, setSelectedColumn] = useState<string>('backlog')
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailTask, setDetailTask] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  // DEBUG: Show current admin status
  console.log('User object:', user)
  console.log('User role:', user?.role)
  console.log('User role uppercase:', user?.role?.toUpperCase())
  console.log('Is Admin:', isAdmin)

  // Check for logged in user and redirect if needed (run only once on mount)
  useEffect(() => {
    const userFromStorage = localStorage.getItem('user')
    if (userFromStorage) {
      const userData = JSON.parse(userFromStorage)
      setUser(userData)
    } else {
      router.replace('/auth/login')
    }
  }, []) // Empty dependency array - run only once on mount

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      const allTasks = await response.json()

      console.log('All tasks from API:', allTasks)
      console.log('Current user:', user)
      console.log('User ID:', user?.id)
      console.log('User role:', user?.role)

      let filteredTasks = allTasks
      const userRole = user?.role?.toUpperCase()
      if (user && userRole !== 'ADMIN') {
        // Employees only see tasks assigned to them or created by them
        filteredTasks = allTasks.filter((t: any) => {
          const isAssigned = t.assignedTo?.id === user.id
          const isCreated = t.createdBy?.id === user.id
          const shouldShow = isAssigned || isCreated
          if (!shouldShow) {
            console.log('Filtering out task:', t.id, t.title, 'assignedTo:', t.assignedTo?.id, 'createdBy:', t.createdBy?.id)
          }
          return shouldShow
        })
        console.log('Filtered tasks for non-admin:', filteredTasks.length, 'out of', allTasks.length)
      }

      const groupedTasks = {
        backlog: filteredTasks.filter((t: any) => t.status === 'Backlog'),
        todo: filteredTasks.filter((t: any) => t.status === 'To Do'),
        inprogress: filteredTasks.filter((t: any) => t.status === 'In Progress'),
        review: filteredTasks.filter((t: any) => t.status === 'Review'),
        done: filteredTasks.filter((t: any) => t.status === 'Done'),
      }

      console.log('Filtered tasks:', filteredTasks)
      console.log('Grouped tasks:', groupedTasks)
      console.log('Backlog tasks:', groupedTasks.backlog.length)
      console.log('Todo tasks:', groupedTasks.todo.length)
      console.log('In Progress tasks:', groupedTasks.inprogress.length)
      console.log('Review tasks:', groupedTasks.review.length)
      console.log('Done tasks:', groupedTasks.done.length)
      setTasks(groupedTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }, [user])

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [loadTasks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleOpenCreateModal = (columnId: string) => {
    setSelectedColumn(columnId)
    setSelectedTask(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (task: any) => {
    setSelectedTask(task)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleOpenDetail = (task: any) => {
    console.log('Opening task detail:', task)
    setDetailTask(task)
    setIsDetailOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.replace('/auth/login')
  }

  const handleMoveToColumn = async (taskId: string, targetColumnId: string) => {
    // Only allow move if user is admin
    if (!isAdmin) {
      console.log('Only admins can move cards')
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: COLUMNS.find((col) => col.id === targetColumnId)?.title }),
      })

      if (response.ok) {
        await loadTasks()
      }
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    // Only allow delete if user is admin
    if (!isAdmin) {
      console.log('Only admins can delete tasks')
      return
    }

    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadTasks()
      } else {
        alert('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  const handleSaveTask = async (taskData: any) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

      // Check if user is logged in
      if (!currentUser.id) {
        console.error('User not logged in')
        alert('You must be logged in to create tasks')
        return
      }

      // Check if user is admin - employees cannot create tasks
      if (!isAdmin) {
        console.error('Only admins can create tasks')
        alert('Only administrators can create tasks')
        return
      }

      // Validate required fields
      if (!taskData.title || !taskData.title.trim()) {
        console.error('Title is required')
        alert('Please enter a task title')
        return
      }

      // Map column ID to status title
      const getStatusTitle = (columnId: string) => {
        const column = COLUMNS.find((col) => col.id === columnId)
        return column?.title || 'Backlog'
      }

      const taskPayload = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        type: taskData.type,
        dueDate: taskData.dueDate,
        status: modalMode === 'create' ? getStatusTitle(selectedColumn) : detailTask?.status,
        createdById: currentUser.id,
        assignedId: taskData.assignee?.id || null,
        labels: taskData.labels?.map((l: string) => ({ name: l, color: 'gray' })) || [],
        position: 0,
      }

      console.log('Saving task:', taskPayload)

      let response
      if (modalMode === 'create') {
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload),
        })
      } else {
        response = await fetch(`/api/tasks/${detailTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload),
        })
      }

      const data = await response.json()
      console.log('Response:', response.status, data)

      if (!response.ok) {
        console.error('Failed to save task:', data)
        alert(`Error: ${data.error || 'Failed to save task'}`)
        return
      }

      console.log('Task saved successfully, reloading tasks...')
      await loadTasks()
      setIsModalOpen(false)
      setIsDetailOpen(false)
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: COLUMNS.find((col) => over.id.toString().startsWith(col.id))?.title }),
      })

      if (response.ok) {
        console.log('Task moved successfully:', taskId, 'by user:', currentUser.name)
        await loadTasks()
      }
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  // Load notifications for current user
  useEffect(() => {
    let isMounted = true

    const loadNotifications = async () => {
      if (!user || !isMounted) return

      try {
        const response = await fetch('/api/notification')
        const allNotifications = await response.json()

        console.log('All notifications:', allNotifications)

        let filteredNotifications = []
        if (user.role?.toUpperCase() === 'ADMIN') {
          // Admins see all notifications
          filteredNotifications = allNotifications
        } else {
          // Employees only see notifications for tasks assigned to them or created by them
          filteredNotifications = allNotifications.filter((n: any) => {
            // If no taskId, check if userId matches
            if (!n.taskId) {
              return n.userId === user.id
            }

            // Check if this task is assigned to user or created by user
            // We need to check the tasks we already have
            const tasksArray = Object.values(tasks).flat()
            const relatedTask = tasksArray.find((t: any) => t.id === n.taskId)

            if (!relatedTask) {
              return false
            }

            const isAssignedToUser = relatedTask.assignedTo?.id === user.id
            const isCreatedByUser = relatedTask.createdBy?.id === user.id

            // Employees see notifications for:
            // - Tasks assigned to them
            // - Tasks they created
            // - Comments on their assigned tasks
            return isAssignedToUser || isCreatedByUser
          })
        }

        console.log('Filtered notifications for user:', filteredNotifications.length, 'out of', allNotifications.length)
        if (isMounted) {
          setNotifications(filteredNotifications)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [user, tasks])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'card_created':
        return <Calendar className="h-4 w-4 text-blue-400" />
      case 'card_assigned':
        return <User className="h-4 w-4 text-brand" />
      case 'card_moved':
        return <ArrowRight className="h-4 w-4 text-amber-400" />
      case 'card_commented':
        return <MessageSquare className="h-4 w-4 text-emerald-400" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatNotificationTime = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <div className="min-h-screen flex flex-col relative text-slate-200">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/dashboard-bg.jpg"
          alt="Dashboard Background"
          fill
          priority
          quality={60}
          className="object-cover"
        />
        {/* Dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
              Team Task Management Board
            </h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm bg-brand/30 text-brand border border-brand/50">
                        {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{user.name}</span>
                      <Badge variant="secondary" className={cn(
                        "ml-2",
                        isAdmin ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      )}>
                        {isAdmin ? 'Admin' : user?.role || 'User'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="gap-2 border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white hover:border-slate-600/70">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="gap-2 border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white hover:border-slate-600/70">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-brand to-brand/70 hover:from-brand hover:to-brand/70 gap-2 shadow-lg shadow-brand/25">
                      <Plus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="relative border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white hover:border-slate-600/70"
                    onClick={() => handleOpenCreateModal('backlog')}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Task
                  </Button>
                )}
                <div className="flex items-center gap-4">
                  <PersonalizeMenu />
                  <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="relative border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white hover:border-slate-600/70"
                      >
                        <Bell className="h-5 w-5 mr-2" />
                        Notifications
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-xl border border-white/10">
                      <ScrollArea className="max-h-96">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-400">
                            No notifications
                          </div>
                        ) : (
                          <>
                            {notifications.slice(0, 10).map((notification: any) => (
                              <DropdownMenuItem
                                key={notification.id}
                                onClick={() => {
                                  const task = Object.values(tasks).flat().find((t: any) => t.id === notification.taskId)
                                  if (task) {
                                    setHighlightedTaskId(notification.taskId)
                                    handleOpenDetail(task)
                                  }
                                }}
                                className="flex items-start gap-3 px-3 py-2 text-slate-200 hover:bg-brand/10 hover:text-white"
                              >
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{notification.message}</p>
                                  <p className="text-xs text-slate-500">{formatNotificationTime(notification.createdAt)}</p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1"></div>
                                )}
                              </DropdownMenuItem>
                            ))}
                            {notifications.length > 10 && (
                              <div className="px-4 py-2 text-center text-xs text-slate-400">
                                {notifications.length - 10} more notifications
                              </div>
                            )}
                          </>
                        )}
                      </ScrollArea>
                      {notifications.length > 0 && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={async () => {
                              // Mark all as read by updating each notification
                              await Promise.all(
                                notifications.map((n: any) => 
                                  fetch(`/api/notifications/${n.id}`, { method: 'PUT' })
                                )
                              )
                              setNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, isRead: true })))
                              setShowNotifications(false)
                            }}
                            className="px-4 py-2 text-sm text-slate-300 hover:bg-brand/10"
                          >
                            Mark all as read
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto">
        <div className="container mx-auto px-4 py-6">
          <ClientOnly>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 min-h-[calc(100vh-180px)]">
                {COLUMNS.map((column) => (
                  <DroppableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    tasks={tasks[column.id] || []}
                    isAdmin={isAdmin}
                    onEdit={handleOpenEditModal}
                    onViewDetail={handleOpenDetail}
                    onMoveToColumn={handleMoveToColumn}
                    onDelete={handleDeleteTask}
                    highlighted={highlightedTaskId}
                    onAddTask={handleOpenCreateModal}
                  />
                ))}
              </div>
            </DndContext>
          </ClientOnly>
        </div>
      </main>

      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 shadow-lg mt-auto">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-brand/30 text-brand border border-brand/50">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                Logged in as <span className="text-slate-200">{user?.name || 'User'}</span>
              </span>
              <span>•</span>
              <span>{Object.values(tasks).flat().length} Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Task Modal */}
      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
      />

      {/* Task Detail Modal */}
      <TaskDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        task={detailTask}
      />
    </div>
      </div>
  )
}

