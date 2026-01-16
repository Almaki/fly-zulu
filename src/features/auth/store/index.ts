import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/shared/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

const STORE_VERSION = 1

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      _hasHydrated: false,

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

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'fly-zulu-auth',
      version: STORE_VERSION,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
