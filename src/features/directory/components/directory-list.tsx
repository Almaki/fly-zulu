'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, MapPin, Hotel, Car, Utensils, Plane, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { DIRECTORY_CATEGORIES, getAirportByCode, type Airport } from '@/shared/constants'
import { DirectoryEntryCard } from './directory-entry-card'
import { DirectoryEntryForm } from './directory-entry-form'
import { AirportSearch } from './airport-search'
import { useDirectoryStore } from '../store'
import { getDirectoryEntries } from '../services'
import { useAuth } from '@/features/auth/hooks'
import type { DirectoryFilters, DirectoryEntry } from '../types'

export function DirectoryList() {
  const { entries, filters, isLoading, setEntries, setFilters, setLoading } =
    useDirectoryStore()
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DirectoryEntry | null>(null)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)

  // Solo usuarios FLIGHT (PILOT o FA) pueden agregar entradas
  const canAddEntries = (user as { categoria?: string })?.categoria === 'FLIGHT'

  const fetchEntries = useCallback(async (newFilters?: DirectoryFilters) => {
    setLoading(true)
    const currentFilters = newFilters || filters
    const result = await getDirectoryEntries(currentFilters)

    if (result.data) {
      setEntries(result.data)
    }
    setLoading(false)
  }, [filters, setEntries, setLoading])

  // Load entries when airport is selected
  useEffect(() => {
    if (selectedAirport) {
      setFilters({ airport: selectedAirport.code })
      fetchEntries({ airport: selectedAirport.code })
    }
  }, [selectedAirport]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport)
  }

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'all' ? undefined : category
    setFilters({ category: newCategory })
    fetchEntries({ ...filters, category: newCategory })
  }

  const handleBack = () => {
    setSelectedAirport(null)
    setEntries([])
    setFilters({})
  }

  // Vista inicial: solo buscador
  if (!selectedAirport) {
    return (
      <div className="min-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex p-4 rounded-full bg-[#22c55e]/10 mb-4">
            <MapPin className="h-10 w-10 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa] mb-2">
            Directorio de Servicios
          </h1>
          <p className="text-[#71717a] text-sm max-w-xs mx-auto">
            Encuentra hoteles, transporte, restaurantes y más cerca de cada aeropuerto
          </p>
        </div>

        {/* Search */}
        <div className="flex-1 flex flex-col items-center px-4">
          <AirportSearch
            onSelect={handleAirportSelect}
            className="max-w-md w-full"
          />

          {/* Quick access chips */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
            {['MEX', 'GDL', 'MTY', 'CUN', 'TIJ', 'BJX'].map(code => {
              const airport = getAirportByCode(code)
              if (!airport) return null
              return (
                <button
                  key={code}
                  onClick={() => handleAirportSelect(airport)}
                  className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#27272a] text-sm text-[#a1a1aa] hover:border-[#22c55e] hover:text-[#22c55e] transition-colors"
                >
                  {code}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer collaboration text */}
        <div className="text-center py-8 border-t border-[#1f1f1f] mt-auto">
          <div className="flex items-center justify-center gap-2 text-[#71717a] text-sm">
            <Users className="w-4 h-4" />
            <span>Directorio colaborativo por y para tripulaciones</span>
          </div>
        </div>
      </div>
    )
  }

  // Vista con aeropuerto seleccionado: mostrar resultados
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg bg-[#1a1a1a] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#a1a1aa]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#22c55e] text-xl">{selectedAirport.code}</span>
            <span className="text-[#fafafa] font-medium">{selectedAirport.city}</span>
          </div>
          <p className="text-xs text-[#71717a]">{selectedAirport.state}</p>
        </div>
        {canAddEntries && (
          <Button
            size="sm"
            className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-black"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        )}
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
            className="text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-black"
          >
            Todos
          </TabsTrigger>
          {DIRECTORY_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-black"
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
                ¡Comparte tu conocimiento de {selectedAirport.code}!
              </h3>
              <p className="text-sm text-[#a1a1aa] mb-6 max-w-xs mx-auto">
                Ayuda a otros tripulantes compartiendo contactos útiles de este aeropuerto.
              </p>

              {/* Grid de categorías */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Utensils className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Radial</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Plane className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Aeropuerto</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Car className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Taxi/Uber</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#27272a]">
                  <Hotel className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#a1a1aa]">Hotel</span>
                </div>
              </div>

              {canAddEntries ? (
                <Button
                  className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-semibold px-6"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer contacto
                </Button>
              ) : (
                <p className="text-sm text-zinc-400">
                  Solo tripulación FLIGHT puede agregar contactos
                </p>
              )}
            </div>

            {/* Glow effect */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        ) : (
          entries.map((entry) => (
            <DirectoryEntryCard
              key={entry.id}
              entry={entry}
              onEdit={(e) => {
                setEditingEntry(e)
                setIsFormOpen(true)
              }}
              onDeleted={() => fetchEntries()}
            />
          ))
        )}
      </div>

      {entries.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {entries.length} {entries.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}
        </p>
      )}

      {/* Footer collaboration text */}
      <div className="text-center py-4 border-t border-[#1f1f1f]">
        <div className="flex items-center justify-center gap-2 text-[#71717a] text-xs">
          <Users className="w-3 h-3" />
          <span>Directorio colaborativo por y para tripulaciones</span>
        </div>
      </div>

      {/* Form modal */}
      <DirectoryEntryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingEntry(null)
        }}
        defaultAirport={selectedAirport.code}
        editEntry={editingEntry}
        onSuccess={() => {
          fetchEntries()
          setEditingEntry(null)
        }}
      />
    </div>
  )
}
