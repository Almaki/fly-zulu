import { create } from 'zustand'
import type { DirectoryEntry, DirectoryFilters } from '../types'

interface DirectoryStore {
  entries: DirectoryEntry[]
  filters: DirectoryFilters
  isLoading: boolean

  setEntries: (entries: DirectoryEntry[]) => void
  setFilters: (filters: Partial<DirectoryFilters>) => void
  setLoading: (isLoading: boolean) => void
  addEntry: (entry: DirectoryEntry) => void
}

export const useDirectoryStore = create<DirectoryStore>((set) => ({
  entries: [],
  filters: {},
  isLoading: false,

  setEntries: (entries) => set({ entries, isLoading: false }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries],
    })),
}))
