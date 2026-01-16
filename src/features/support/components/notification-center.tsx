'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  MessageCircle,
  Megaphone,
  Info,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotificationSettings,
} from '../services'
import type { UserNotification } from '../types'

interface NotificationCenterProps {
  userId: string
  muted: boolean
  onMutedChange: (muted: boolean) => void
  onClose: () => void
  onTicketClick?: (ticketId: string) => void
}

const TYPE_ICONS = {
  ticket_reply: MessageCircle,
  system: Info,
  announcement: Megaphone,
}

const TYPE_COLORS = {
  ticket_reply: 'text-[#E91E8C]',
  system: 'text-[#3b82f6]',
  announcement: 'text-[#f59e0b]',
}

export function NotificationCenter({
  userId,
  muted,
  onMutedChange,
  onClose,
  onTicketClick,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    const { data } = await getUserNotifications(userId)
    if (data) {
      setNotifications(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const handleMarkAsRead = async (notification: UserNotification) => {
    if (notification.read_at) return

    await markNotificationAsRead(notification.id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, read_at: new Date().toISOString() }
          : n
      )
    )

    // If it's a ticket reply, navigate to the ticket
    if (notification.type === 'ticket_reply' && notification.reference_id && onTicketClick) {
      onTicketClick(notification.reference_id)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId)
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    )
    toast.success('Todas las notificaciones marcadas como leídas')
  }

  const handleMuteToggle = async (newMuted: boolean) => {
    const { error } = await updateNotificationSettings(userId, newMuted)
    if (error) {
      toast.error('Error al actualizar configuración')
      return
    }
    onMutedChange(newMuted)
    toast.success(newMuted ? 'Notificaciones silenciadas' : 'Notificaciones activadas')
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center">
      <div className="bg-[#0a0a0a] w-full max-w-md sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#fafafa]" />
            <h2 className="text-lg font-bold text-[#fafafa]">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[#E91E8C] text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mute toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            {muted ? (
              <BellOff className="w-4 h-4 text-zinc-500" />
            ) : (
              <Bell className="w-4 h-4 text-[#22c55e]" />
            )}
            <span className="text-sm text-zinc-400">
              {muted ? 'Notificaciones silenciadas' : 'Sonido activado'}
            </span>
          </div>
          <Switch
            checked={!muted}
            onCheckedChange={(checked) => handleMuteToggle(!checked)}
          />
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-zinc-800">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#E91E8C] hover:underline"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Info
                const colorClass = TYPE_COLORS[notification.type] || 'text-zinc-400'
                const isUnread = !notification.read_at

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification)}
                    className={`w-full p-4 text-left hover:bg-zinc-900/50 transition-colors ${
                      isUnread ? 'bg-zinc-900/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUnread ? 'bg-[#E91E8C]/20' : 'bg-zinc-800'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isUnread ? colorClass : 'text-zinc-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              isUnread ? 'text-[#fafafa]' : 'text-zinc-400'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#E91E8C] flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-zinc-500 line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-600">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
