import { create } from 'zustand'
import type { Flight, FIDSFilters } from '../types'

interface FIDSStore {
  flights: Flight[]
  filters: FIDSFilters
  isLoading: boolean
  lastUpdated: Date | null
  setFlights: (flights: Flight[]) => void
  setFilters: (filters: Partial<FIDSFilters>) => void
  setLoading: (isLoading: boolean) => void
  updateFlight: (id: string, updates: Partial<Flight>) => void
  addFlight: (flight: Flight) => void
  removeFlight: (id: string) => void
}

export const useFIDSStore = create<FIDSStore>((set, get) => ({
  flights: [],
  filters: {
    direction: 'all',
    status: 'all',
  },
  isLoading: false,
  lastUpdated: null,

  setFlights: (flights) =>
    set({
      flights,
      lastUpdated: new Date(),
      isLoading: false,
    }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  updateFlight: (id, updates) =>
    set((state) => ({
      flights: state.flights.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  addFlight: (flight) =>
    set((state) => ({
      flights: [...state.flights, flight].sort(
        (a, b) => new Date(a.std).getTime() - new Date(b.std).getTime()
      ),
    })),

  removeFlight: (id) =>
    set((state) => ({
      flights: state.flights.filter((f) => f.id !== id),
    })),
}))
