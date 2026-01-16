'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, Clock, AlertTriangle, Ban, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { getCityName, getTerminalOptions, hasTerminals } from '../constants/airports'
import { updateFlight, updateFlightStatus } from '../services'
import { useFIDSStore } from '../store'
import type { Flight } from '../types'
import type { FlightStatus } from '@/shared/types'

interface FlightRowProps {
  flight: Flight
  direction: 'departures' | 'arrivals'
  airportCode: string
}

type EditField = 'time' | 'flight' | 'gate' | 'status' | null

export function FlightRow({ flight, direction, airportCode }: FlightRowProps) {
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateFlight: updateLocalFlight } = useFIDSStore()

  // Determine which city to show based on direction
  const displayCity = direction === 'departures'
    ? getCityName(flight.destination)
    : getCityName(flight.origin)

  const displayCode = direction === 'departures'
    ? flight.destination
    : flight.origin

  // Get scheduled time for display
  const scheduledTime = direction === 'departures' ? flight.std : flight.sta
  const displayTime = format(new Date(scheduledTime), 'HH:mm')

  // Get delay info - show delay indicator if delay_minutes > 0 (regardless of current status)
  // This allows delay to persist even when status changes to GATE_CHANGE
  const hasDelay = flight.delay_minutes > 0
  // delay_minutes stores the new time as total minutes from midnight (e.g., 14:30 = 870 minutes)
  const newTime = hasDelay
    ? `${String(Math.floor(flight.delay_minutes / 60)).padStart(2, '0')}:${String(flight.delay_minutes % 60).padStart(2, '0')}`
    : null

  // Check if gate was changed
  const hasGateChange = flight.status === 'GATE_CHANGE'

  // Show both labels when there's delay AND gate change
  const showDelayLabel = hasDelay
  const showGateChangeLabel = hasGateChange

  // Status indicator color - consider multiple states
  // Priority: CANCELED > GATE_CHANGE (with delay) > DELAY > ON_TIME
  const getStatusColor = () => {
    if (flight.status === 'CANCELED') {
      return { color: 'bg-[#ef4444]', breathe: true }
    }
    if (hasGateChange && hasDelay) {
      // Both delay and gate change - show blue (most recent change)
      return { color: 'bg-[#3b82f6]', breathe: true }
    }
    if (hasGateChange) {
      return { color: 'bg-[#3b82f6]', breathe: true }
    }
    if (hasDelay) {
      return { color: 'bg-[#f59e0b]', breathe: true }
    }
    if (flight.status === 'BOARDING') {
      return { color: 'bg-[#22c55e]', breathe: true }
    }
    if (flight.status === 'DEPARTED' || flight.status === 'ARRIVED') {
      return { color: 'bg-zinc-500', breathe: false }
    }
    // ON_TIME - static green
    return { color: 'bg-[#22c55e]', breathe: false }
  }

  const statusConfig = getStatusColor()

  // Gate card color based on gate change status
  const gateCardColor = hasGateChange
    ? 'bg-[#3b82f6] hover:bg-[#2563eb]' // Blue for gate change
    : 'bg-[#ca8a04] hover:bg-[#a16207]' // Yellow for normal

  // Start editing
  const startEdit = (field: EditField, currentValue: string) => {
    setEditField(field)
    setEditValue(currentValue)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditField(null)
    setEditValue('')
  }

  // Save edit
  const saveEdit = async () => {
    if (!editValue.trim()) {
      cancelEdit()
      return
    }

    setIsSubmitting(true)
    try {
      let updates: Partial<Flight> = {}

      switch (editField) {
        case 'time':
          // Parse HH:mm and create new date
          const [hours, minutes] = editValue.split(':').map(Number)
          const newDate = new Date(scheduledTime)
          newDate.setHours(hours, minutes, 0, 0)
          updates = direction === 'departures'
            ? { std: newDate.toISOString() }
            : { sta: newDate.toISOString() }
          break

        case 'flight':
          updates = { flight_number: `VOI${editValue}` }
          break

        case 'gate':
          updates = { gate: editValue }
          break
      }

      const { error } = await updateFlight(flight.id, updates)
      if (error) throw new Error(error)

      updateLocalFlight(flight.id, updates)
      toast.success('Actualizado')
      cancelEdit()
    } catch (error) {
      toast.error('Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save status
  const saveStatus = async (status: FlightStatus, delayMinutes?: number) => {
    setIsSubmitting(true)
    try {
      const { error } = await updateFlightStatus(flight.id, status, delayMinutes)
      if (error) throw new Error(error)

      updateLocalFlight(flight.id, {
        status,
        delay_minutes: delayMinutes || 0,
      })
      toast.success('Status actualizado')
      cancelEdit()
    } catch (error) {
      toast.error('Error al actualizar status')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time input
  const handleTimeInput = (value: string) => {
    let val = value.replace(/[^0-9]/g, '')
    if (val.length >= 2) {
      const hours = parseInt(val.slice(0, 2))
      if (hours > 23) val = '23' + val.slice(2)
      val = val.slice(0, 2) + ':' + val.slice(2)
    }
    if (val.length > 5) val = val.slice(0, 5)
    setEditValue(val)
  }

  // Get gate options for airport with terminals
  const gateOptions = hasTerminals(airportCode) ? getTerminalOptions(airportCode) : []

  return (
    <div className="bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-colors border-b border-zinc-800/50">
      {/* Two Row Layout with Gate card spanning both rows */}
      <div className="flex items-stretch">
        {/* Left side: 2 rows */}
        <div className="flex-1 py-2 pl-4 pr-2">
          {/* Row 1: Time + Flight Number */}
          <div className="flex items-center gap-3 mb-1">
            {/* Time - Editable */}
            {editField === 'time' ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editValue}
                  onChange={(e) => handleTimeInput(e.target.value)}
                  className="w-16 h-8 text-sm px-2 bg-[#1a1a1a] border-[#E91E8C]"
                  maxLength={5}
                  inputMode="numeric"
                  autoFocus
                />
                <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e] p-1">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={cancelEdit} className="text-zinc-500 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit('time', displayTime)}
                className="text-left hover:text-[#E91E8C] transition-colors"
              >
                <span className={`text-xl font-bold font-mono ${hasDelay ? 'text-zinc-500 line-through' : 'text-[#fafafa]'}`}>
                  {displayTime}
                </span>
                {newTime && (
                  <span className="ml-2 text-sm font-mono text-[#f59e0b]">
                    →{newTime}
                  </span>
                )}
              </button>
            )}

            {/* Flight Number - Editable */}
            {editField === 'flight' ? (
              <div className="flex items-center gap-1">
                <span className="text-[#E91E8C] text-sm font-bold">VOI</span>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-14 h-8 text-sm px-2 bg-[#1a1a1a] border-[#E91E8C]"
                  maxLength={4}
                  inputMode="numeric"
                  autoFocus
                />
                <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e] p-1">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit('flight', flight.flight_number.replace('VOI', ''))}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#E91E8C] text-white text-sm font-bold tracking-wide">
                  VOI {flight.flight_number.replace('VOI', '')}
                </span>
              </button>
            )}
          </div>

          {/* Row 2: Status indicator + Destination + Status label */}
          <div className="flex items-center gap-2">
            {/* Status indicator - clickable to edit */}
            <button
              onClick={() => setEditField('status')}
              className="flex-shrink-0 focus:outline-none"
              aria-label="Editar status"
            >
              <div
                className={`w-3 h-3 rounded-full ${statusConfig.color} ${
                  statusConfig.breathe ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''
                } hover:ring-2 hover:ring-white/20 transition-all`}
              />
            </button>

            {/* Destination */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <p className="text-sm text-zinc-300 truncate">
                {displayCity}
              </p>
              <span className="text-xs text-zinc-600 font-mono">
                {displayCode}
              </span>
              {/* Status labels - can show multiple (DLY + CHG) */}
              {showDelayLabel && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#f59e0b] bg-[#f59e0b]/10">
                  DLY
                </span>
              )}
              {showGateChangeLabel && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#3b82f6] bg-[#3b82f6]/10">
                  CHG
                </span>
              )}
              {flight.status === 'CANCELED' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#ef4444] bg-[#ef4444]/10">
                  CNL
                </span>
              )}
              {flight.status === 'BOARDING' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#22c55e] bg-[#22c55e]/10">
                  BRD
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Gate card - full row 1 height + half of row 2 */}
        <div className="flex items-start pr-3 py-1.5">
          {editField === 'gate' ? (
            <div className="flex items-center gap-1">
              {gateOptions.length > 0 ? (
                <Select value={editValue} onValueChange={setEditValue}>
                  <SelectTrigger className="w-20 h-16 text-xl bg-[#1a1a1a] border-[#d97706]">
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    {gateOptions.map((terminal) => (
                      Array.from({ length: 20 }, (_, i) => (
                        <SelectItem key={`${terminal}${i + 1}`} value={`${terminal}${i + 1}`}>
                          {terminal}{i + 1}
                        </SelectItem>
                      ))
                    )).flat()}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value.toUpperCase().slice(0, 4))}
                  className="w-20 h-16 text-xl text-center bg-[#1a1a1a] border-[#d97706]"
                  maxLength={4}
                  autoFocus
                />
              )}
              <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e] p-1">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit('gate', flight.gate || '')}
              className={`relative flex flex-col items-center justify-center min-w-[64px] h-[52px] px-4 rounded-xl transition-colors ${gateCardColor}`}
            >
              {/* Gate change indicator icon */}
              {hasGateChange && (
                <ArrowRightLeft className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white bg-[#3b82f6] rounded-full p-0.5" />
              )}
              <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider -mb-0.5">
                Puerta
              </span>
              <span className="text-3xl font-bold font-mono text-white tracking-wide leading-none">
                {flight.gate || '—'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Status Editor Modal */}
      {editField === 'status' && (
        <StatusEditor
          currentStatus={flight.status}
          onSave={saveStatus}
          onCancel={cancelEdit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

// Status Editor Component
function StatusEditor({
  currentStatus,
  onSave,
  onCancel,
  isSubmitting,
}: {
  currentStatus: FlightStatus
  onSave: (status: FlightStatus, delayMinutes?: number) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [status, setStatus] = useState<FlightStatus>(currentStatus)
  const [newTime, setNewTime] = useState('')

  // Parse time input HH:MM
  const handleTimeInput = (value: string) => {
    let val = value.replace(/[^0-9]/g, '')
    if (val.length >= 2) {
      const hours = parseInt(val.slice(0, 2))
      if (hours > 23) val = '23' + val.slice(2)
      val = val.slice(0, 2) + ':' + val.slice(2)
    }
    if (val.length > 5) val = val.slice(0, 5)
    setNewTime(val)
  }

  // Calculate delay minutes from new time
  const calculateDelayMinutes = (): number => {
    if (newTime.length !== 5) return 0
    const [hours, minutes] = newTime.split(':').map(Number)
    // For simplicity, return minutes as a positive value
    // The actual calculation should compare with original time
    // but we'll store the new time as delay_minutes for now
    return hours * 60 + minutes
  }

  const isValidTime = newTime.length === 5

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] w-full max-w-md rounded-2xl p-4 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#fafafa]">Actualizar Status</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status options */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStatus('ON_TIME')}
            className={`p-3 rounded-lg border-2 transition-all ${
              status === 'ON_TIME'
                ? 'border-[#22c55e] bg-[#22c55e]/10'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#22c55e] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#fafafa]">On Time</p>
          </button>

          <button
            onClick={() => setStatus('DELAY')}
            className={`p-3 rounded-lg border-2 transition-all ${
              status === 'DELAY'
                ? 'border-[#f59e0b] bg-[#f59e0b]/10'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#fafafa]">Delay</p>
          </button>

          <button
            onClick={() => setStatus('GATE_CHANGE')}
            className={`p-3 rounded-lg border-2 transition-all ${
              status === 'GATE_CHANGE'
                ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#3b82f6] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#fafafa]">Cambio Puerta</p>
          </button>

          <button
            onClick={() => setStatus('CANCELED')}
            className={`p-3 rounded-lg border-2 transition-all ${
              status === 'CANCELED'
                ? 'border-[#ef4444] bg-[#ef4444]/10'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#ef4444] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#fafafa]">Cancelado</p>
          </button>
        </div>

        {/* New time input for delay */}
        {status === 'DELAY' && (
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Nueva hora estimada</label>
            <Input
              value={newTime}
              onChange={(e) => handleTimeInput(e.target.value)}
              placeholder="HH:MM"
              className="text-center text-2xl font-mono h-14 bg-[#1a1a1a] border-[#f59e0b] text-[#fafafa]"
              maxLength={5}
              inputMode="numeric"
              autoFocus
            />
            <p className="text-xs text-zinc-600 text-center">
              Ingresa la nueva hora de salida
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 border-zinc-700 text-zinc-400"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(status, status === 'DELAY' ? calculateDelayMinutes() : undefined)}
            disabled={isSubmitting || (status === 'DELAY' && !isValidTime)}
            className="flex-1 h-12 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-bold"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
