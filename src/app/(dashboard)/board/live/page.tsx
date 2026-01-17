'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
  Wifi,
  WifiOff
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
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; textColor: string }> = {
  SCH: { label: 'Programado', color: 'text-zinc-400', bgColor: 'bg-zinc-800', textColor: 'text-zinc-300' },
  IBK: { label: 'A Tiempo', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', textColor: 'text-[#22c55e]' },
  OBK: { label: 'Abordando', color: 'text-[#0088FF]', bgColor: 'bg-[#0088FF]/10', textColor: 'text-[#0088FF]' },
  DEP: { label: 'Despegó', color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10', textColor: 'text-[#8b5cf6]' },
  ARR: { label: 'Aterrizó', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', textColor: 'text-[#22c55e]' },
  CNL: { label: 'Cancelado', color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10', textColor: 'text-[#ef4444]' },
  DLY: { label: 'Demorado', color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10', textColor: 'text-[#f59e0b]' },
}

function calculateDelay(scheduled: string, estimated: string): number {
  if (!scheduled || !estimated) return 0
  const [schH, schM] = scheduled.split(':').map(Number)
  const [estH, estM] = estimated.split(':').map(Number)
  const diff = (estH * 60 + estM) - (schH * 60 + schM)
  return diff > 0 ? diff : 0
}

function FlightTableRow({ flight, type }: { flight: Flight; type: 'arrival' | 'departure' }) {
  const status = STATUS_CONFIG[flight.status] || STATUS_CONFIG.SCH
  const delay = calculateDelay(flight.scheduledTime, flight.estimatedTime)
  const location = type === 'arrival' ? flight.origin : flight.destination
  const gateOrStand = type === 'arrival' ? flight.stand : flight.gate

  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
      {/* Time */}
      <td className="py-3 px-2">
        <div className="font-mono text-sm text-zinc-300">{flight.scheduledTime}</div>
        {delay > 0 && (
          <div className="font-mono text-[10px] text-[#f59e0b]">→ {flight.estimatedTime}</div>
        )}
      </td>

      {/* Flight */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded",
            type === 'arrival' ? "bg-[#22c55e]/10" : "bg-[#0088FF]/10"
          )}>
            {type === 'arrival' ? (
              <PlaneLanding className="w-3 h-3 text-[#22c55e]" />
            ) : (
              <PlaneTakeoff className="w-3 h-3 text-[#0088FF]" />
            )}
          </div>
          <span className="font-mono font-bold text-[#fafafa] text-sm">{flight.flightNumber}</span>
        </div>
      </td>

      {/* Destination/Origin */}
      <td className="py-3 px-2">
        <span className="font-bold text-[#fafafa]">{location}</span>
      </td>

      {/* Gate/Stand */}
      <td className="py-3 px-2 text-center">
        <span className={cn(
          "font-mono font-bold text-lg",
          gateOrStand && gateOrStand !== '--' ? "text-[#f59e0b]" : "text-zinc-600"
        )}>
          {gateOrStand || '--'}
        </span>
      </td>

      {/* Aircraft */}
      <td className="py-3 px-2 text-center">
        <span className="text-xs text-zinc-500">{flight.aircraft}</span>
      </td>

      {/* Status */}
      <td className="py-3 px-2">
        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", status.bgColor, status.textColor)}>
          {status.label}
          {delay > 0 && <span className="text-[#f59e0b]">+{delay}m</span>}
        </div>
      </td>
    </tr>
  )
}

export default function LiveBoardPage() {
  const [data, setData] = useState<ESIAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures')
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const [isOnline, setIsOnline] = useState(true)

  const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

  const fetchData = useCallback(async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true)

    try {
      const res = await fetch('/api/esia/scrape')
      if (!res.ok) throw new Error('Error fetching flights')

      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
      setError(null)
      setIsOnline(true)
      setCountdown(300) // Reset countdown
    } catch (e) {
      setError('No se pudieron cargar los vuelos')
      setIsOnline(false)
      console.error('Error fetching ESIA data:', e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData(false)

    const interval = setInterval(() => {
      fetchData(true)
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 300))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#0088FF] animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Cargando datos de ESIA...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-[#f59e0b] mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">{error || 'Sin datos'}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2 bg-[#0088FF] text-white rounded-lg hover:bg-[#0066CC] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const flights = activeTab === 'departures' ? data.departures : data.arrivals

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-zinc-800 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0088FF]/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-[#0088FF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#fafafa]">FIDS {data.airport}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[9px] font-bold flex items-center gap-1">
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500">Próx. actualización</p>
                  <p className="font-mono text-sm text-[#0088FF]">{formatCountdown(countdown)}</p>
                </div>
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-5 h-5 text-zinc-400", isRefreshing && "animate-spin")} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-zinc-800">
          <button
            onClick={() => setActiveTab('departures')}
            className={cn(
              "flex-1 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2",
              activeTab === 'departures'
                ? 'text-[#0088FF] border-b-2 border-[#0088FF] bg-[#0088FF]/5'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <PlaneTakeoff className="w-4 h-4" />
            Salidas ({data.departures.length})
          </button>
          <button
            onClick={() => setActiveTab('arrivals')}
            className={cn(
              "flex-1 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2",
              activeTab === 'arrivals'
                ? 'text-[#22c55e] border-b-2 border-[#22c55e] bg-[#22c55e]/5'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <PlaneLanding className="w-4 h-4" />
            Llegadas ({data.arrivals.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#141414] border-b border-zinc-800 sticky top-[120px]">
            <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="py-2 px-2 text-left">Hora</th>
              <th className="py-2 px-2 text-left">Vuelo</th>
              <th className="py-2 px-2 text-left">{activeTab === 'departures' ? 'Destino' : 'Origen'}</th>
              <th className="py-2 px-2 text-center">{activeTab === 'departures' ? 'Gate' : 'Stand'}</th>
              <th className="py-2 px-2 text-center">Equipo</th>
              <th className="py-2 px-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight, index) => (
              <FlightTableRow
                key={`${flight.flightNumber}-${index}`}
                flight={flight}
                type={activeTab === 'departures' ? 'departure' : 'arrival'}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#0a0a0a] border-t border-zinc-800 px-4 py-2">
        <div className="flex items-center justify-between text-[10px] text-zinc-600">
          <div className="flex items-center gap-2">
            <span>Fuente: ESIA GAP</span>
            <span>•</span>
            <span>Auto-refresh: 5 min</span>
          </div>
          {lastUpdate && (
            <span>
              Última act: {format(lastUpdate, 'HH:mm:ss')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
