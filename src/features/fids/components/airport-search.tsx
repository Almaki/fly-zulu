'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Star, Plane, X, ChevronRight, Globe } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { searchAirports, AIRPORTS, type Airport } from '../constants/airports'

interface AirportSearchProps {
  onSelect: (airport: Airport) => void
  onCancel?: () => void
}

export function AirportSearch({ onSelect, onCancel }: AirportSearchProps) {
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites
  useEffect(() => {
    const stored = localStorage.getItem('fids_favorites')
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [])

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchAirports(query, 15)
  }, [query])

  // Favorite airports data
  const favoriteAirports = useMemo(() => {
    return AIRPORTS.filter(a => favorites.includes(a.code))
  }, [favorites])

  // Popular Mexican airports (quick access)
  const popularAirports = useMemo(() => {
    const popularCodes = ['MEX', 'CUN', 'GDL', 'MTY', 'TIJ', 'PVR', 'SJD', 'MID']
    return AIRPORTS.filter(a => popularCodes.includes(a.code))
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#27272a] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#E91E8C]/50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#fafafa]">Tablero de Salidas</h1>
              <p className="text-xs text-zinc-500">Selecciona un aeropuerto</p>
            </div>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-lg">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Buscar aeropuerto (MEX, Cancún, etc.)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-[#141414] border-[#27272a] text-[#fafafa] placeholder:text-zinc-600"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Search Results */}
        {query && results.length > 0 && (
          <div className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
              Resultados
            </p>
            <div className="space-y-1">
              {results.map((airport) => (
                <AirportItem
                  key={airport.code}
                  airport={airport}
                  isFavorite={favorites.includes(airport.code)}
                  onSelect={() => onSelect(airport)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && results.length === 0 && (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">
              No se encontró "{query}"
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Intenta con el código IATA o nombre de ciudad
            </p>
          </div>
        )}

        {/* Default view (no query) */}
        {!query && (
          <>
            {/* Favorites */}
            {favoriteAirports.length > 0 && (
              <div className="p-4 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    Favoritos
                  </p>
                </div>
                <div className="space-y-1">
                  {favoriteAirports.map((airport) => (
                    <AirportItem
                      key={airport.code}
                      airport={airport}
                      isFavorite={true}
                      onSelect={() => onSelect(airport)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Popular airports */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-[#E91E8C]" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Aeropuertos Populares
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularAirports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => onSelect(airport)}
                    className="bg-[#141414] border border-[#27272a] rounded-xl p-3 text-left hover:border-[#E91E8C]/50 hover:bg-[#E91E8C]/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold text-[#fafafa] font-mono">
                        {airport.code}
                      </span>
                      {favorites.includes(airport.code) && (
                        <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                      {airport.city}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* All airports link */}
            <div className="p-4 pt-0">
              <p className="text-xs text-zinc-600 text-center">
                Busca cualquier aeropuerto escribiendo su código o ciudad
              </p>
            </div>
          </>
        )}
      </div>

      {/* Info footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8 pb-4 px-4">
        <div className="bg-[#141414] border border-[#27272a] rounded-xl p-3">
          <p className="text-xs text-zinc-400 text-center">
            <span className="text-[#E91E8C] font-medium">Colaborativo:</span> Agrega vuelos para ayudar a otros tripulantes
          </p>
        </div>
      </div>
    </div>
  )
}

// Airport list item
function AirportItem({
  airport,
  isFavorite,
  onSelect,
}: {
  airport: Airport
  isFavorite: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#E91E8C]/10 flex items-center justify-center">
        <span className="text-lg font-bold text-[#E91E8C] font-mono">
          {airport.code}
        </span>
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#fafafa]">
            {airport.city}
          </p>
          {isFavorite && (
            <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
          )}
        </div>
        <p className="text-xs text-zinc-500 truncate">
          {airport.name}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#E91E8C] transition-colors" />
    </button>
  )
}
