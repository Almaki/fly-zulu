'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import type { AdminNotification } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

const NOTIFICATION_SOUND_URL = '/sounds/Aviation_Seat_Belt_Chime_Airplane_Interior_Fasten_Seatbelts_Bell_SDCOLLA_45251.wav'

interface UseAdminNotificationsOptions {
  enabled?: boolean
  soundEnabled?: boolean
}

export function useAdminNotifications(options: UseAdminNotificationsOptions = {}) {
  const { enabled = true, soundEnabled = true } = options
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [latestNotification, setLatestNotification] = useState<AdminNotification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined' && soundEnabled) {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL)
      audioRef.current.volume = 0.5
    }
    return () => {
      audioRef.current = null
    }
  }, [soundEnabled])

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked, that's ok
      })
    }
  }, [soundEnabled])

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
      // Count unread (not in read_by array for current user - simplified for now)
      setUnreadCount(data?.length || 0)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!enabled) return

    fetchNotifications()

    // Subscribe to realtime changes
    channelRef.current = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification
          setNotifications((prev) => [newNotification, ...prev])
          setLatestNotification(newNotification)
          setUnreadCount((prev) => prev + 1)
          playSound()

          // Clear latest after 5 seconds
          setTimeout(() => {
            setLatestNotification((current) =>
              current?.id === newNotification.id ? null : current
            )
          }, 5000)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [enabled, supabase, fetchNotifications, playSound])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string, userId: string) => {
    try {
      // Get current read_by array and add user
      const notification = notifications.find((n) => n.id === notificationId)
      if (!notification) return

      const newReadBy = [...(notification.read_by || []), userId]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('admin_notifications')
        .update({ read_by: newReadBy })
        .eq('id', notificationId)

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_by: newReadBy } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }, [notifications, supabase])

  // Clear all notifications display
  const clearLatest = useCallback(() => {
    setLatestNotification(null)
  }, [])

  // Dismiss notification (mark as read for current user)
  const dismissNotification = useCallback(() => {
    setLatestNotification(null)
  }, [])

  return {
    notifications,
    latestNotification,
    isLoading,
    unreadCount,
    markAsRead,
    clearLatest,
    dismissNotification,
    refetch: fetchNotifications
  }
}
