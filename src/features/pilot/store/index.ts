import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PilotLog } from '../types'

interface PilotStore {
  logs: PilotLog[]
  currentDutyStart: string | null
  pendingSync: PilotLog[]

  setLogs: (logs: PilotLog[]) => void
  addLog: (log: PilotLog) => void
  updateLog: (id: string, updates: Partial<PilotLog>) => void
  setDutyStart: (time: string | null) => void
  addPendingSync: (log: PilotLog) => void
  removePendingSync: (id: string) => void
  clearPendingSync: () => void
}

const STORE_VERSION = 1

export const usePilotStore = create<PilotStore>()(
  persist(
    (set) => ({
      logs: [],
      currentDutyStart: null,
      pendingSync: [],

      setLogs: (logs) => set({ logs }),

      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        })),

      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      setDutyStart: (time) => set({ currentDutyStart: time }),

      addPendingSync: (log) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, log],
        })),

      removePendingSync: (id) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((l) => l.id !== id),
        })),

      clearPendingSync: () => set({ pendingSync: [] }),
    }),
    {
      name: 'fly-zulu-pilot',
      version: STORE_VERSION,
    }
  )
)
