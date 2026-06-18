'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Bell, Check, Clock, MessageSquare, UserPlus, ArrowRight } from 'lucide-react'
import { useNotifications } from './NotificationProvider'
import { formatDistanceToNow } from 'date-fns'

const NOTIFICATION_ICONS = {
  card_assigned: UserPlus,
  card_moved: ArrowRight,
  card_commented: MessageSquare,
  card_created: Clock,
  card_updated: Clock,
}

const NOTIFICATION_COLORS = {
  card_assigned: 'bg-blue-100 text-blue-700',
  card_moved: 'bg-brand text-brand',
  card_commented: 'bg-green-100 text-green-700',
  card_created: 'bg-slate-100 text-slate-700',
  card_updated: 'bg-amber-100 text-amber-700',
}

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  // Mark all as read when dialog opens
  useEffect(() => {
    if (open && notifications.length > 0) {
      notifications.forEach((n) => {
        if (!n.isRead) {
          markAsRead(n.id)
        }
      })
    }
  }, [open, notifications, markAsRead])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || Bell
              const colorClass = NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS] || 'bg-slate-100 text-slate-700'

              return (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.isRead ? 'border-brand' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium">
                            {notification.message}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Badge className="bg-brand">New</Badge>
                      )}
                    </div>
                  </CardHeader>
                  {notification.taskId && (
                    <CardContent className="pt-0">
                      <Button variant="ghost" size="sm" className="text-brand hover:text-brand">
                        View Task
                      </Button>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

