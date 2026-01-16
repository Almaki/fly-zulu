'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getUnreadNotificationCount, getUserNotifications } from '../services'
import type { UserNotification } from '../types'

const SEATBELT_SOUND_URL = '/sounds/seatbelt.mp3'

export function useNotifications(userId: string | undefined, muted: boolean = false) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousCountRef = useRef(0)

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(SEATBELT_SOUND_URL)
      audioRef.current.volume = 0.5
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Audio play failed, likely due to browser autoplay policy
      })
    }
  }, [muted])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return

    const { count } = await getUnreadNotificationCount(userId)

    // Play sound if count increased
    if (count > previousCountRef.current && previousCountRef.current > 0) {
      playNotificationSound()
    }

    previousCountRef.current = count
    setUnreadCount(count)
  }, [userId, playNotificationSound])

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    const { data } = await getUserNotifications(userId)
    if (data) {
      setNotifications(data)
    }
    setIsLoading(false)
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchUnreadCount()
      fetchNotifications()
    }
  }, [userId, fetchUnreadCount, fetchNotifications])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [userId, fetchUnreadCount])

  return {
    unreadCount,
    notifications,
    isLoading,
    refetch: fetchNotifications,
    refetchCount: fetchUnreadCount,
    playNotificationSound,
  }
}
