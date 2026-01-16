'use client'

import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/use-notifications'

interface NotificationBellProps {
  userId: string | undefined
  muted?: boolean
  onClick?: () => void
  className?: string
}

export function NotificationBell({
  userId,
  muted = false,
  onClick,
  className = '',
}: NotificationBellProps) {
  const { unreadCount } = useNotifications(userId, muted)

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-zinc-800 rounded-lg transition-colors ${className}`}
      aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
    >
      <Bell className="w-5 h-5 text-zinc-400" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-[#E91E8C] text-white rounded-full animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
