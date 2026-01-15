'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Play, Square, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import { DUTY_LIMITS } from '@/shared/constants'
import { usePilotStore } from '../store'

export function DutyTracker() {
  const { currentDutyStart, setDutyStart } = usePilotStore()
  const [currentZulu, setCurrentZulu] = useState('')
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  // Update current ZULU time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentZulu(formatInTimeZone(now, 'UTC', 'HH:mm:ss'))

      if (currentDutyStart) {
        const [startH, startM] = currentDutyStart.split(':').map(Number)
        const zuluNow = formatInTimeZone(now, 'UTC', 'HH:mm')
        const [nowH, nowM] = zuluNow.split(':').map(Number)

        let elapsed = (nowH * 60 + nowM) - (startH * 60 + startM)
        if (elapsed < 0) elapsed += 24 * 60 // Overnight

        setElapsedMinutes(elapsed)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [currentDutyStart])

  const startDuty = () => {
    const zuluTime = formatInTimeZone(new Date(), 'UTC', 'HH:mm')
    setDutyStart(zuluTime)
    toast.success(`Jornada iniciada: ${zuluTime}Z`)
  }

  const endDuty = () => {
    if (!currentDutyStart) return

    const zuluTime = formatInTimeZone(new Date(), 'UTC', 'HH:mm')
    toast.success(`Jornada finalizada: ${zuluTime}Z - Total: ${formatDuration(elapsedMinutes)}`)
    setDutyStart(null)
  }

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`
  }

  const dutyProgress = (elapsedMinutes / (DUTY_LIMITS.MAX_DUTY_HOURS * 60)) * 100
  const isWarning = elapsedMinutes >= DUTY_LIMITS.WARNING_THRESHOLD_HOURS * 60
  const isOverLimit = elapsedMinutes >= DUTY_LIMITS.MAX_DUTY_HOURS * 60

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Jornada
          </span>
          <span className="text-sm font-mono text-[#00ff88]">
            {currentZulu}Z
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="text-center py-4 border border-zinc-800 rounded-lg bg-black/50">
          {currentDutyStart ? (
            <>
              <p className="text-xs text-zinc-500 mb-1">INICIO</p>
              <p className="text-2xl font-mono text-[#00ff88]">
                {currentDutyStart}Z
              </p>
              <p className="text-xs text-zinc-500 mt-3 mb-1">TIEMPO TRANSCURRIDO</p>
              <p className={`text-4xl font-mono ${isOverLimit ? 'text-[#FF3B30]' : isWarning ? 'text-[#FF9500]' : 'text-white'}`}>
                {formatDuration(elapsedMinutes)}
              </p>
            </>
          ) : (
            <p className="text-zinc-500">Jornada no iniciada</p>
          )}
        </div>

        {/* Progress bar */}
        {currentDutyStart && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0h</span>
              <span>{DUTY_LIMITS.WARNING_THRESHOLD_HOURS}h</span>
              <span>{DUTY_LIMITS.MAX_DUTY_HOURS}h</span>
            </div>
            <Progress
              value={Math.min(dutyProgress, 100)}
              className={`h-3 ${isOverLimit ? '[&>div]:bg-[#FF3B30]' : isWarning ? '[&>div]:bg-[#FF9500]' : '[&>div]:bg-[#00ff88]'}`}
            />

            {isWarning && !isOverLimit && (
              <div className="flex items-center gap-2 text-[#FF9500] text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Acercándose al límite de {DUTY_LIMITS.MAX_DUTY_HOURS}h</span>
              </div>
            )}

            {isOverLimit && (
              <div className="flex items-center gap-2 text-[#FF3B30] text-sm font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>¡LÍMITE DE JORNADA EXCEDIDO!</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!currentDutyStart ? (
            <Button
              onClick={startDuty}
              className="flex-1 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Jornada
            </Button>
          ) : (
            <Button
              onClick={endDuty}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Finalizar Jornada
            </Button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-zinc-600 text-center">
          Todos los tiempos en ZULU (UTC). Límite máximo: {DUTY_LIMITS.MAX_DUTY_HOURS} horas.
        </p>
      </CardContent>
    </Card>
  )
}
