'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// Types
interface Flight {
  flightNumber: string
  origin?: string
  destination?: string
  aircraft: string
  scheduledTime: string
  estimatedTime: string
  stand?: string
  gate?: string
  registration: string
  status: string
}

interface ESIAData {
  timestamp: string
  airport: string
  arrivals: Flight[]
  departures: Flight[]
  cached?: boolean
  nextRefresh?: string
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  SCH: { label: 'Programado', color: 'text-zinc-400', bgColor: 'bg-zinc-800' },
  IBK: { label: 'A Tiempo', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10' },
  OBK: { label: 'Abordando', color: 'text-[#0088FF]', bgColor: 'bg-[#0088FF]/10' },
  DEP: { label: 'Despegó', color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10' },
  ARR: { label: 'Aterrizó', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10' },
  CNL: { label: 'Cancelado', color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10' },
  DLY: { label: 'Demorado', color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10' },
}

function calculateDelay(scheduled: string, estimated: string): number {
  if (!scheduled || !estimated) return 0
  const [schH, schM] = scheduled.split(':').map(Number)
  const [estH, estM] = estimated.split(':').map(Number)
  const diff = (estH * 60 + estM) - (schH * 60 + schM)
  return diff > 0 ? diff : 0
}

function FlightRow({ flight, type }: { flight: Flight; type: 'arrival' | 'departure' }) {
  const status = STATUS_CONFIG[flight.status] || STATUS_CONFIG.SCH
  const delay = calculateDelay(flight.scheduledTime, flight.estimatedTime)
  const location = type === 'arrival' ? flight.origin : flight.destination
  const gateOrStand = type === 'arrival' ? flight.stand : flight.gate

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[#141414] rounded-lg mb-2 hover:bg-[#1a1a1a] transition-colors">
      {/* Flight info */}
      <div className="flex items-center gap-3 flex-1">
        <div className={cn(
          "p-1.5 rounded-md",
          type === 'arrival' ? "bg-[#22c55e]/10" : "bg-[#0066CC]/10"
        )}>
          {type === 'arrival' ? (
            <PlaneLanding className="w-3.5 h-3.5 text-[#22c55e]" />
          ) : (
            <PlaneTakeoff className="w-3.5 h-3.5 text-[#0088FF]" />
          )}
        </div>
        <div>
          <span className="font-mono font-bold text-[#fafafa] text-sm">{flight.flightNumber}</span>
          <p className="text-[10px] text-zinc-500">
            {type === 'arrival' ? `${location} →` : `→ ${location}`}
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="text-center px-3">
        <p className="font-mono text-sm text-zinc-400">{flight.scheduledTime}</p>
        {delay > 0 && (
          <p className="font-mono text-[10px] text-[#f59e0b]">+{delay}m</p>
        )}
      </div>

      {/* Gate/Stand */}
      <div className="w-12 text-center">
        <span className={cn(
          "font-bold text-sm",
          gateOrStand && gateOrStand !== '--' ? "text-[#f59e0b]" : "text-zinc-600"
        )}>
          {gateOrStand || '--'}
        </span>
      </div>

      {/* Status */}
      <div className={cn("px-2 py-0.5 rounded-full", status.bgColor)}>
        <span className={cn("text-[9px] font-medium", status.color)}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

interface LiveFlightBoardProps {
  mode?: 'departures' | 'arrivals' | 'both'
  maxFlights?: number
  compact?: boolean
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

export function LiveFlightBoard({
  mode = 'both',
  maxFlights = 5,
  compact = false,
  className,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: LiveFlightBoardProps) {
  const [data, setData] = useState<ESIAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true)

    try {
      const res = await fetch('/api/esia/scrape')
      if (!res.ok) throw new Error('Error fetching flights')

      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
      setError(null)
    } catch (e) {
      setError('No se pudieron cargar los vuelos')
      console.error('Error fetching ESIA data:', e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData(false)

    if (autoRefresh) {
      const interval = setInterval(() => fetchData(true), refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh, refreshInterval])

  if (loading) {
    return (
      <div className={cn("bg-[#0a0a0a] rounded-xl p-4", className)}>
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn("bg-[#0a0a0a] rounded-xl p-4", className)}>
        <div className="flex items-center justify-center h-32 text-zinc-500">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-sm">{error || 'Sin datos'}</span>
        </div>
      </div>
    )
  }

  const departures = data.departures.slice(0, maxFlights)
  const arrivals = data.arrivals.slice(0, maxFlights)

  return (
    <div className={cn("bg-[#0a0a0a] rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#0088FF]" />
          <span className="font-semibold text-[#fafafa] text-sm">FIDS {data.airport}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e] text-[8px] font-bold">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-[10px] text-zinc-500">
              {lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-zinc-400", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Departures */}
        {(mode === 'both' || mode === 'departures') && (
          <div className={mode === 'both' ? 'mb-4' : ''}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <PlaneTakeoff className="w-3.5 h-3.5 text-[#0088FF]" />
              <span className="text-xs font-medium text-zinc-400">
                Salidas ({data.departures.length})
              </span>
            </div>
            {departures.map((flight, i) => (
              <FlightRow key={`dep-${i}`} flight={flight} type="departure" />
            ))}
          </div>
        )}

        {/* Arrivals */}
        {(mode === 'both' || mode === 'arrivals') && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <PlaneLanding className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-xs font-medium text-zinc-400">
                Llegadas ({data.arrivals.length})
              </span>
            </div>
            {arrivals.map((flight, i) => (
              <FlightRow key={`arr-${i}`} flight={flight} type="arrival" />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-[#0a0a0a]">
        <p className="text-[9px] text-zinc-600 text-center">
          Fuente: ESIA GAP • Auto-actualización cada 5 min
        </p>
      </div>
    </div>
  )
}
