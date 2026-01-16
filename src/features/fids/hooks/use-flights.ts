'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useFIDSStore } from '../store'
import { getFlights } from '../services'
import type { FIDSFilters } from '../types'

export function useFlights(externalFilters?: FIDSFilters) {
  const {
    flights,
    filters: storeFilters,
    isLoading,
    lastUpdated,
    setFlights,
    setFilters,
    setLoading,
    updateFlight,
    addFlight,
  } = useFIDSStore()

  // Use external filters if provided, otherwise use store filters
  const activeFilters = externalFilters || storeFilters
  const prevFiltersRef = useRef<string>('')

  const fetchFlights = useCallback(async (filtersToUse?: FIDSFilters) => {
    setLoading(true)
    const currentFilters = filtersToUse || activeFilters
    const result = await getFlights(currentFilters)

    if (result.data) {
      setFlights(result.data)
    }
  }, [activeFilters, setFlights, setLoading])

  // Fetch when external filters change
  useEffect(() => {
    const filtersKey = JSON.stringify(externalFilters)
    if (filtersKey !== prevFiltersRef.current) {
      prevFiltersRef.current = filtersKey
      if (externalFilters?.airport) {
        fetchFlights(externalFilters)
      }
    }
  }, [externalFilters, fetchFlights])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeFilters.airport) {
        fetchFlights()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchFlights, activeFilters.airport])

  const changeFilters = useCallback((newFilters: Partial<FIDSFilters>) => {
    setFilters(newFilters)
    fetchFlights({ ...storeFilters, ...newFilters })
  }, [storeFilters, setFilters, fetchFlights])

  return {
    flights,
    filters: activeFilters,
    isLoading,
    lastUpdated,
    refetch: fetchFlights,
    setFilters: changeFilters,
    updateFlight,
    addFlight,
  }
}
