'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { useAuth } from '@/features/auth/hooks'
import type { EventCategory } from '../types'

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

interface TrackEventOptions {
  category?: EventCategory
  data?: Record<string, unknown>
}

export function useAnalytics() {
  const { user } = useAuth()
  const pathname = usePathname()
  const lastPageRef = useRef<string | null>(null)
  const supabase = createClient()

  // Track page views automatically
  useEffect(() => {
    if (pathname && pathname !== lastPageRef.current) {
      lastPageRef.current = pathname
      trackEvent('page_view', {
        category: 'navigation',
        data: { page: pathname }
      })
    }
  }, [pathname])

  const trackEvent = useCallback(async (
    eventType: string,
    options: TrackEventOptions = {}
  ) => {
    const { category = 'interaction', data = {} } = options

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('app_events').insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_category: category,
        event_data: data,
        page_path: pathname,
        session_id: getSessionId(),
        device_type: getDeviceType()
      })
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics error:', error)
    }
  }, [user?.id, pathname, supabase])

  // Convenience methods
  const trackClick = useCallback((element: string, data?: Record<string, unknown>) => {
    trackEvent('click', { category: 'interaction', data: { element, ...data } })
  }, [trackEvent])

  const trackFeatureUse = useCallback((feature: string, data?: Record<string, unknown>) => {
    trackEvent('feature_use', { category: 'feature_usage', data: { feature, ...data } })
  }, [trackEvent])

  const trackError = useCallback((error: string, context?: Record<string, unknown>) => {
    trackEvent('error', { category: 'error', data: { error, ...context } })
  }, [trackEvent])

  const trackEngagement = useCallback((action: string, data?: Record<string, unknown>) => {
    trackEvent(action, { category: 'engagement', data })
  }, [trackEvent])

  return {
    trackEvent,
    trackClick,
    trackFeatureUse,
    trackError,
    trackEngagement
  }
}
