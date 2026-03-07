import { create } from 'zustand'
import type { User } from '@/shared/types'

interface ImpersonationStore {
  impersonating: User | null
  setImpersonating: (user: User) => void
  clearImpersonating: () => void
}

export const useImpersonationStore = create<ImpersonationStore>()((set) => ({
  impersonating: null,
  setImpersonating: (user) => set({ impersonating: user }),
  clearImpersonating: () => set({ impersonating: null }),
}))
