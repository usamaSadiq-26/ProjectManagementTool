'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

interface NotificationContextType {
  socket: Socket | null
  isConnected: boolean
  unreadCount: number
  notifications: Notification[]
  markAsRead: (notificationId: string) => void
  connect: (userId: string) => void
  disconnect: () => void
}

interface Notification {
  id: string
  type: string
  message: string
  taskId?: string
  isRead: boolean
  createdAt: Date
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const connect = (userId: string) => {
    if (socket?.connected) return

    const newSocket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to notification service')
      setIsConnected(true)
      newSocket.emit('user:join', userId)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification service')
      setIsConnected(false)
    })

    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast(notification.message, {
        description: notification.type,
      })
    })

    newSocket.on('task:updated', (data: { taskId: string; type: string }) => {
      console.log('Task updated:', data)
    })

    newSocket.on('task:moved', (data: { taskId: string; fromStatus: string; toStatus: string }) => {
      console.log('Task moved:', data)
    })

    newSocket.on('task:commented', (data: { taskId: string; commentId: string }) => {
      console.log('Task commented:', data)
    })

    setSocket(newSocket)
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notification/${notificationId}`, {
        method: 'PUT',
      })

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  return (
    <NotificationContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        notifications,
        markAsRead,
        connect,
        disconnect,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
