import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/shared/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

const STORE_VERSION = 1

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'fly-zulu-auth',
      version: STORE_VERSION,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
