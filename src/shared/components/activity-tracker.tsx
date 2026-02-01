'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { updateUserActivity } from '@/shared/services/activity-tracker'

const ACTIVITY_UPDATE_INTERVAL = 60000 // Update every minute
const MIN_TIME_BETWEEN_UPDATES = 30000 // Minimum 30 seconds between updates

export function ActivityTracker() {
  const pathname = usePathname()
  const lastUpdate = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get readable location from pathname
  const getLocationName = useCallback((path: string): string => {
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Inicio'

    const locations: Record<string, string> = {
      home: 'Inicio',
      fids: 'FIDS',
      directory: 'Directorio',
      pilot: 'Logbook',
      fa: 'FA',
      academy: 'Academy',
      profile: 'Perfil',
      admin: 'Admin',
      support: 'Soporte',
    }

    // Find first matching segment
    for (const segment of segments) {
      if (locations[segment]) return locations[segment]
    }

    return segments[0] || 'App'
  }, [])

  // Track activity
  const trackActivity = useCallback(async () => {
    const now = Date.now()
    if (now - lastUpdate.current < MIN_TIME_BETWEEN_UPDATES) return

    lastUpdate.current = now
    const location = getLocationName(pathname)

    await updateUserActivity({ location })
  }, [pathname, getLocationName])

  useEffect(() => {
    // Track immediately on mount and path change
    trackActivity()

    // Set up interval for periodic updates
    intervalRef.current = setInterval(() => trackActivity(), ACTIVITY_UPDATE_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [trackActivity])

  // Track on visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        if (now - lastUpdate.current >= MIN_TIME_BETWEEN_UPDATES) {
          lastUpdate.current = now
          await trackActivity()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [trackActivity])

  return null // This component doesn't render anything
}
