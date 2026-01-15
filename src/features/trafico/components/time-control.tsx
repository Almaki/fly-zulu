'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Clock, CheckCircle } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

interface TimeEntry {
  id: string
  label: string
  time: string | null
  icon?: React.ReactNode
}

const INITIAL_TIMES: TimeEntry[] = [
  { id: 'etd', label: 'ETD', time: null },
  { id: 'on_block', label: 'ON BLOCK', time: null },
  { id: 'boarding', label: 'Inicio Abordaje', time: null },
  { id: 'last_pax', label: 'Último PAX', time: null },
  { id: 'door_close', label: 'Cierre de Puerta', time: null },
  { id: 'off_block', label: 'OFF BLOCK', time: null },
]

export function TimeControl() {
  const [times, setTimes] = useState<TimeEntry[]>(INITIAL_TIMES)
  const [flightNumber, setFlightNumber] = useState('')

  const setTime = (id: string) => {
    const now = format(new Date(), 'HH:mm')
    setTimes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, time: now } : t))
    )
  }

  const clearTime = (id: string) => {
    setTimes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, time: null } : t))
    )
  }

  const completedCount = times.filter((t) => t.time !== null).length
  const isComplete = completedCount === times.length

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Control de Tiempos
          </div>
          <Badge variant={isComplete ? 'default' : 'secondary'}>
            {completedCount}/{times.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flight number */}
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">
            Número de Vuelo
          </label>
          <Input
            placeholder="Y4123"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            className="uppercase"
          />
        </div>

        {/* Time entries */}
        <div className="space-y-3">
          {times.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {entry.time ? (
                  <CheckCircle className="h-5 w-5 text-[#00ff88]" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-600" />
                )}
                <span className={entry.time ? 'text-zinc-400' : ''}>
                  {entry.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entry.time ? (
                  <>
                    <span className="text-lg font-mono text-[#00ff88]">
                      {entry.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearTime(entry.id)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Borrar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTime(entry.id)}
                  >
                    Marcar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-[#00ff88] mx-auto mb-2" />
            <p className="text-[#00ff88] font-medium">
              Todos los tiempos registrados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
