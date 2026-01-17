'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
}

// Get current theme based on time of day (6:00 - 18:00 = light)
function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      resolvedTheme: getTimeBasedTheme(),
      setMode: (mode) => {
        const resolvedTheme = mode === 'auto'
          ? getTimeBasedTheme()
          : mode
        set({ mode, resolvedTheme })
      },
      setResolvedTheme: (theme) => set({ resolvedTheme: theme }),
    }),
    {
      name: 'theme-storage',
      version: 1,
    }
  )
)
