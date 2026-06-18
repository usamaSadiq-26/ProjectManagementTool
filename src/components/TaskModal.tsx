'use client'

import { useState, useEffect, useRef } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  User,
  Tag,
  CheckSquare2,
  MessageSquare,
  Paperclip,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const PRIORITIES = ['High', 'Medium', 'Low'] as const
const CARD_TYPES = ['Task', 'Bug', 'Feature'] as const
const LABEL_COLORS = {
  Urgent: 'bg-red-500',
  Feature: 'bg-brand',
  Bug: 'bg-orange-500',
  Research: 'bg-blue-500',
  Design: 'bg-pink-500',
  Testing: 'bg-cyan-500',
  Documentation: 'bg-slate-500',
}

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: any) => void
  task?: any
  mode?: 'create' | 'edit'
}

export function TaskModal({
  open,
  onOpenChange,
  onSave,
  task,
  mode = 'create',
}: TaskModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>(
    task?.priority || 'Medium'
  )
  const [type, setType] = useState<(typeof CARD_TYPES)[number]>(
    task?.type || 'Task'
  )
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  )
  const [assignee, setAssignee] = useState(task?.assignee?.id || '')
  const [labels, setLabels] = useState<string[]>(task?.labels || [])
  const [checklist, setChecklist] = useState(task?.checklist || [])
  const [comments, setComments] = useState(task?.comments || [])
  const [attachments, setAttachments] = useState(task?.attachments || [])
  const [newLabel, setNewLabel] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newComment, setNewComment] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          // Handle different response formats
          const usersArray = Array.isArray(data) ? data : (data?.users || [])
          setUsers(usersArray.map((user: any) => ({
            id: user.id,
            name: user.name,
            avatar: user.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
          })))
        })
        .catch((err) => {
          console.error('Failed to fetch users:', err)
          setUsers([])
        })
    }
  }, [open])

  const handleAddLabel = () => {
    if (newLabel && !labels.includes(newLabel)) {
      setLabels([...labels, newLabel])
      setNewLabel('')
    }
  }

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label))
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem) {
      setChecklist([
        ...checklist,
        { id: Date.now().toString(), title: newChecklistItem, completed: false },
      ])
      setNewChecklistItem('')
    }
  }

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item: any) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item: any) => item.id !== id))
  }

  const handleAddComment = () => {
    if (newComment) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          content: newComment,
          user: {
            name: currentUser.name || 'User',
            avatar: currentUser.name?.split(' ').map(n => n[0]).join('') || 'U',
          },
          createdAt: new Date(),
        },
      ])
      setNewComment('')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
    }))

    setAttachments([...attachments, ...newAttachments])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a: any) => a.id !== attachmentId))
  }

  const handleSave = () => {
    const taskData = {
      title,
      description,
      priority,
      type,
      dueDate: dueDate?.toISOString(),
      assignee: users.find((u) => u.id === assignee),
      labels,
      checklist,
      comments,
      attachments,
    }
    onSave(taskData)
  }

  const isOverdue = dueDate && dueDate < new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Fill in the details below to {mode === 'create' ? 'create' : 'update'}{' '}
            your task.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Title and Type */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title" className="text-slate-200">Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-slate-200">Type</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger id="type" className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-slate-200">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value: any) => setPriority(value)}
                >
                  <SelectTrigger id="priority" className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-slate-200">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-brand"
            />
          </div>

          {/* Due Date and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-200">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full mt-1 justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground',
                      isOverdue && 'border-red-500 text-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="assignee" className="text-slate-200">Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger id="assignee" className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-brand/30 text-brand border border-brand/50">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-200">{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          <div>
            <Label className="flex items-center gap-2 text-slate-200">
              <Tag className="h-4 w-4" />
              Labels
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {labels.map((label) => (
                <Badge
                  key={label}
                  className={`text-white ${LABEL_COLORS[label as keyof typeof LABEL_COLORS] || 'bg-slate-500'}`}
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="ml-1 hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add label (e.g., Urgent, Feature)..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddLabel}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.keys(LABEL_COLORS).map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="cursor-pointer hover:opacity-80 border-slate-600 text-slate-300 hover:text-white"
                  onClick={() => {
                    if (!labels.includes(label)) {
                      setLabels([...labels, label])
                    }
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <Label className="flex items-center gap-2 text-slate-200">
              <CheckSquare2 className="h-4 w-4" />
              Checklist
              {checklist.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {checklist.filter((c: any) => c.completed).length}/{checklist.length}
                </Badge>
              )}
            </Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {checklist.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800/50 text-brand focus:ring-brand"
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm text-slate-200',
                      item.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add checklist item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddChecklistItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label className="flex items-center gap-2 text-slate-200">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </Label>
            <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-2 text-sm">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-brand/30 text-brand border border-brand/50">
                      {comment.user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'PPp')}
                      </span>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddComment}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label className="flex items-center gap-2 text-slate-200">
              <Paperclip className="h-4 w-4" />
              Attachments ({attachments.length})
            </Label>
            
            {/* Display existing attachments */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {attachments.map((attachment: any) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{attachment.name}</p>
                      <p className="text-xs text-slate-400">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-400"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              />
              <Button
                variant="outline"
                className="w-full border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attachment
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700/50 bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-brand to-brand/70 hover:from-brand hover:to-brand/70 shadow-lg shadow-brand/25">
            {mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

