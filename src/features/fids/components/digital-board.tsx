'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Star, Plus, RefreshCw, Plane,
  ChevronDown, Users, MapPin, Clock, ArrowRight,
  X, Check, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useFlights } from '../hooks'
import { useAuth } from '@/features/auth/hooks'
import { FlightRow } from './flight-row'
import { AddFlightSheet } from './add-flight-sheet'
import { AirportSearch } from './airport-search'
import { ExchangeRateCollapsible } from './exchange-rate-collapsible'
import { searchAirports, getCityName, type Airport } from '../constants/airports'
import type { FIDSFilters } from '../types'

interface DigitalBoardProps {
  initialAirport?: string
}

export function DigitalBoard({ initialAirport }: DigitalBoardProps) {
  const { user } = useAuth()
  const [selectedAirport, setSelectedAirport] = useState<string | null>(initialAirport || null)
  const [showSearch, setShowSearch] = useState(!initialAirport)
  const [showAddFlight, setShowAddFlight] = useState(false)
  const [direction, setDirection] = useState<'departures' | 'arrivals'>('departures')
  const [isFavorite, setIsFavorite] = useState(false)

  const filters: FIDSFilters = {
    airport: selectedAirport || undefined,
    direction,
  }

  const {
    flights,
    isLoading,
    lastUpdated,
    refetch,
    addFlight,
  } = useFlights(filters)

  // Check if airport is favorite (from localStorage for now)
  useEffect(() => {
    if (selectedAirport) {
      const favorites = JSON.parse(localStorage.getItem('fids_favorites') || '[]')
      setIsFavorite(favorites.includes(selectedAirport))
    }
  }, [selectedAirport])

  // Load favorite airport on mount
  useEffect(() => {
    if (!initialAirport) {
      const favorites = JSON.parse(localStorage.getItem('fids_favorites') || '[]')
      const primaryFavorite = localStorage.getItem('fids_primary_favorite')
      if (primaryFavorite) {
        setSelectedAirport(primaryFavorite)
        setShowSearch(false)
      } else if (favorites.length > 0) {
        setSelectedAirport(favorites[0])
        setShowSearch(false)
      }
    }
  }, [initialAirport])

  const handleSelectAirport = (airport: Airport) => {
    setSelectedAirport(airport.code)
    setShowSearch(false)
  }

  const toggleFavorite = () => {
    if (!selectedAirport) return

    const favorites = JSON.parse(localStorage.getItem('fids_favorites') || '[]')
    let newFavorites: string[]

    if (isFavorite) {
      newFavorites = favorites.filter((f: string) => f !== selectedAirport)
      if (localStorage.getItem('fids_primary_favorite') === selectedAirport) {
        localStorage.removeItem('fids_primary_favorite')
      }
      toast.success('Aeropuerto removido de favoritos')
    } else {
      newFavorites = [...favorites, selectedAirport]
      // Set as primary if it's the first favorite
      if (newFavorites.length === 1) {
        localStorage.setItem('fids_primary_favorite', selectedAirport)
      }
      toast.success('Aeropuerto agregado a favoritos')
    }

    localStorage.setItem('fids_favorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleFlightAdded = useCallback((flight: any) => {
    addFlight(flight)
    setShowAddFlight(false)
    toast.success('Vuelo agregado al tablero')
  }, [addFlight])

  // Airport search view
  if (showSearch) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <AirportSearch
          onSelect={handleSelectAirport}
          onCancel={selectedAirport ? () => setShowSearch(false) : undefined}
        />
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Digital Board Header - Airport Style */}
      <div className="bg-background border-b-2 border-[#1a1a1a] sticky top-0 z-20">
        {/* Airport selector */}
        <div className="w-full flex items-center justify-between px-4 py-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowSearch(true)}
            onKeyDown={(e) => e.key === 'Enter' && setShowSearch(true)}
            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#E91E8C]" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-[#fafafa] tracking-wide">
                {selectedAirport}
              </p>
              <p className="text-xs text-zinc-500">
                {getCityName(selectedAirport || '')}
              </p>
            </div>
            <ChevronDown className="w-5 h-5 text-zinc-500 ml-auto" />
          </div>
          <button
            onClick={toggleFavorite}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors ml-2"
            aria-label={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
          >
            <Star
              className={`w-5 h-5 ${isFavorite ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-zinc-600'}`}
            />
          </button>
        </div>

        {/* Exchange Rate - Only for MEX and TIJ - Collapsible Card */}
        {selectedAirport && (selectedAirport === 'MEX' || selectedAirport === 'TIJ') && (
          <div className="px-4 pb-3">
            <ExchangeRateCollapsible airportCode={selectedAirport} />
          </div>
        )}

        {/* Direction tabs */}
        <div className="flex border-t border-[#1a1a1a]">
          <button
            onClick={() => setDirection('departures')}
            className={`flex-1 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
              direction === 'departures'
                ? 'text-[#00ff41] border-b-2 border-[#00ff41] bg-[#00ff41]/5'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Salidas
          </button>
          <button
            onClick={() => setDirection('arrivals')}
            className={`flex-1 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
              direction === 'arrivals'
                ? 'text-[#00ffff] border-b-2 border-[#00ffff] bg-[#00ffff]/5'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Llegadas
          </button>
        </div>
      </div>

      {/* Column Headers - FIDS Style */}
      <div className="bg-[#141414] border-b border-[#27272a] px-3 py-2 grid grid-cols-12 gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider sticky top-[106px] z-10">
        <div className="col-span-2">Hora</div>
        <div className="col-span-3">Vuelo</div>
        <div className="col-span-4">{direction === 'departures' ? 'Destino' : 'Origen'}</div>
        <div className="col-span-2">Puerta</div>
        <div className="col-span-1 text-center">Est</div>
      </div>

      {/* Flight Rows */}
      <div className="divide-y divide-[#1a1a1a]">
        {isLoading && flights.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background px-3 py-4 animate-pulse">
              <div className="grid grid-cols-12 gap-1">
                <div className="col-span-2 h-5 bg-zinc-800 rounded" />
                <div className="col-span-3 h-5 bg-zinc-800 rounded" />
                <div className="col-span-4 h-5 bg-zinc-800 rounded" />
                <div className="col-span-2 h-5 bg-zinc-800 rounded" />
                <div className="col-span-1 h-5 bg-zinc-800 rounded" />
              </div>
            </div>
          ))
        ) : flights.length === 0 ? (
          // Empty state - Collaborative invitation
          <div className="py-12 px-4">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 flex items-center justify-center">
                  <Plane className="w-10 h-10 text-[#E91E8C]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-black" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#fafafa] mb-2 animate-nudge">
                ¡Sé el primero en colaborar!
              </h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Este tablero es colaborativo. Agrega los vuelos de {selectedAirport} para ayudar a otros tripulantes.
              </p>
            </div>

            {/* How to collaborate */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-xs text-zinc-500 mb-3 text-center uppercase tracking-wider">
                ¿Cómo funciona?
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#E91E8C]">1</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <span className="text-[#fafafa] font-medium">Agrega un vuelo</span> con hora, número, destino y puerta
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#f59e0b]">2</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <span className="text-[#fafafa] font-medium">Actualiza el status</span> si hay delay o cambio de puerta
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#22c55e]">3</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    <span className="text-[#fafafa] font-medium">Todos se benefician</span> de información actualizada
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowAddFlight(true)}
              className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-bold py-6"
              disabled={!user}
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar primer vuelo
            </Button>

            {!user && (
              <p className="text-xs text-zinc-600 text-center mt-3">
                Inicia sesión para colaborar
              </p>
            )}

            <p className="text-xs text-zinc-600 text-center mt-4 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Juntos hacemos la diferencia
            </p>
          </div>
        ) : (
          // Flight rows
          flights.map((flight) => (
            <FlightRow
              key={flight.id}
              flight={flight}
              direction={direction}
              airportCode={selectedAirport || ''}
            />
          ))
        )}
      </div>

      {/* Footer with info */}
      {flights.length > 0 && (
        <div className="bg-background border-t border-[#1a1a1a] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              {lastUpdated && (
                <span>Act: {format(lastUpdated, 'HH:mm')}</span>
              )}
            </div>
            <span className="text-xs text-zinc-500">
              {flights.length} vuelo{flights.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Last collaborator info */}
          {(() => {
            const lastUpdatedFlight = flights.reduce((latest, flight) => {
              const flightDate = new Date(flight.updated_at)
              return flightDate > new Date(latest.updated_at) ? flight : latest
            }, flights[0])

            if (lastUpdatedFlight?.updated_by_name) {
              return (
                <div className="mt-2 pt-2 border-t border-zinc-800/50 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-[#f59e0b]" />
                  <span className="text-[10px] text-zinc-400">
                    Colaboración de <span className="text-[#f59e0b] font-medium">{lastUpdatedFlight.updated_by_name}</span>
                  </span>
                </div>
              )
            }
            return null
          })()}
        </div>
      )}

      {/* FAB - Add Flight */}
      {user && selectedAirport && flights.length > 0 && (
        <button
          onClick={() => setShowAddFlight(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/30 flex items-center justify-center hover:bg-[#E91E8C]/90 transition-all hover:scale-105 z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Flight Sheet */}
      <AddFlightSheet
        open={showAddFlight}
        onOpenChange={setShowAddFlight}
        airportCode={selectedAirport || ''}
        direction={direction}
        onFlightAdded={handleFlightAdded}
      />
    </div>
  )
}
