'use client'

import { Plane, Clock } from 'lucide-react'
import { formatDurationHHMM } from '@/shared/lib/time'
import type { FlightEntry } from '@/shared/lib/offline'

interface FlightSummaryProps {
  flights: FlightEntry[]
}

export function FlightSummary({ flights }: FlightSummaryProps) {
  const completedFlights = flights.length

  // Calculate totals
  const totalFlightMinutes = flights.reduce((sum, f) => sum + f.flightMinutes, 0)
  const totalBlockMinutes = flights.reduce((sum, f) => sum + f.blockMinutes, 0)

  if (completedFlights === 0) {
    return (
      <div className="bg-[#141414] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-[#71717a]">
          <Plane className="w-4 h-4" />
          <span className="text-sm">Sin vuelos registrados hoy</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#fafafa]">
          Vuelos Hoy: {completedFlights}
        </h4>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#71717a]">
            FLT: <span className="text-[#00ff41] font-mono">{formatDurationHHMM(totalFlightMinutes)}</span>
          </span>
          <span className="text-[#71717a]">
            BLK: <span className="text-[#00ff41] font-mono">{formatDurationHHMM(totalBlockMinutes)}</span>
          </span>
        </div>
      </div>

      {/* Flight list */}
      <div className="space-y-2">
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            className="flex items-center justify-between py-2 px-3 bg-background rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#71717a]">#{index + 1}</span>
              <span className="font-mono text-sm text-[#fafafa]">
                {flight.dep} → {flight.dest}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#71717a]">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDurationHHMM(flight.flightMinutes)}
              </span>
              <span className="text-[#52525b] font-mono">
                {flight.tail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
