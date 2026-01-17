'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Square, Clock, AlertTriangle, Edit2, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  getCurrentZuluTime,
  timeToMinutes,
  calculateMinutesBetween,
  getDutyStatusColor,
  formatDurationHHMM,
  type DutyStatus,
} from '@/shared/lib/time'

// Default duty limit in hours (editable by user)
const DEFAULT_DUTY_LIMIT_HOURS = 14

interface DutySectionProps {
  dutyStart: string | null
  dutyEnd: string | null
  lastInTime: string | null
  onStartDuty: (time: string) => void
  onEndDuty: (time: string) => void
  onUpdateDutyStart: (time: string) => void
  onUpdateDutyEnd: (time: string) => void
}

// Custom duty status calculation with editable limit
function getDutyStatusWithLimit(elapsedMinutes: number, limitHours: number): DutyStatus {
  const criticalThreshold = limitHours * 60
  const warningThreshold = (limitHours - 2) * 60 // Warning 2 hours before limit

  if (elapsedMinutes >= criticalThreshold) return 'critical'
  if (elapsedMinutes >= warningThreshold) return 'warning'
  return 'active'
}

export function DutySection({
  dutyStart,
  dutyEnd,
  lastInTime,
  onStartDuty,
  onEndDuty,
  onUpdateDutyStart,
  onUpdateDutyEnd,
}: DutySectionProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [status, setStatus] = useState<DutyStatus>('inactive')
  const [isEditingStart, setIsEditingStart] = useState(false)
  const [editStartValue, setEditStartValue] = useState('')
  const [isEditingEnd, setIsEditingEnd] = useState(false)
  const [editEndValue, setEditEndValue] = useState('')
  const [manualStartInput, setManualStartInput] = useState('')
  const [showManualStart, setShowManualStart] = useState(false)

  // Editable duty limit (in hours)
  const [dutyLimitHours, setDutyLimitHours] = useState(DEFAULT_DUTY_LIMIT_HOURS)
  const [isEditingLimit, setIsEditingLimit] = useState(false)
  const [editLimitValue, setEditLimitValue] = useState('')

  // Calculate elapsed time
  const updateElapsed = useCallback(() => {
    if (!dutyStart) {
      setElapsedMinutes(0)
      setStatus('inactive')
      return
    }

    if (dutyEnd) {
      const mins = calculateMinutesBetween(dutyStart, dutyEnd)
      setElapsedMinutes(mins)
      setStatus('completed')
      return
    }

    const now = getCurrentZuluTime().slice(0, 5)
    const mins = calculateMinutesBetween(dutyStart, now)
    setElapsedMinutes(mins)
    setStatus(getDutyStatusWithLimit(mins, dutyLimitHours))
  }, [dutyStart, dutyEnd, dutyLimitHours])

  useEffect(() => {
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [updateElapsed])

  // Calculate estimated end (IN + 30min)
  const estimatedEnd = lastInTime
    ? (() => {
        const inMins = timeToMinutes(lastInTime)
        const endMins = inMins + 30
        const h = Math.floor(endMins / 60) % 24
        const m = endMins % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      })()
    : null

  const handleStartDuty = () => {
    if (showManualStart && manualStartInput) {
      onStartDuty(manualStartInput)
      setShowManualStart(false)
      setManualStartInput('')
    } else {
      onStartDuty(getCurrentZuluTime().slice(0, 5))
    }
  }

  const handleEndDuty = () => {
    const endTime = estimatedEnd || getCurrentZuluTime().slice(0, 5)
    onEndDuty(endTime)
  }

  const handleSaveEditStart = () => {
    if (editStartValue && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editStartValue)) {
      onUpdateDutyStart(editStartValue)
    }
    setIsEditingStart(false)
    setEditStartValue('')
  }

  const handleSaveEditEnd = () => {
    // Validate time format HH:MM
    if (editEndValue && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editEndValue)) {
      onUpdateDutyEnd(editEndValue)
    }
    setIsEditingEnd(false)
    setEditEndValue('')
  }

  const handleSaveLimit = () => {
    const newLimit = parseFloat(editLimitValue)
    if (!isNaN(newLimit) && newLimit >= 1 && newLimit <= 24) {
      setDutyLimitHours(newLimit)
    }
    setIsEditingLimit(false)
    setEditLimitValue('')
  }

  // Progress based on editable limit (no blocking - just visual indicator)
  const progressPercent = Math.min((elapsedMinutes / (dutyLimitHours * 60)) * 100, 100)

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#fafafa] uppercase tracking-wide">
          Jornada
        </h3>
        {status === 'warning' && (
          <div className="flex items-center gap-1 text-[#FF9500]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Acercándose al límite</span>
          </div>
        )}
        {status === 'critical' && (
          <div className="flex items-center gap-1 text-[#FF3B30]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">LÍMITE EXCEDIDO</span>
          </div>
        )}
      </div>

      {/* Inactive state - Start duty */}
      {!dutyStart && (
        <div className="space-y-3">
          {showManualStart ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="HH:MM"
                value={manualStartInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9:]/g, '')
                  if (val.length === 2 && !val.includes(':')) {
                    setManualStartInput(val + ':')
                  } else {
                    setManualStartInput(val)
                  }
                }}
                maxLength={5}
                className="w-24 text-center font-mono bg-background"
              />
              <span className="text-xs text-[#71717a]">Z</span>
              <Button
                size="sm"
                onClick={handleStartDuty}
                className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-black"
              >
                Iniciar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowManualStart(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleStartDuty}
                className="flex-1 bg-[#22c55e] hover:bg-[#22c55e]/90 text-black"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Jornada
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManualStart(true)}
                className="px-3"
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-xs text-[#71717a] text-center">
            O se iniciará automáticamente con el primer OUT
          </p>
        </div>
      )}

      {/* Active/Completed state */}
      {dutyStart && (
        <div className="space-y-4">
          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[#71717a]">Inicio</span>
              {isEditingStart ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editStartValue}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9:]/g, '')
                      if (val.length === 2 && !val.includes(':')) {
                        val = val + ':'
                      }
                      setEditStartValue(val)
                    }}
                    placeholder="HH:MM"
                    className="w-20 h-8 text-center font-mono bg-background"
                    maxLength={5}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveEditStart} className="h-8 w-8">
                    <Check className="w-4 h-4 text-[#22c55e]" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-lg font-mono text-[#00ff41]">{dutyStart}Z</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditStartValue(dutyStart || '')
                      setIsEditingStart(true)
                    }}
                    className="h-6 w-6"
                  >
                    <Edit2 className="w-3 h-3 text-[#71717a]" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <span className="text-xs text-[#71717a]">
                Fin {dutyEnd ? '(fijo)' : estimatedEnd ? 'estimado' : ''}
              </span>
              {isEditingEnd ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editEndValue}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9:]/g, '')
                      if (val.length === 2 && !val.includes(':')) {
                        val = val + ':'
                      }
                      setEditEndValue(val)
                    }}
                    placeholder="HH:MM"
                    className="w-20 h-8 text-center font-mono bg-background"
                    maxLength={5}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveEditEnd} className="h-8 w-8">
                    <Check className="w-4 h-4 text-[#22c55e]" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className={`text-lg font-mono ${dutyEnd ? 'text-[#00ff41]' : estimatedEnd ? 'text-[#ffbf00]' : 'text-[#71717a]'}`}>
                    {dutyEnd || estimatedEnd || '--:--'}Z
                  </p>
                  {/* Always show edit button to allow manual entry */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditEndValue(dutyEnd || estimatedEnd || '')
                      setIsEditingEnd(true)
                    }}
                    className="h-6 w-6"
                    title="Editar fin de jornada"
                  >
                    <Edit2 className="w-3 h-3 text-[#71717a]" />
                  </Button>
                </div>
              )}
              {dutyEnd && (
                <p className="text-[10px] text-[#22c55e] mt-0.5">Valor fijo para cálculos</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#71717a]">
              <span>Transcurrido: {formatDurationHHMM(elapsedMinutes)}</span>
              {isEditingLimit ? (
                <div className="flex items-center gap-1">
                  <span>Límite:</span>
                  <Input
                    value={editLimitValue}
                    onChange={(e) => setEditLimitValue(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder={dutyLimitHours.toString()}
                    className="w-12 h-5 text-center text-xs font-mono bg-background px-1"
                    maxLength={4}
                    autoFocus
                  />
                  <span>h</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveLimit}
                    className="h-5 w-5"
                  >
                    <Check className="w-3 h-3 text-[#22c55e]" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditLimitValue(dutyLimitHours.toString())
                    setIsEditingLimit(true)
                  }}
                  className="flex items-center gap-1 hover:text-[#fafafa] transition-colors"
                >
                  <span>Límite: {formatDurationHHMM(dutyLimitHours * 60)}</span>
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: getDutyStatusColor(status),
                }}
              />
            </div>
            {status === 'critical' && (
              <p className="text-[10px] text-[#71717a] text-center mt-1">
                El sistema no bloquea - solo alerta visual
              </p>
            )}
          </div>

          {/* End duty button */}
          {!dutyEnd && lastInTime && (
            <Button
              onClick={handleEndDuty}
              variant="outline"
              className="w-full border-[#FF9500]/50 text-[#FF9500] hover:bg-[#FF9500]/10"
            >
              <Square className="w-4 h-4 mr-2" />
              Finalizar Jornada ({estimatedEnd}Z)
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
