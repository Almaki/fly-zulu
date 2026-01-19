'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, MapPin, Users, Wifi } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getAdminMetrics } from '../services'
import type { RecentUser } from '../types'

// Americas coordinates bounds (from Canada to Argentina)
const AMERICAS_BOUNDS = {
  minLat: -55, // Tierra del Fuego
  maxLat: 72,  // Northern Canada
  minLng: -170, // Alaska
  maxLng: -30,  // Eastern Brazil
}

// Map dimensions
const MAP_WIDTH = 400
const MAP_HEIGHT = 500

// Convert lat/lng to SVG coordinates
function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  // Clamp to Americas bounds
  lat = Math.max(AMERICAS_BOUNDS.minLat, Math.min(AMERICAS_BOUNDS.maxLat, lat))
  lng = Math.max(AMERICAS_BOUNDS.minLng, Math.min(AMERICAS_BOUNDS.maxLng, lng))

  const x = ((lng - AMERICAS_BOUNDS.minLng) / (AMERICAS_BOUNDS.maxLng - AMERICAS_BOUNDS.minLng)) * MAP_WIDTH
  const y = ((AMERICAS_BOUNDS.maxLat - lat) / (AMERICAS_BOUNDS.maxLat - AMERICAS_BOUNDS.minLat)) * MAP_HEIGHT

  return { x, y }
}

// Major airports across Americas for reference
const MAJOR_AIRPORTS = [
  // Mexico
  { code: 'MEX', name: 'CDMX', lat: 19.4363, lng: -99.0721 },
  { code: 'CUN', name: 'Cancun', lat: 21.0365, lng: -86.8771 },
  { code: 'GDL', name: 'Guadalajara', lat: 20.5218, lng: -103.3112 },
  // USA
  { code: 'LAX', name: 'Los Angeles', lat: 33.9425, lng: -118.4081 },
  { code: 'MIA', name: 'Miami', lat: 25.7959, lng: -80.2870 },
  { code: 'JFK', name: 'New York', lat: 40.6413, lng: -73.7781 },
  { code: 'ORD', name: 'Chicago', lat: 41.9742, lng: -87.9073 },
  // Canada
  { code: 'YYZ', name: 'Toronto', lat: 43.6777, lng: -79.6248 },
  { code: 'YVR', name: 'Vancouver', lat: 49.1967, lng: -123.1815 },
  // Central & South America
  { code: 'PTY', name: 'Panama', lat: 9.0714, lng: -79.3835 },
  { code: 'BOG', name: 'Bogota', lat: 4.7016, lng: -74.1469 },
  { code: 'GRU', name: 'Sao Paulo', lat: -23.4356, lng: -46.4731 },
  { code: 'EZE', name: 'Buenos Aires', lat: -34.8222, lng: -58.5358 },
  { code: 'SCL', name: 'Santiago', lat: -33.3930, lng: -70.7858 },
]

interface LiveMapProps {
  refreshInterval?: number // in ms, default 30s
}

export function LiveMap({ refreshInterval = 30000 }: LiveMapProps) {
  const [users, setUsers] = useState<RecentUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null)

  const fetchUsers = useCallback(async () => {
    const result = await getAdminMetrics()
    if (result.data?.recentUsers) {
      setUsers(result.data.recentUsers)
      setLastUpdate(new Date())
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchUsers, refreshInterval])

  // Get users with valid coordinates
  const usersWithLocation = users.filter(
    (u) => u.last_latitude !== null && u.last_longitude !== null
  )

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full bg-zinc-800 rounded-xl" />
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#E91E8C]" />
            Mapa en Vivo
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Wifi className="h-3 w-3 text-[#00ff88] animate-pulse" />
              <span>{usersWithLocation.length} con GPS</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchUsers}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* SVG Map */}
        <div className="relative bg-zinc-950 overflow-hidden">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-auto"
            style={{ maxHeight: '350px' }}
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Americas simplified outline - North America */}
            <path
              d="M 20,40 Q 60,30 120,35 L 180,50 Q 220,60 250,80 L 280,110 Q 300,130 310,160 L 290,200 Q 270,220 250,240 L 230,260 Q 220,270 200,280 L 180,290 Q 160,295 140,290 L 120,280 Q 100,270 80,250 L 60,220 Q 40,190 30,160 L 25,120 Q 20,80 20,40 Z"
              fill="#1a1a1a"
              stroke="#3f3f46"
              strokeWidth="0.5"
            />
            {/* Central America */}
            <path
              d="M 200,280 Q 210,290 220,310 L 230,340 Q 240,360 235,380 L 220,390 Q 210,395 200,390"
              fill="#1a1a1a"
              stroke="#3f3f46"
              strokeWidth="0.5"
            />
            {/* South America */}
            <path
              d="M 200,390 Q 230,400 260,420 L 290,450 Q 310,480 300,520 L 280,560 Q 260,590 240,610 L 220,640 Q 200,660 190,680 L 180,720 Q 175,750 185,780 L 200,800 Q 210,820 200,840 L 190,860 Q 180,870 170,860 L 160,840 Q 150,800 160,760 L 170,720 Q 175,680 165,640 L 150,600 Q 140,560 145,520 L 160,480 Q 175,440 190,410 L 200,390 Z"
              fill="#1a1a1a"
              stroke="#3f3f46"
              strokeWidth="0.5"
            />

            {/* Reference airports */}
            {MAJOR_AIRPORTS.map((airport) => {
              const { x, y } = latLngToXY(airport.lat, airport.lng)
              return (
                <g key={airport.code}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#27272a"
                    stroke="#3f3f46"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 12}
                    textAnchor="middle"
                    className="text-[8px] fill-zinc-600"
                  >
                    {airport.code}
                  </text>
                </g>
              )
            })}

            {/* User markers */}
            {usersWithLocation.map((user, index) => {
              const { x, y } = latLngToXY(
                user.last_latitude!,
                user.last_longitude!
              )
              const isSelected = selectedUser?.id === user.id

              return (
                <g
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedUser(isSelected ? null : user)}
                >
                  {/* Pulse animation */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 18 : 12}
                    fill="#E91E8C"
                    opacity={0.2}
                    className="animate-ping"
                    style={{ animationDelay: `${index * 200}ms` }}
                  />
                  {/* Main dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 8 : 5}
                    fill="#E91E8C"
                    stroke={isSelected ? '#fff' : '#E91E8C'}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#E91E8C]" />
              <span>Usuario</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Aeropuerto</span>
            </div>
          </div>

          {/* Selected user popup */}
          {selectedUser && (
            <div className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded-lg p-2 max-w-[160px]">
              <p className="text-sm font-medium text-[#fafafa] truncate">
                {selectedUser.nombre}
              </p>
              <p className="text-[10px] text-zinc-500">
                {selectedUser.last_location || 'Sin ubicación'}
              </p>
              <p className="text-[10px] text-[#E91E8C]">
                {formatDistanceToNow(new Date(selectedUser.last_seen_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#00ff88]" />
              <span className="text-xs text-zinc-400">
                {users.length} activos
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#E91E8C]" />
              <span className="text-xs text-zinc-400">
                {usersWithLocation.length} ubicados
              </span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-600">
            {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
          </span>
        </div>

        {/* User list with locations */}
        {usersWithLocation.length > 0 && (
          <div className="px-4 py-2 border-t border-zinc-800 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {usersWithLocation.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-1.5 rounded text-xs cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-[#E91E8C]/20'
                      : 'hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#E91E8C] flex-shrink-0" />
                    <span className="text-zinc-300 truncate">{user.nombre}</span>
                  </div>
                  <span className="text-zinc-500 flex-shrink-0">
                    {user.last_location || '?'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No GPS users message */}
        {usersWithLocation.length === 0 && users.length > 0 && (
          <div className="px-4 py-3 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-500">
              {users.length} usuarios activos, ninguno con GPS habilitado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
