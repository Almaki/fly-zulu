'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import {
  getCurrentZuluTime,
  getAirportLocalTime,
  AIRPORT_TIMEZONES,
} from '@/shared/lib/time'
import { getPendingCount } from '@/shared/lib/offline'

interface FlightHeaderProps {
  selectedAirport: string
  onAirportChange: (code: string) => void
}

export function FlightHeader({ selectedAirport, onAirportChange }: FlightHeaderProps) {
  const [zuluTime, setZuluTime] = useState(getCurrentZuluTime())
  const [localTime, setLocalTime] = useState<{ time: string; offset: string } | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [airportInput, setAirportInput] = useState(selectedAirport)

  // Update ZULU time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setZuluTime(getCurrentZuluTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Update local time when airport changes
  useEffect(() => {
    if (selectedAirport && AIRPORT_TIMEZONES[selectedAirport.toUpperCase()]) {
      const local = getAirportLocalTime(selectedAirport)
      setLocalTime({ time: local.time, offset: local.offset })
    } else {
      setLocalTime(null)
    }
  }, [selectedAirport, zuluTime])

  // Online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Pending count
  useEffect(() => {
    const updatePending = async () => {
      const count = await getPendingCount()
      setPendingCount(count)
    }
    updatePending()

    const interval = setInterval(updatePending, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAirportSubmit = () => {
    const code = airportInput.toUpperCase().trim()
    if (code.length === 3) {
      onAirportChange(code)
    }
  }

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl p-4 mb-4">
      {/* ZULU Time - Main Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#00ffff]" />
          <span className="text-3xl font-mono font-bold text-[#00ffff] tracking-wider">
            {zuluTime}Z
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30">
              <Wifi className="w-3 h-3 text-[#22c55e]" />
              <span className="text-[10px] font-medium text-[#22c55e]">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30">
              <WifiOff className="w-3 h-3 text-[#ef4444]" />
              <span className="text-[10px] font-medium text-[#ef4444]">Offline</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/30">
              <RefreshCw className="w-3 h-3 text-[#f59e0b]" />
              <span className="text-[10px] font-medium text-[#f59e0b]">{pendingCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Local Time Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-4 h-4 text-[#71717a]" />
          <Input
            placeholder="MEX"
            value={airportInput}
            onChange={(e) => setAirportInput(e.target.value.toUpperCase())}
            onBlur={handleAirportSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleAirportSubmit()}
            maxLength={3}
            className="w-20 uppercase text-center bg-background border-[#27272a] font-mono"
          />
        </div>

        {localTime ? (
          <div className="text-right">
            <div className="text-lg font-mono text-[#fafafa]">
              {localTime.time.slice(0, 5)}
            </div>
            <div className="text-xs text-[#71717a]">
              {selectedAirport} ({localTime.offset})
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#71717a]">
            Ingresa código IATA
          </div>
        )}
      </div>
    </div>
  )
}
