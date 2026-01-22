'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, MapPin, Users, Wifi, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { getUsersByCity } from '../services'
import type { CityUsersData, CityUser } from '../types'

// Mexico map SVG coordinates for cities
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  TIJ: { x: 50, y: 60 },
  BJX: { x: 190, y: 200 },
  GDL: { x: 160, y: 190 },
  MTY: { x: 260, y: 130 },
  MEX: { x: 210, y: 220 },
  CUN: { x: 350, y: 200 },
}

const MAP_WIDTH = 420
const MAP_HEIGHT = 300

interface CityUsersMapProps {
  refreshInterval?: number
}

export function CityUsersMap({ refreshInterval = 30000 }: CityUsersMapProps) {
  const [cities, setCities] = useState<CityUsersData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedCity, setSelectedCity] = useState<CityUsersData | null>(null)
  const [expandedCity, setExpandedCity] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const result = await getUsersByCity()
    if (result.data) {
      setCities(result.data)
      setLastUpdate(new Date())
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  const totalOnline = cities.reduce((acc, c) => acc + c.online_count, 0)
  const totalRecent = cities.reduce((acc, c) => acc + c.recent_count, 0)
  const totalUsers = cities.reduce((acc, c) => acc + c.users.length, 0)

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full bg-zinc-800 rounded-xl" />
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#E91E8C]" />
          <span className="text-sm font-medium text-[#fafafa]">Mapa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Wifi className="h-3 w-3 text-[#22c55e] animate-pulse" />
            <span>{totalOnline}</span>
          </div>
          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>
      </div>
      <CardContent className="p-0">
        {/* SVG Map of Mexico */}
        <div className="relative bg-zinc-950 overflow-hidden">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-auto"
            style={{ maxHeight: '280px' }}
          >
            {/* Grid */}
            <defs>
              <pattern id="cityGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cityGrid)" />

            {/* Simplified Mexico outline */}
            <path
              d="M 30,50 Q 60,30 100,45 L 150,60 Q 200,55 250,70 L 290,90 Q 320,100 340,120 L 360,150 Q 380,180 370,210 L 350,240 Q 330,260 300,265 L 260,260 Q 230,255 200,250 L 170,255 Q 140,260 110,250 L 80,230 Q 50,200 40,160 L 35,120 Q 30,80 30,50 Z"
              fill="#1a1a1a"
              stroke="#3f3f46"
              strokeWidth="1"
            />

            {/* City markers */}
            {cities.map((city) => {
              const pos = CITY_POSITIONS[city.ciudad_code]
              if (!pos) return null

              const isSelected = selectedCity?.ciudad_code === city.ciudad_code
              const hasOnline = city.online_count > 0
              const hasUsers = city.users.length > 0

              // Calculate marker size based on user count
              const baseRadius = 8
              const maxRadius = 25
              const userRatio = Math.min(city.users.length / 10, 1)
              const radius = baseRadius + (maxRadius - baseRadius) * userRatio

              return (
                <g
                  key={city.ciudad_code}
                  className="cursor-pointer"
                  onClick={() => setSelectedCity(isSelected ? null : city)}
                >
                  {/* Pulse for online users */}
                  {hasOnline && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 8}
                      fill="#22c55e"
                      opacity={0.3}
                      className="animate-ping"
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={hasOnline ? '#22c55e' : hasUsers ? '#E91E8C' : '#3f3f46'}
                    stroke={isSelected ? '#fff' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    opacity={hasUsers ? 1 : 0.5}
                  />

                  {/* User count */}
                  {hasUsers && (
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-bold fill-white"
                    >
                      {city.users.length}
                    </text>
                  )}

                  {/* City code label */}
                  <text
                    x={pos.x}
                    y={pos.y + radius + 12}
                    textAnchor="middle"
                    className={cn(
                      "text-[9px] font-medium",
                      isSelected ? "fill-white" : "fill-zinc-500"
                    )}
                  >
                    {city.ciudad_code}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E91E8C]" />
              <span>Registrados</span>
            </div>
          </div>

          {/* Selected city popup */}
          {selectedCity && (
            <div className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded-lg p-3 max-w-[180px] shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#fafafa]">
                  {selectedCity.city_name}
                </p>
                <span className="text-[10px] text-zinc-500">{selectedCity.state}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Total:</span>
                  <span className="text-[#fafafa]">{selectedCity.users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#22c55e]">Online:</span>
                  <span className="text-[#22c55e]">{selectedCity.online_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Últimas 24h:</span>
                  <span className="text-[#E91E8C]">{selectedCity.recent_count}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar - Mobile optimized */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-[#E91E8C]" />
              <span className="text-[10px] text-zinc-400">{totalUsers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-[#22c55e]" />
              <span className="text-[10px] text-zinc-400">{totalOnline}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-400">{totalRecent}</span>
            </div>
          </div>
          <span className="text-[9px] text-zinc-600">
            {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
          </span>
        </div>

        {/* City details list */}
        <div className="border-t border-zinc-800 max-h-64 overflow-y-auto">
          {cities.map((city) => (
            <CitySection
              key={city.ciudad_code}
              city={city}
              isExpanded={expandedCity === city.ciudad_code}
              onToggle={() => setExpandedCity(
                expandedCity === city.ciudad_code ? null : city.ciudad_code
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CitySectionProps {
  city: CityUsersData
  isExpanded: boolean
  onToggle: () => void
}

function CitySection({ city, isExpanded, onToggle }: CitySectionProps) {
  const hasUsers = city.users.length > 0

  return (
    <div className="border-b border-zinc-800 last:border-0">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors active:bg-zinc-800/70",
          hasUsers ? "hover:bg-zinc-800/50" : "opacity-50 cursor-default"
        )}
        disabled={!hasUsers}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold",
            city.online_count > 0
              ? "bg-[#22c55e]/20 text-[#22c55e]"
              : hasUsers
                ? "bg-[#E91E8C]/20 text-[#E91E8C]"
                : "bg-zinc-800 text-zinc-500"
          )}>
            {city.ciudad_code}
          </div>
          <div>
            <p className="text-xs font-medium text-[#fafafa]">{city.city_name}</p>
            <p className="text-[9px] text-zinc-500">
              {city.users.length} • {city.online_count} online
            </p>
          </div>
        </div>
        {hasUsers && (
          isExpanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )
        )}
      </button>

      {/* Expanded user list */}
      {isExpanded && hasUsers && (
        <div className="px-2.5 pb-2.5 space-y-1">
          {city.users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}

interface UserRowProps {
  user: CityUser
}

function UserRow({ user }: UserRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-2 py-1.5 rounded-lg",
      user.is_online ? "bg-[#22c55e]/10" : "bg-zinc-800/30"
    )}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          user.is_online ? "bg-[#22c55e]" : "bg-zinc-600"
        )} />
        <span className="text-[11px] text-[#fafafa] truncate">{user.nombre}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
        <span className="text-[10px] text-zinc-500 font-medium">{user.posicion}</span>
        {user.empresa && (
          <span className="text-[9px] text-[#E91E8C] truncate max-w-[50px]">
            {user.empresa}
          </span>
        )}
      </div>
    </div>
  )
}
