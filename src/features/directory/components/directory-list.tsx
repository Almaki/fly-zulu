'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, MapPin, Hotel, Car, Utensils, Plane, Building2, Users } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { DIRECTORY_CATEGORIES } from '@/shared/constants'
import { DirectoryEntryCard } from './directory-entry-card'
import { DirectoryEntryForm } from './directory-entry-form'
import { useDirectoryStore } from '../store'
import { getDirectoryEntries } from '../services'
import type { DirectoryFilters } from '../types'

export function DirectoryList() {
  const { entries, filters, isLoading, setEntries, setFilters, setLoading } =
    useDirectoryStore()
  const [localSearch, setLocalSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

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
        <Button size="icon" variant="outline" onClick={() => setIsFormOpen(true)}>
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
          <div className="relative overflow-hidden rounded-xl border border-[#22c55e]/30 bg-gradient-to-br from-[#141414] to-[#0a1a0a] p-6">
            {/* Badge colaborativo */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30">
              <Users className="w-3 h-3 text-[#4ade80]" />
              <span className="text-[10px] font-medium text-[#4ade80]">Colaborativo</span>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-[#22c55e]/10 mb-4">
                <MapPin className="h-10 w-10 text-[#22c55e]" />
              </div>

              <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
                {filters.airport
                  ? `¡Comparte tu conocimiento de ${filters.airport}!`
                  : '¡Sé el primero en colaborar!'}
              </h3>
              <p className="text-sm text-[#a1a1aa] mb-6 max-w-xs mx-auto">
                {filters.airport
                  ? 'Ayuda a otros tripulantes compartiendo contactos útiles de este aeropuerto.'
                  : 'Comparte los contactos que te han salvado la vida en pernoctas. Tu experiencia ayuda a todos.'}
              </p>

              {/* Grid de acciones posibles */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Hotel className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Hoteles crew</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Car className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Taxis confianza</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Utensils className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Lugares para comer</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Plane className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Radial</span>
                </div>
              </div>

              <Button
                className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-semibold px-6"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar primer contacto
              </Button>

              <p className="text-xs text-[#52525b] mt-4">
                Juntos construimos el mejor directorio crew de México
              </p>
            </div>

            {/* Glow effect */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
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

      {/* Form modal */}
      <DirectoryEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultAirport={filters.airport}
        onSuccess={() => fetchEntries()}
      />
    </div>
  )
}
