'use client'

import { RefreshCw, Plus, Plane, Users, Edit3, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFlights } from '../hooks'
import { FlightCard } from './flight-card'
import { FIDSFiltersComponent } from './fids-filters'
export function FIDSBoard() {
  const {
    flights,
    filters,
    isLoading,
    lastUpdated,
    refetch,
    setFilters,
  } = useFlights()

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          {lastUpdated && (
            <p className="text-xs text-zinc-600">
              Actualizado: {format(lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: Implementar funcionalidad de agregar vuelos
          {canAddFlights && (
            <Button size="sm" variant="outline" className="h-8" onClick={handleAddFlight}>
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          )}
          */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FIDSFiltersComponent filters={filters} onChange={setFilters} />

      {/* Flights list */}
      <div className="space-y-3">
        {isLoading && flights.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-zinc-800" />
          ))
        ) : flights.length === 0 ? (
          // Empty state - invita a colaborar
          <div className="text-center py-8">
            <div className="relative inline-block mb-6">
              <Plane className="h-16 w-16 mx-auto text-zinc-700" />
              <div className="absolute -bottom-1 -right-1 bg-[#f59e0b] rounded-full p-1.5">
                <Plus className="h-4 w-4 text-black" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
              {filters.airport
                ? `No hay vuelos para ${filters.airport}`
                : '¡Sé el primero en colaborar!'}
            </h3>

            <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
              {filters.airport
                ? 'Ayuda a otros tripulantes agregando los vuelos de este aeropuerto'
                : 'Este tablero es colaborativo. Agrega tu vuelo o aeropuerto para ayudar a otros tripulantes.'}
            </p>

            {/* Acciones que pueden hacer */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 max-w-sm mx-auto mb-6">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Puedes colaborar con:</p>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="h-4 w-4 text-[#22c55e]" />
                  <span>Agregar aeropuerto</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Plane className="h-4 w-4 text-[#0088FF]" />
                  <span>Agregar vuelo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4 text-[#f59e0b]" />
                  <span>Reportar delay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Edit3 className="h-4 w-4 text-[#8b5cf6]" />
                  <span>Editar status</span>
                </div>
              </div>
            </div>

            {/* TODO: Implementar funcionalidad de agregar vuelos
            <Button
              className="bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-medium"
              onClick={handleAddFlight}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer vuelo
            </Button>
            */}
            <p className="text-sm text-[#f59e0b]">
              Próximamente: agregar vuelos colaborativos
            </p>

            <p className="text-xs text-zinc-600 mt-4">
              <Users className="h-3 w-3 inline mr-1" />
              Juntos hacemos la diferencia
            </p>
          </div>
        ) : (
          // Flight cards
          flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onDeleted={refetch} />
          ))
        )}
      </div>

      {/* Flight count */}
      {flights.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {flights.length} vuelo{flights.length !== 1 ? 's' : ''} en pantalla
        </p>
      )}
    </div>
  )
}
