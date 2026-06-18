'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar as CalendarIcon,
  User,
  Tag,
  CheckSquare2,
  MessageSquare,
  Paperclip,
  X,
  Send,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const LABEL_COLORS = {
  Urgent: 'bg-red-500',
  Feature: 'bg-brand',
  Bug: 'bg-orange-500',
  Research: 'bg-blue-500',
  Design: 'bg-pink-500',
}

const PRIORITIES = {
  High: 'bg-red-500 text-white',
  Medium: 'bg-amber-500 text-white',
  Low: 'bg-green-500 text-white',
}

interface TaskDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
}

export function TaskDetail({ open, onOpenChange, task }: TaskDetailProps) {
  console.log('TaskDetail received task:', task)
  const [newComment, setNewComment] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [localComments, setLocalComments] = useState(task?.comments || [])
  const [localChecklists, setLocalChecklists] = useState(task?.checklists || [])

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date()

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      user: {
        name: currentUser.name || 'User',
        avatar: currentUser.name?.split(' ').map(n => n[0]).join('') || 'U',
      },
      createdAt: new Date(),
    }

    setLocalComments([comment, ...localComments])
    setNewComment('')
  }

  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    setLocalChecklists(localChecklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
          ),
        }
      }
      return cl
    }))
  }

  const handleAddChecklistItem = (checklistId: string) => {
    if (!newChecklistItem.trim()) return

    setLocalChecklists(localChecklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: [
            ...cl.items,
            {
              id: Date.now().toString(),
              title: newChecklistItem,
              isCompleted: false,
              position: cl.items.length,
            },
          ],
        }
      }
      return cl
    }))
    setNewChecklistItem('')
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{task?.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {task?.type} • {task?.priority} Priority
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Labels and Priority */}
            <div className="flex items-center gap-3 flex-wrap">
              {task?.labels?.length > 0 && task.labels.map((label: any) => (
                <Badge
                  key={label.id}
                  className={`text-white ${LABEL_COLORS[label.name as keyof typeof LABEL_COLORS] || 'bg-slate-500'}`}
                >
                  {label.name}
                </Badge>
              ))}
              <Badge
                className={PRIORITIES[task?.priority as keyof typeof PRIORITIES]}
              >
                {task?.priority}
              </Badge>
              {task?.dueDate && (
                <Badge variant="outline" className={cn(isOverdue && 'border-red-500 text-red-500')}>
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {task?.description || 'No description provided.'}
              </p>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-700">Assigned to:</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-brand text-brand">
                    {task?.assignee?.avatar || task?.assignee?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-600">{task?.assignee?.name || 'Unassigned'}</span>
              </div>
            </div>

            {/* Checklists */}
            {localChecklists.length > 0 && localChecklists.map((checklist: any) => {
              const completedCount = checklist.items?.filter((item: any) => item.isCompleted).length || 0
              const totalCount = checklist.items?.length || 0

              return (
                <div key={checklist.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CheckSquare2 className="h-4 w-4 text-brand" />
                      {checklist.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {completedCount}/{totalCount}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    {checklist.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklistItem(checklist.id, item.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span
                          className={cn(
                            'flex-1 text-sm',
                            item.isCompleted && 'line-through text-muted-foreground'
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add checklist item..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                      className="flex-1 h-8"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleAddChecklistItem(checklist.id)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Comments */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand" />
                Comments ({localComments.length})
              </h3>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {localComments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No comments yet</p>
                ) : (
                  localComments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-brand text-brand">
                          {comment.user?.avatar || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(comment.createdAt), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                  className="flex-1 min-h-[60px] text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="h-auto self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Attachments */}
            {task?.attachments > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-brand" />
                  Attachments ({task?.attachments})
                </h3>
                <div className="flex items-center justify-center p-4 bg-slate-50 rounded-md text-sm text-slate-500">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Attachment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

