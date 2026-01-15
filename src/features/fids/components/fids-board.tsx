'use client'

import { RefreshCw, Plus, Plane } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFlights } from '../hooks'
import { FlightCard } from './flight-card'
import { FIDSFiltersComponent } from './fids-filters'
import { useAuth } from '@/features/auth/hooks'

export function FIDSBoard() {
  const { user } = useAuth()
  const {
    flights,
    filters,
    isLoading,
    lastUpdated,
    refetch,
    setFilters,
  } = useFlights()

  const canAddFlights =
    user?.subscription_tier === 'PREMIUM' || user?.role === 'SUPERADMIN'

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
          {canAddFlights && (
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          )}
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
          // Empty state
          <div className="text-center py-12">
            <Plane className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">
              No hay vuelos
            </h3>
            <p className="text-sm text-zinc-600 mt-1">
              {filters.airport
                ? `No hay vuelos para ${filters.airport}`
                : 'No hay vuelos programados en este momento'}
            </p>
          </div>
        ) : (
          // Flight cards
          flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
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
