'use client'

import { useEffect, useCallback } from 'react'
import { useFIDSStore } from '../store'
import { getFlights } from '../services'
import type { FIDSFilters } from '../types'

export function useFlights(initialFilters?: FIDSFilters) {
  const {
    flights,
    filters,
    isLoading,
    lastUpdated,
    setFlights,
    setFilters,
    setLoading,
    updateFlight,
    addFlight,
  } = useFIDSStore()

  const fetchFlights = useCallback(async (newFilters?: FIDSFilters) => {
    setLoading(true)
    const currentFilters = newFilters || filters
    const result = await getFlights(currentFilters)

    if (result.data) {
      setFlights(result.data)
    }
  }, [filters, setFlights, setLoading])

  // Initial fetch
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
    fetchFlights(initialFilters)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFlights()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchFlights])

  const changeFilters = useCallback((newFilters: Partial<FIDSFilters>) => {
    setFilters(newFilters)
    fetchFlights({ ...filters, ...newFilters })
  }, [filters, setFilters, fetchFlights])

  return {
    flights,
    filters,
    isLoading,
    lastUpdated,
    refetch: fetchFlights,
    setFilters: changeFilters,
    updateFlight,
    addFlight,
  }
}
