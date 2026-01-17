'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/shared/stores/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, resolvedTheme, setResolvedTheme } = useThemeStore()

  // Update resolved theme when mode is 'auto' based on time
  useEffect(() => {
    if (mode === 'auto') {
      const updateThemeByTime = () => {
        const hour = new Date().getHours()
        const newTheme = hour >= 6 && hour < 18 ? 'light' : 'dark'
        setResolvedTheme(newTheme)
      }

      // Update immediately
      updateThemeByTime()

      // Check every minute
      const interval = setInterval(updateThemeByTime, 60000)
      return () => clearInterval(interval)
    }
  }, [mode, setResolvedTheme])

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)

    // Update meta theme-color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'light' ? '#f4f4f5' : '#18181b'
      )
    }
  }, [resolvedTheme])

  return <>{children}</>
}
