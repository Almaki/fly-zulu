'use client'

import { useState, useEffect } from 'react'
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
  MapPin,
  Database
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  ON_TIME: { label: 'A Tiempo', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', icon: CheckCircle },
  DELAYED: { label: 'Demorado', color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10', icon: AlertTriangle },
  BOARDING: { label: 'Abordando', color: 'text-[#0088FF]', bgColor: 'bg-[#0088FF]/10', icon: Timer },
  DEPARTED: { label: 'Despegó', color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/10', icon: PlaneTakeoff },
  LANDED: { label: 'Aterrizó', color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', icon: PlaneLanding },
  CANCELED: { label: 'Cancelado', color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10', icon: AlertTriangle },
}

// ESIA status to our status
const ESIA_STATUS_MAP: Record<string, string> = {
  SCH: 'ON_TIME',
  IBK: 'ON_TIME',
  OBK: 'BOARDING',
  DEP: 'DEPARTED',
  ARR: 'LANDED',
  CNL: 'CANCELED',
  DLY: 'DELAYED',
}

interface ESIAArrival {
  flightNumber: string
  origin: string
  aircraft: string
  hall: string
  belt: string
  scheduledDate: string
  scheduledTime: string
  estimatedTime: string
  stand: string
  registration: string
  status: string
}

interface ESIADeparture {
  flightNumber: string
  destination: string
  aircraft: string
  gate: string
  scheduledDate: string
  scheduledTime: string
  estimatedTime: string
  counterFrom: string
  counterTo: string
  registration: string
  stand: string
  status: string
  terminal: string
}

interface ESIAData {
  timestamp: string
  airport: string
  totalArrivals: number
  totalDepartures: number
  arrivals: ESIAArrival[]
  departures: ESIADeparture[]
}

function calculateDelayMinutes(scheduled: string, estimated: string): number {
  if (!scheduled || !estimated) return 0
  const [schHour, schMin] = scheduled.split(':').map(Number)
  const [estHour, estMin] = estimated.split(':').map(Number)
  const schMinutes = schHour * 60 + schMin
  const estMinutes = estHour * 60 + estMin
  const diff = estMinutes - schMinutes
  return diff > 0 ? diff : 0
}

function ArrivalRow({ flight }: { flight: ESIAArrival }) {
  const mappedStatus = ESIA_STATUS_MAP[flight.status] || 'ON_TIME'
  const status = STATUS_CONFIG[mappedStatus] || STATUS_CONFIG.ON_TIME
  const StatusIcon = status.icon
  const delayMinutes = calculateDelayMinutes(flight.scheduledTime, flight.estimatedTime)

  return (
    <div className="bg-[#141414] border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#22c55e]/10">
            <PlaneLanding className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div>
            <span className="font-bold text-[#fafafa] text-lg font-mono">{flight.flightNumber}</span>
            <p className="text-[10px] text-zinc-500">Volaris</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500">STAND</span>
          <p className={`font-bold text-lg ${flight.stand === '--' ? 'text-zinc-600' : 'text-[#f59e0b]'}`}>
            {flight.stand || '--'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-zinc-500" />
        <span className="text-sm text-[#fafafa]">{flight.origin}</span>
        <span className="text-xs text-zinc-500">→ TIJ</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] text-zinc-500 uppercase">SIBT</span>
            <p className="font-mono text-sm text-zinc-400">{flight.scheduledTime}</p>
          </div>
          {flight.estimatedTime && (
            <div>
              <span className="text-[9px] text-zinc-500 uppercase">ETA</span>
              <p className={`font-mono text-sm ${delayMinutes > 0 ? 'text-[#f59e0b]' : 'text-[#fafafa]'}`}>
                {flight.estimatedTime}
              </p>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bgColor}`}>
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
          <span className={`text-[10px] font-medium ${status.color}`}>
            {status.label}
            {delayMinutes > 0 && ` +${delayMinutes}m`}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800/50 flex justify-between">
        <span className="text-[9px] text-zinc-600">
          <Plane className="w-2.5 h-2.5 inline mr-1" />
          {flight.aircraft}
        </span>
        <span className="text-[9px] text-zinc-600">{flight.registration}</span>
      </div>
    </div>
  )
}

function DepartureRow({ flight }: { flight: ESIADeparture }) {
  const mappedStatus = ESIA_STATUS_MAP[flight.status] || 'ON_TIME'
  const status = STATUS_CONFIG[mappedStatus] || STATUS_CONFIG.ON_TIME
  const StatusIcon = status.icon
  const delayMinutes = calculateDelayMinutes(flight.scheduledTime, flight.estimatedTime)

  return (
    <div className="bg-[#141414] border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#0066CC]/10">
            <PlaneTakeoff className="w-4 h-4 text-[#0088FF]" />
          </div>
          <div>
            <span className="font-bold text-[#fafafa] text-lg font-mono">{flight.flightNumber}</span>
            <p className="text-[10px] text-zinc-500">Volaris</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-500">GATE</span>
          <p className={`font-bold text-lg ${flight.gate === '--' ? 'text-zinc-600' : 'text-[#f59e0b]'}`}>
            {flight.gate || '--'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-zinc-500" />
        <span className="text-xs text-zinc-500">TIJ →</span>
        <span className="text-sm text-[#fafafa]">{flight.destination}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] text-zinc-500 uppercase">SOBT</span>
            <p className="font-mono text-sm text-zinc-400">{flight.scheduledTime}</p>
          </div>
          {flight.estimatedTime && (
            <div>
              <span className="text-[9px] text-zinc-500 uppercase">ETD</span>
              <p className={`font-mono text-sm ${delayMinutes > 0 ? 'text-[#f59e0b]' : 'text-[#fafafa]'}`}>
                {flight.estimatedTime}
              </p>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bgColor}`}>
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
          <span className={`text-[10px] font-medium ${status.color}`}>
            {status.label}
            {delayMinutes > 0 && ` +${delayMinutes}m`}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800/50 flex justify-between">
        <span className="text-[9px] text-zinc-600">
          <Plane className="w-2.5 h-2.5 inline mr-1" />
          {flight.aircraft}
        </span>
        <span className="text-[9px] text-zinc-600">{flight.registration}</span>
      </div>
    </div>
  )
}

// Data from ESIA scraper
const ESIA_DATA: ESIAData = {
  "timestamp": "2026-01-17T03:15:21.362Z",
  "airport": "TIJ",
  "totalArrivals": 20,
  "totalDepartures": 15,
  "arrivals": [
    {"flightNumber":"VOI 3121","origin":"PVR","aircraft":"A321","hall":"SR","belt":"2","scheduledDate":"16/01/2026","scheduledTime":"14:51","estimatedTime":"15:18","stand":"07","registration":"XA-VRC","status":"IBK"},
    {"flightNumber":"VOI 3191","origin":"MZT","aircraft":"A20N","hall":"SR","belt":"3","scheduledDate":"16/01/2026","scheduledTime":"15:19","estimatedTime":"15:49","stand":"04","registration":"XAVSG","status":"IBK"},
    {"flightNumber":"VOI 3221","origin":"PBC","aircraft":"A20N","hall":"SR","belt":"4","scheduledDate":"16/01/2026","scheduledTime":"15:44","estimatedTime":"15:37","stand":"11","registration":"XAVRT","status":"IBK"},
    {"flightNumber":"VOI 3043","origin":"BJX","aircraft":"A20N","hall":"SR","belt":"2","scheduledDate":"16/01/2026","scheduledTime":"15:45","estimatedTime":"15:45","stand":"05","registration":"XA-VSI","status":"IBK"},
    {"flightNumber":"VOI 3257","origin":"LMM","aircraft":"A20N","hall":"SR","belt":"1","scheduledDate":"16/01/2026","scheduledTime":"15:57","estimatedTime":"15:44","stand":"08","registration":"XAVSA","status":"IBK"},
    {"flightNumber":"VOI 3061","origin":"MLM","aircraft":"A20N","hall":"SR","belt":"4","scheduledDate":"16/01/2026","scheduledTime":"16:09","estimatedTime":"16:06","stand":"06","registration":"N532VL","status":"IBK"},
    {"flightNumber":"VOI 3005","origin":"CUL","aircraft":"A21N","hall":"SR","belt":"2","scheduledDate":"16/01/2026","scheduledTime":"16:36","estimatedTime":"16:41","stand":"01","registration":"XAVUO","status":"IBK"},
    {"flightNumber":"VOI 3235","origin":"LAP","aircraft":"A20N","hall":"SR","belt":"1","scheduledDate":"16/01/2026","scheduledTime":"16:48","estimatedTime":"16:26","stand":"18","registration":"XA-VSJ","status":"IBK"},
    {"flightNumber":"VOI 3103","origin":"SJD","aircraft":"A21N","hall":"SR","belt":"1","scheduledDate":"16/01/2026","scheduledTime":"17:10","estimatedTime":"17:21","stand":"05","registration":"XA-VSB","status":"IBK"},
    {"flightNumber":"VOI 3081","origin":"CUN","aircraft":"A21N","hall":"SR","belt":"4","scheduledDate":"16/01/2026","scheduledTime":"17:12","estimatedTime":"17:18","stand":"08","registration":"N537VL","status":"IBK"},
    {"flightNumber":"VOI 3123","origin":"PVR","aircraft":"A21N","hall":"SR","belt":"3","scheduledDate":"16/01/2026","scheduledTime":"17:26","estimatedTime":"17:52","stand":"14","registration":"XAVSK","status":"IBK"},
    {"flightNumber":"VOI 3323","origin":"TLC","aircraft":"A320","hall":"SR","belt":"3","scheduledDate":"16/01/2026","scheduledTime":"18:05","estimatedTime":"18:07","stand":"09","registration":"N522VL","status":"IBK"},
    {"flightNumber":"VOI 1006","origin":"GDL","aircraft":"A321","hall":"SR","belt":"2","scheduledDate":"16/01/2026","scheduledTime":"18:17","estimatedTime":"18:06","stand":"22","registration":"XA-VRB","status":"IBK"},
    {"flightNumber":"VOI 3009","origin":"CUL","aircraft":"A321","hall":"SR","belt":"4","scheduledDate":"16/01/2026","scheduledTime":"19:26","estimatedTime":"19:04","stand":"14","registration":"XA-VLH","status":"IBK"},
    {"flightNumber":"VOI 3185","origin":"HMO","aircraft":"A20N","hall":"SR","belt":"5","scheduledDate":"16/01/2026","scheduledTime":"20:05","estimatedTime":"20:05","stand":"23","registration":"XA-VSI","status":"SCH"},
    {"flightNumber":"VOI 1008","origin":"GDL","aircraft":"A20N","hall":"SR","belt":"3","scheduledDate":"16/01/2026","scheduledTime":"20:07","estimatedTime":"20:07","stand":"13","registration":"XA-VRX","status":"SCH"},
    {"flightNumber":"VOI 3275","origin":"UPN","aircraft":"A20N","hall":"SR","belt":"4","scheduledDate":"16/01/2026","scheduledTime":"20:09","estimatedTime":"20:09","stand":"08","registration":"XA-VRP","status":"SCH"},
    {"flightNumber":"VOI 3085","origin":"CUN","aircraft":"A320","hall":"SR","belt":"3","scheduledDate":"16/01/2026","scheduledTime":"20:11","estimatedTime":"20:11","stand":"11","registration":"XA-VOZ","status":"SCH"},
    {"flightNumber":"VOI 3223","origin":"PBC","aircraft":"A320","hall":"SR","belt":"2","scheduledDate":"16/01/2026","scheduledTime":"20:16","estimatedTime":"20:16","stand":"10","registration":"XA-TVE","status":"SCH"},
    {"flightNumber":"VOI 184","origin":"MEX","aircraft":"A320","hall":"SR","belt":"1","scheduledDate":"16/01/2026","scheduledTime":"20:45","estimatedTime":"20:45","stand":"19","registration":"N527VL","status":"SCH"}
  ],
  "departures": [
    {"flightNumber":"VOI 3376","destination":"SLP","aircraft":"A321","gate":"18","scheduledDate":"16/01/2026","scheduledTime":"15:56","estimatedTime":"16:07","counterFrom":"33","counterTo":"329","registration":"XA-VRC","stand":"07","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 5611","destination":"MTY","aircraft":"A20N","gate":"5","scheduledDate":"16/01/2026","scheduledTime":"16:34","estimatedTime":"16:34","counterFrom":"33","counterTo":"329","registration":"XAVSG","stand":"04","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3060","destination":"MLM","aircraft":"A20N","gate":"12","scheduledDate":"16/01/2026","scheduledTime":"17:02","estimatedTime":"16:47","counterFrom":"33","counterTo":"329","registration":"XAVRT","stand":"11","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3184","destination":"HMO","aircraft":"A20N","gate":"3","scheduledDate":"16/01/2026","scheduledTime":"16:37","estimatedTime":"16:41","counterFrom":"33","counterTo":"329","registration":"XA-VSI","stand":"05","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3046","destination":"BJX","aircraft":"A20N","gate":"11","scheduledDate":"16/01/2026","scheduledTime":"16:34","estimatedTime":"16:37","counterFrom":"33","counterTo":"329","registration":"XAVSA","stand":"08","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3258","destination":"LMM","aircraft":"A20N","gate":"1","scheduledDate":"16/01/2026","scheduledTime":"17:36","estimatedTime":"17:25","counterFrom":"33","counterTo":"329","registration":"N532VL","stand":"06","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3296","destination":"NLU","aircraft":"A21N","gate":"9","scheduledDate":"16/01/2026","scheduledTime":"17:26","estimatedTime":"17:29","counterFrom":"33","counterTo":"329","registration":"XAVUO","stand":"01","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3282","destination":"CJS","aircraft":"A21N","gate":"3","scheduledDate":"16/01/2026","scheduledTime":"18:05","estimatedTime":"18:00","counterFrom":"33","counterTo":"329","registration":"XA-VSB","stand":"05","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3316","destination":"CEN","aircraft":"A21N","gate":"11","scheduledDate":"16/01/2026","scheduledTime":"18:00","estimatedTime":"18:07","counterFrom":"33","counterTo":"329","registration":"N537VL","stand":"08","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 1011","destination":"GDL","aircraft":"A21N","gate":"19","scheduledDate":"16/01/2026","scheduledTime":"18:11","estimatedTime":"18:46","counterFrom":"33","counterTo":"329","registration":"XAVSK","stand":"14","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 3324","destination":"TLC","aircraft":"A320","gate":"13","scheduledDate":"16/01/2026","scheduledTime":"18:55","estimatedTime":"18:57","counterFrom":"33","counterTo":"329","registration":"N522VL","stand":"09","status":"OBK","terminal":"1"},
    {"flightNumber":"VOI 1017","destination":"GDL","aircraft":"A321","gate":"19","scheduledDate":"16/01/2026","scheduledTime":"23:47","estimatedTime":"23:47","counterFrom":"33","counterTo":"329","registration":"XA-VLH","stand":"14","status":"SCH","terminal":"1"},
    {"flightNumber":"VOI 3040","destination":"BJX","aircraft":"A20N","gate":"20","scheduledDate":"17/01/2026","scheduledTime":"00:57","estimatedTime":"00:57","counterFrom":"33","counterTo":"329","registration":"XA-VRX","stand":"13","status":"SCH","terminal":"1"},
    {"flightNumber":"VOI 185","destination":"MEX","aircraft":"A320","gate":"12","scheduledDate":"16/01/2026","scheduledTime":"21:30","estimatedTime":"21:30","counterFrom":"33","counterTo":"329","registration":"XA-VOZ","stand":"11","status":"SCH","terminal":"1"},
    {"flightNumber":"VOI 3142","destination":"OAX","aircraft":"A320","gate":"14","scheduledDate":"16/01/2026","scheduledTime":"23:59","estimatedTime":"23:59","counterFrom":"33","counterTo":"329","registration":"XA-TVE","stand":"10","status":"SCH","terminal":"1"}
  ]
}

export default function BoardTestPage() {
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [data] = useState<ESIAData>(ESIA_DATA)

  useEffect(() => {
    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#fafafa]">FIDS</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[9px] font-bold flex items-center gap-1">
                <Database className="w-3 h-3" />
                ESIA
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {data.airport} • {format(new Date(), "EEEE d MMM", { locale: es })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500">Última actualización</p>
              <p className="text-xs text-zinc-400 font-mono">{format(lastUpdate, 'HH:mm:ss')}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'departures' | 'arrivals')} className="mb-4">
          <TabsList className="w-full grid grid-cols-2 bg-[#141414]">
            <TabsTrigger
              value="departures"
              className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
            >
              <PlaneTakeoff className="w-4 h-4 mr-2" />
              Salidas ({data.totalDepartures})
            </TabsTrigger>
            <TabsTrigger
              value="arrivals"
              className="data-[state=active]:bg-[#22c55e] data-[state=active]:text-white"
            >
              <PlaneLanding className="w-4 h-4 mr-2" />
              Llegadas ({data.totalArrivals})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Info banner */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#22c55e]/10 to-[#0088FF]/5 border border-[#22c55e]/20">
          <p className="text-xs text-[#22c55e]">
            <Database className="w-3 h-3 inline mr-1" />
            Datos reales extraídos de ESIA GAP • {data.totalArrivals + data.totalDepartures} vuelos
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Timestamp: {new Date(data.timestamp).toLocaleString('es-MX')}
          </p>
        </div>

        {/* Flights list */}
        <div className="space-y-3">
          {activeTab === 'departures' ? (
            data.departures.map((flight, index) => (
              <DepartureRow key={`dep-${index}`} flight={flight} />
            ))
          ) : (
            data.arrivals.map((flight, index) => (
              <ArrivalRow key={`arr-${index}`} flight={flight} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-zinc-600">
            Fuente: ESIA GAP (esia.serviciosgap.com.mx)
          </p>
        </div>
      </div>
    </div>
  )
}
