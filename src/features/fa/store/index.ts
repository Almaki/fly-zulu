import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FALog, SpecialPax, Incident } from '../types'

interface FAStore {
  logs: FALog[]
  currentLog: Partial<FALog> | null
  specialPax: SpecialPax[]
  incidents: Incident[]
  pendingSync: FALog[]

  setLogs: (logs: FALog[]) => void
  addLog: (log: FALog) => void
  updateLog: (id: string, updates: Partial<FALog>) => void
  setCurrentLog: (log: Partial<FALog> | null) => void
  updateCurrentLog: (updates: Partial<FALog>) => void

  addSpecialPax: (pax: SpecialPax) => void
  removeSpecialPax: (code: string, seat: string) => void
  clearSpecialPax: () => void

  addIncident: (incident: Incident) => void
  setIncidents: (incidents: Incident[]) => void

  addPendingSync: (log: FALog) => void
  removePendingSync: (id: string) => void
}

const STORE_VERSION = 1

export const useFAStore = create<FAStore>()(
  persist(
    (set) => ({
      logs: [],
      currentLog: null,
      specialPax: [],
      incidents: [],
      pendingSync: [],

      setLogs: (logs) => set({ logs }),

      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          currentLog: null,
        })),

      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      setCurrentLog: (log) => set({ currentLog: log }),

      updateCurrentLog: (updates) =>
        set((state) => ({
          currentLog: state.currentLog
            ? { ...state.currentLog, ...updates }
            : updates,
        })),

      addSpecialPax: (pax) =>
        set((state) => ({
          specialPax: [...state.specialPax, pax],
        })),

      removeSpecialPax: (code, seat) =>
        set((state) => ({
          specialPax: state.specialPax.filter(
            (p) => !(p.code === code && p.seat === seat)
          ),
        })),

      clearSpecialPax: () => set({ specialPax: [] }),

      addIncident: (incident) =>
        set((state) => ({
          incidents: [incident, ...state.incidents],
        })),

      setIncidents: (incidents) => set({ incidents }),

      addPendingSync: (log) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, log],
        })),

      removePendingSync: (id) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((l) => l.id !== id),
        })),
    }),
    {
      name: 'fly-zulu-fa',
      version: STORE_VERSION,
    }
  )
)
