'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plane, Clock, MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useAuthStore } from '@/shared/stores/auth-store'
import { deleteFlight } from '../services'
import type { Flight } from '../types'

interface FlightCardProps {
  flight: Flight
  onClick?: () => void
  onDeleted?: () => void
}

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  ON_TIME: {
    badge: 'bg-zinc-700 text-zinc-100',
    label: 'On Time',
  },
  DELAY: {
    badge: 'bg-[#FF9500]/20 text-[#FF9500]',
    label: 'Delay',
  },
  GATE_CHANGE: {
    badge: 'bg-[#007AFF]/20 text-[#007AFF]',
    label: 'Gate Change',
  },
  CANCELED: {
    badge: 'bg-[#FF3B30]/20 text-[#FF3B30]',
    label: 'Cancelado',
  },
  BOARDING: {
    badge: 'bg-[#22c55e]/20 text-[#22c55e]',
    label: 'Abordando',
  },
  DEPARTED: {
    badge: 'bg-zinc-600/20 text-zinc-400',
    label: 'Despegó',
  },
  ARRIVED: {
    badge: 'bg-zinc-600/20 text-zinc-400',
    label: 'Llegó',
  },
}

const AIRLINE_COLORS: Record<string, string> = {
  Y4: '#E91E8C', // Volaris
  VB: '#39FF14', // Viva
  AM: '#E31837', // Aeromexico
}

export function FlightCard({ flight, onClick, onDeleted }: FlightCardProps) {
  const { user } = useAuthStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const statusStyle = STATUS_STYLES[flight.status]
  const airlineCode = flight.airline.substring(0, 2).toUpperCase()
  const airlineColor = AIRLINE_COLORS[airlineCode] || '#00ff88'

  const stdTime = format(new Date(flight.std), 'HH:mm')
  const staTime = format(new Date(flight.sta), 'HH:mm')

  const isSuperAdmin = user?.role === 'SUPERADMIN'

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar vuelo ${flight.flight_number}? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    const result = await deleteFlight(flight.id)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Vuelo eliminado')
      onDeleted?.()
    }
  }

  return (
    <Card
      className={cn(
        'border-zinc-800 bg-zinc-900/50 cursor-pointer transition-all hover:border-zinc-700',
        flight.status === 'CANCELED' && 'opacity-60'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: airlineColor }}
            />
            <div>
              <p className="font-bold text-lg">{flight.flight_number}</p>
              <p className="text-xs text-zinc-500">{flight.airline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusStyle.badge}>
              {statusStyle.label}
              {flight.status === 'DELAY' && flight.delay_minutes > 0 && (
                <span className="ml-1">+{flight.delay_minutes}m</span>
              )}
            </Badge>
            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500 hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className={cn("h-4 w-4", isDeleting && "animate-pulse")} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{flight.origin}</p>
            <p className="text-xs text-zinc-500">{stdTime}</p>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <div className="flex-1 h-px bg-zinc-700 mx-2 relative">
                <Plane
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                  style={{ transform: 'translateX(-50%) translateY(-50%) rotate(90deg)' }}
                />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">{flight.destination}</p>
            <p className="text-xs text-zinc-500">{staTime}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Gate: {flight.gate || '-'}</span>
          </div>

          {flight.aircraft_type && (
            <div className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              <span>{flight.aircraft_type}</span>
            </div>
          )}

          {flight.delay_reason && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{flight.delay_reason}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
