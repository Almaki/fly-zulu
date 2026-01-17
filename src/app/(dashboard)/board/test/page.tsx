'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Timer,
  MapPin
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

// Datos de prueba - simulando lo que vendría de ESIA
const MOCK_DEPARTURES = [
  {
    id: '1',
    flightNumber: 'VOI2150',
    airline: 'Volaris',
    destination: 'MEX',
    destinationName: 'Ciudad de México',
    scheduledTime: '06:30',
    estimatedTime: '06:35',
    actualTime: null,
    status: 'ON_TIME',
    gate: 'A3',
    aircraft: 'A320',
  },
  {
    id: '2',
    flightNumber: 'AM0178',
    airline: 'Aeromexico',
    destination: 'GDL',
    destinationName: 'Guadalajara',
    scheduledTime: '07:15',
    estimatedTime: '07:45',
    actualTime: null,
    status: 'DELAYED',
    gate: 'B1',
    aircraft: 'E190',
    delayMinutes: 30,
  },
  {
    id: '3',
    flightNumber: 'Y4-852',
    airline: 'Volaris',
    destination: 'CUN',
    destinationName: 'Cancún',
    scheduledTime: '08:00',
    estimatedTime: '08:00',
    actualTime: '07:58',
    status: 'DEPARTED',
    gate: 'A5',
    aircraft: 'A321',
  },
  {
    id: '4',
    flightNumber: 'VB3021',
    airline: 'VivaAerobus',
    destination: 'MTY',
    destinationName: 'Monterrey',
    scheduledTime: '09:30',
    estimatedTime: null,
    actualTime: null,
    status: 'SCHEDULED',
    gate: '--',
    aircraft: 'A320',
  },
  {
    id: '5',
    flightNumber: 'AM0456',
    airline: 'Aeromexico',
    destination: 'LAX',
    destinationName: 'Los Angeles',
    scheduledTime: '10:15',
    estimatedTime: null,
    actualTime: null,
    status: 'BOARDING',
    gate: 'C2',
    aircraft: 'B737',
  },
]

const MOCK_ARRIVALS = [
  {
    id: '6',
    flightNumber: 'VOI2151',
    airline: 'Volaris',
    origin: 'MEX',
    originName: 'Ciudad de México',
    scheduledTime: '08:45',
    estimatedTime: '08:40',
    actualTime: '08:38',
    status: 'LANDED',
    gate: 'A3',
    aircraft: 'A320',
  },
  {
    id: '7',
    flightNumber: 'AM0179',
    airline: 'Aeromexico',
    origin: 'GDL',
    originName: 'Guadalajara',
    scheduledTime: '09:30',
    estimatedTime: '09:25',
    actualTime: null,
    status: 'APPROACH',
    gate: 'B1',
    aircraft: 'E190',
  },
  {
    id: '8',
    flightNumber: 'UA1234',
    airline: 'United',
    origin: 'IAH',
    originName: 'Houston',
    scheduledTime: '11:00',
    estimatedTime: '11:15',
    actualTime: null,
    status: 'DELAYED',
    gate: '--',
    aircraft: 'B737',
    delayMinutes: 15,
  },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  SCHEDULED: { label: 'Programado', color: 'text-zinc-400', bgColor: 'bg-zinc-800', icon: Clock },
  ON_TIME: { label: 'A Tiempo', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', icon: CheckCircle },
  DELAYED: { label: 'Demorado', color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10', icon: AlertTriangle },
  BOARDING: { label: 'Abordando', color: 'text-[#0088FF]', bgColor: 'bg-[#0088FF]/10', icon: Timer },
  DEPARTED: { label: 'Despegó', color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10', icon: PlaneTakeoff },
  LANDED: { label: 'Aterrizó', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', icon: PlaneLanding },
  APPROACH: { label: 'Aproximación', color: 'text-[#06b6d4]', bgColor: 'bg-[#06b6d4]/10', icon: Plane },
  CANCELLED: { label: 'Cancelado', color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10', icon: AlertTriangle },
}

function FlightRow({ flight, type }: { flight: any; type: 'departure' | 'arrival' }) {
  const status = STATUS_CONFIG[flight.status] || STATUS_CONFIG.SCHEDULED
  const StatusIcon = status.icon
  const location = type === 'departure' ? flight.destination : flight.origin
  const locationName = type === 'departure' ? flight.destinationName : flight.originName

  return (
    <div className="bg-[#141414] border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        {/* Flight number and airline */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#0066CC]/10">
            {type === 'departure' ? (
              <PlaneTakeoff className="w-4 h-4 text-[#0088FF]" />
            ) : (
              <PlaneLanding className="w-4 h-4 text-[#22c55e]" />
            )}
          </div>
          <div>
            <span className="font-bold text-[#fafafa] text-lg font-mono">{flight.flightNumber}</span>
            <p className="text-[10px] text-zinc-500">{flight.airline}</p>
          </div>
        </div>

        {/* Gate */}
        <div className="text-right">
          <span className="text-xs text-zinc-500">GATE</span>
          <p className={`font-bold text-lg ${flight.gate === '--' ? 'text-zinc-600' : 'text-[#f59e0b]'}`}>
            {flight.gate}
          </p>
        </div>
      </div>

      {/* Destination/Origin */}
      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-zinc-500" />
        <span className="text-sm text-[#fafafa]">{location}</span>
        <span className="text-xs text-zinc-500">• {locationName}</span>
      </div>

      {/* Times row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Scheduled */}
          <div>
            <span className="text-[9px] text-zinc-500 uppercase">STD</span>
            <p className="font-mono text-sm text-zinc-400">{flight.scheduledTime}</p>
          </div>

          {/* Estimated */}
          {flight.estimatedTime && (
            <div>
              <span className="text-[9px] text-zinc-500 uppercase">ETD</span>
              <p className={`font-mono text-sm ${flight.delayMinutes ? 'text-[#f59e0b]' : 'text-[#fafafa]'}`}>
                {flight.estimatedTime}
              </p>
            </div>
          )}

          {/* Actual */}
          {flight.actualTime && (
            <div>
              <span className="text-[9px] text-zinc-500 uppercase">ATD</span>
              <p className="font-mono text-sm text-[#22c55e]">{flight.actualTime}</p>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bgColor}`}>
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
          <span className={`text-[10px] font-medium ${status.color}`}>
            {status.label}
            {flight.delayMinutes && ` +${flight.delayMinutes}m`}
          </span>
        </div>
      </div>

      {/* Aircraft type */}
      <div className="mt-2 pt-2 border-t border-zinc-800/50">
        <span className="text-[9px] text-zinc-600">
          <Plane className="w-2.5 h-2.5 inline mr-1" />
          {flight.aircraft}
        </span>
      </div>
    </div>
  )
}

export default function BoardTestPage() {
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures')
  const [lastUpdate] = useState(new Date())

  const flights = activeTab === 'departures' ? MOCK_DEPARTURES : MOCK_ARRIVALS

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#fafafa]">FIDS Test</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-[9px] font-bold">
                DEMO
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              TIJ • {format(new Date(), "EEEE d MMM", { locale: es })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500">Actualizado</p>
              <p className="text-xs text-zinc-400 font-mono">{format(lastUpdate, 'HH:mm:ss')}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
          <TabsList className="w-full grid grid-cols-2 bg-[#141414]">
            <TabsTrigger
              value="departures"
              className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
            >
              <PlaneTakeoff className="w-4 h-4 mr-2" />
              Salidas ({MOCK_DEPARTURES.length})
            </TabsTrigger>
            <TabsTrigger
              value="arrivals"
              className="data-[state=active]:bg-[#22c55e] data-[state=active]:text-white"
            >
              <PlaneLanding className="w-4 h-4 mr-2" />
              Llegadas ({MOCK_ARRIVALS.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Info banner */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#0066CC]/10 to-[#0088FF]/5 border border-[#0066CC]/20">
          <p className="text-xs text-[#0088FF]">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Este es un tablero de prueba con datos simulados. Los datos reales vendrán del scraper de ESIA.
          </p>
        </div>

        {/* Flights list */}
        <div className="space-y-3">
          {flights.map((flight) => (
            <FlightRow
              key={flight.id}
              flight={flight}
              type={activeTab === 'departures' ? 'departure' : 'arrival'}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-zinc-600">
            Fuente: ESIA GAP • Datos actualizados cada 5 minutos
          </p>
        </div>
      </div>
    </div>
  )
}
