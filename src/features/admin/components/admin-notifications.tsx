'use client'

import { useEffect, useState } from 'react'
import { X, UserPlus, UserMinus, Ban, CreditCard, FolderPlus, FolderEdit, Trash2, Bell, Pin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAdminNotifications } from '../hooks'
import type { AdminEventType } from '../types'

const EVENT_ICONS: Record<AdminEventType, React.ReactNode> = {
  user_registered: <UserPlus className="h-5 w-5 text-green-400" />,
  user_deleted: <UserMinus className="h-5 w-5 text-red-400" />,
  user_banned: <Ban className="h-5 w-5 text-red-500" />,
  user_unbanned: <Ban className="h-5 w-5 text-green-400" />,
  subscription_changed: <CreditCard className="h-5 w-5 text-yellow-400" />,
  directory_created: <FolderPlus className="h-5 w-5 text-blue-400" />,
  directory_updated: <FolderEdit className="h-5 w-5 text-blue-300" />,
  directory_deleted: <Trash2 className="h-5 w-5 text-red-400" />,
  flight_created: <Bell className="h-5 w-5 text-purple-400" />,
  ticket_created: <Bell className="h-5 w-5 text-orange-400" />,
  aviso_permanente_request: <Pin className="h-5 w-5 text-yellow-400" />
}

const EVENT_COLORS: Record<AdminEventType, string> = {
  user_registered: 'border-green-500/50 bg-green-500/10',
  user_deleted: 'border-red-500/50 bg-red-500/10',
  user_banned: 'border-red-600/50 bg-red-600/10',
  user_unbanned: 'border-green-500/50 bg-green-500/10',
  subscription_changed: 'border-yellow-500/50 bg-yellow-500/10',
  directory_created: 'border-blue-500/50 bg-blue-500/10',
  directory_updated: 'border-blue-400/50 bg-blue-400/10',
  directory_deleted: 'border-red-400/50 bg-red-400/10',
  flight_created: 'border-purple-500/50 bg-purple-500/10',
  ticket_created: 'border-orange-500/50 bg-orange-500/10',
  aviso_permanente_request: 'border-yellow-500/50 bg-yellow-500/10'
}

export function AdminNotifications() {
  const { latestNotification, dismissNotification } = useAdminNotifications({
    enabled: true,
    soundEnabled: true
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true)
      setIsExiting(false)
    }
  }, [latestNotification])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)
      dismissNotification()
    }, 300)
  }

  if (!isVisible || !latestNotification) return null

  const eventType = latestNotification.event_type as AdminEventType
  const icon = EVENT_ICONS[eventType] || <Bell className="h-5 w-5 text-zinc-400" />
  const colorClass = EVENT_COLORS[eventType] || 'border-zinc-500/50 bg-zinc-500/10'

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-slide-in-right'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-lg border-2 ${colorClass} backdrop-blur-sm shadow-2xl`}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-white/20 w-full">
          <div
            className="h-full bg-white/60 animate-shrink-width"
            style={{ animationDuration: '5s' }}
          />
        </div>

        <div className="p-4 pt-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 rounded-full bg-zinc-800/50">
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-white truncate">
                  {latestNotification.title}
                </h4>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 hover:bg-zinc-700/50 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>

              <p className="mt-1 text-sm text-zinc-300 line-clamp-2">
                {latestNotification.message}
              </p>

              {latestNotification.user_position && (
                <p className="mt-1 text-xs text-zinc-500">
                  {latestNotification.user_position}
                </p>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                {formatDistanceToNow(new Date(latestNotification.created_at), {
                  addSuffix: true,
                  locale: es
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
