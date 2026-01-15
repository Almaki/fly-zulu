'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, MapPin } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { DIRECTORY_CATEGORIES } from '@/shared/constants'
import { DirectoryEntryCard } from './directory-entry-card'
import { useDirectoryStore } from '../store'
import { getDirectoryEntries } from '../services'
import type { DirectoryFilters } from '../types'

export function DirectoryList() {
  const { entries, filters, isLoading, setEntries, setFilters, setLoading } =
    useDirectoryStore()
  const [localSearch, setLocalSearch] = useState('')

  const fetchEntries = useCallback(async (newFilters?: DirectoryFilters) => {
    setLoading(true)
    const currentFilters = newFilters || filters
    const result = await getDirectoryEntries(currentFilters)

    if (result.data) {
      setEntries(result.data)
    }
  }, [filters, setEntries, setLoading])

  useEffect(() => {
    fetchEntries()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setFilters({ search: localSearch || undefined })
    fetchEntries({ ...filters, search: localSearch || undefined })
  }

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'all' ? undefined : category
    setFilters({ category: newCategory })
    fetchEntries({ ...filters, category: newCategory })
  }

  const handleAirportChange = (airport: string) => {
    const newAirport = airport || undefined
    setFilters({ airport: newAirport })
    fetchEntries({ ...filters, airport: newAirport })
  }

  return (
    <div className="space-y-4">
      {/* Search and add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Airport filter */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Aeropuerto (MEX)"
          value={filters.airport || ''}
          onChange={(e) => handleAirportChange(e.target.value.toUpperCase())}
          maxLength={3}
          className="w-24 uppercase"
        />
      </div>

      {/* Category tabs */}
      <Tabs
        value={filters.category || 'all'}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
          >
            Todos
          </TabsTrigger>
          {DIRECTORY_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-xs data-[state=active]:bg-[#00ff88] data-[state=active]:text-black"
            >
              {cat.emoji} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Entries list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-zinc-800" />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">
              No hay entradas
            </h3>
            <p className="text-sm text-zinc-600 mt-1">
              {filters.airport
                ? `No hay servicios registrados para ${filters.airport}`
                : 'Sé el primero en agregar un servicio'}
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <DirectoryEntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {entries.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {entries.length} servicio{entries.length !== 1 ? 's' : ''} encontrado
          {entries.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
