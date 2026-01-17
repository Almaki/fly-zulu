'use client'

import { useState, useEffect } from 'react'
import { History, ChevronDown, ChevronUp, Clock, Plane, Calendar, Cloud, CloudOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { formatDurationHHMM } from '@/shared/lib/time'
import {
  getLocalHistory,
  getLocalStats,
  cleanupOldLocalData,
  type DutySession,
  type FlightEntry,
} from '@/shared/lib/offline'

interface HistorySectionProps {
  userId: string
}

type SessionWithFlights = DutySession & { flightEntries: FlightEntry[] }

export function HistorySection({ userId }: HistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessions, setSessions] = useState<SessionWithFlights[]>([])
  const [stats, setStats] = useState<{
    totalFlights: number
    totalFlightMinutes: number
    totalBlockMinutes: number
    totalDutySessions: number
    averageDutyMinutes: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Load history when expanded
  useEffect(() => {
    if (!isExpanded) return

    const loadHistory = async () => {
      setIsLoading(true)
      try {
        const [historyData, statsData] = await Promise.all([
          getLocalHistory(userId),
          getLocalStats(userId),
        ])
        setSessions(historyData.sessions)
        setStats(statsData)

        // Run cleanup in background (won't affect UI)
        cleanupOldLocalData().catch(console.error)
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [isExpanded, userId])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#00ffff]" />
          <span className="text-sm font-semibold text-[#fafafa]">
            Historial Reciente
          </span>
          <span className="text-xs text-[#71717a]">(48h local)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#71717a]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#71717a]" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#27272a] p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ffff]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-[#71717a]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin historial disponible</p>
              <p className="text-xs mt-1">Los datos se guardan al completar vuelos</p>
            </div>
          ) : (
            <>
              {/* Stats summary */}
              {stats && stats.totalFlights > 0 && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-background rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#00ff41]">{stats.totalFlights}</p>
                    <p className="text-[10px] text-[#71717a]">Vuelos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#00ffff]">
                      {formatDurationHHMM(stats.totalFlightMinutes)}
                    </p>
                    <p className="text-[10px] text-[#71717a]">Tiempo Vuelo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#ffbf00]">
                      {formatDurationHHMM(stats.totalBlockMinutes)}
                    </p>
                    <p className="text-[10px] text-[#71717a]">Tiempo Block</p>
                  </div>
                </div>
              )}

              {/* Sessions list */}
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-background rounded-lg border border-[#27272a] overflow-hidden"
                  >
                    {/* Session header */}
                    <button
                      onClick={() => setExpandedSession(
                        expandedSession === session.id ? null : session.id
                      )}
                      className="w-full flex items-center justify-between p-3 hover:bg-[#141414] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-sm font-medium text-[#fafafa]">
                            {formatDate(session.date)}
                          </p>
                          <p className="text-xs text-[#71717a]">
                            {session.dutyStart}Z - {session.dutyEnd || 'En curso'}Z
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-mono text-[#00ff41]">
                            {session.flightEntries.length} vuelo{session.flightEntries.length !== 1 ? 's' : ''}
                          </p>
                          {session.dutyMinutes && (
                            <p className="text-xs text-[#71717a]">
                              Jornada: {formatDurationHHMM(session.dutyMinutes)}
                            </p>
                          )}
                        </div>
                        {/* Sync status indicator */}
                        {session.syncStatus === 'synced' ? (
                          <Cloud className="w-4 h-4 text-[#22c55e]" />
                        ) : (
                          <CloudOff className="w-4 h-4 text-[#f59e0b]" />
                        )}
                        {expandedSession === session.id ? (
                          <ChevronUp className="w-4 h-4 text-[#71717a]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#71717a]" />
                        )}
                      </div>
                    </button>

                    {/* Session flights (expanded) */}
                    {expandedSession === session.id && session.flightEntries.length > 0 && (
                      <div className="border-t border-[#27272a] p-2 space-y-1">
                        {session.flightEntries.map((flight, index) => (
                          <div
                            key={flight.id}
                            className="flex items-center justify-between py-2 px-3 bg-[#141414] rounded"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#52525b]">#{index + 1}</span>
                              <Plane className="w-3 h-3 text-[#00ffff]" />
                              <span className="font-mono text-sm text-[#fafafa]">
                                {flight.dep} → {flight.dest}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-[#71717a]">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatDurationHHMM(flight.flightMinutes)}
                              </span>
                              <span className="text-[#52525b] font-mono text-[10px]">
                                {flight.tail}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info about data retention */}
              <div className="text-center text-[10px] text-[#52525b] pt-2">
                <Cloud className="w-3 h-3 inline mr-1" />
                Los datos sincronizados se guardan permanentemente en la nube
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
