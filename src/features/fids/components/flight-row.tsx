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

  // Get delay info
  const hasDelay = flight.status === 'DELAY' && flight.delay_minutes > 0
  const newTime = hasDelay
    ? format(new Date(new Date(scheduledTime).getTime() + flight.delay_minutes * 60000), 'HH:mm')
    : null

  // Status indicator
  const getStatusConfig = (status: FlightStatus) => {
    switch (status) {
      case 'ON_TIME':
        return { color: 'bg-[#22c55e]', icon: null, label: '' }
      case 'DELAY':
        return { color: 'bg-[#f59e0b]', icon: Clock, label: 'DLY' }
      case 'GATE_CHANGE':
        return { color: 'bg-[#3b82f6]', icon: ArrowRightLeft, label: 'CHG' }
      case 'CANCELED':
        return { color: 'bg-[#ef4444]', icon: Ban, label: 'CNL' }
      case 'BOARDING':
        return { color: 'bg-[#22c55e] animate-pulse', icon: null, label: 'BRD' }
      case 'DEPARTED':
        return { color: 'bg-zinc-600', icon: null, label: 'DEP' }
      case 'ARRIVED':
        return { color: 'bg-zinc-600', icon: null, label: 'ARR' }
      default:
        return { color: 'bg-zinc-600', icon: null, label: '' }
    }
  }

  const statusConfig = getStatusConfig(flight.status)

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
    <div className="bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-colors">
      <div className="px-3 py-3 grid grid-cols-12 gap-1 items-center">
        {/* Time - Editable */}
        <div className="col-span-2">
          {editField === 'time' ? (
            <div className="flex items-center gap-1">
              <Input
                value={editValue}
                onChange={(e) => handleTimeInput(e.target.value)}
                className="w-14 h-7 text-xs px-1 bg-[#1a1a1a] border-[#E91E8C]"
                maxLength={5}
                autoFocus
              />
              <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e]">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancelEdit} className="text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit('time', displayTime)}
              className="text-left hover:text-[#E91E8C] transition-colors"
            >
              <span className={`text-base font-bold font-mono ${hasDelay ? 'text-zinc-500 line-through' : 'text-[#fafafa]'}`}>
                {displayTime}
              </span>
              {newTime && (
                <span className="block text-xs font-mono text-[#f59e0b]">
                  {newTime}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Flight Number - Editable */}
        <div className="col-span-3">
          {editField === 'flight' ? (
            <div className="flex items-center gap-1">
              <span className="text-[#E91E8C] text-xs font-bold">VOI</span>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-12 h-7 text-xs px-1 bg-[#1a1a1a] border-[#E91E8C]"
                maxLength={4}
                autoFocus
              />
              <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e]">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit('flight', flight.flight_number.replace('VOI', ''))}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#E91E8C] text-white text-[10px] font-bold mr-1">
                VOI
              </span>
              <span className="text-sm font-bold text-[#fafafa] font-mono">
                {flight.flight_number.replace('VOI', '')}
              </span>
            </button>
          )}
        </div>

        {/* Destination/Origin */}
        <div className="col-span-4">
          <p className="text-sm font-medium text-[#fafafa] truncate">
            {displayCity}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono">
            {displayCode}
          </p>
        </div>

        {/* Gate - Editable */}
        <div className="col-span-2">
          {editField === 'gate' ? (
            <div className="flex items-center gap-1">
              {gateOptions.length > 0 ? (
                <Select value={editValue} onValueChange={setEditValue}>
                  <SelectTrigger className="w-14 h-7 text-xs bg-[#1a1a1a] border-[#E91E8C]">
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
                  className="w-12 h-7 text-xs px-1 bg-[#1a1a1a] border-[#E91E8C]"
                  maxLength={4}
                  autoFocus
                />
              )}
              <button onClick={saveEdit} disabled={isSubmitting} className="text-[#22c55e]">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit('gate', flight.gate || '')}
              className="text-sm font-bold font-mono text-[#00ffff] hover:text-[#00ffff]/80 transition-colors"
            >
              {flight.gate || '-'}
            </button>
          )}
        </div>

        {/* Status - Editable */}
        <div className="col-span-1 flex justify-center">
          {editField === 'status' ? (
            <StatusEditor
              currentStatus={flight.status}
              onSave={saveStatus}
              onCancel={cancelEdit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <button
              onClick={() => setEditField('status')}
              className="relative group"
            >
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              {statusConfig.label && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {statusConfig.label}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Delay/Gate change info row */}
      {(flight.status === 'DELAY' || flight.status === 'GATE_CHANGE') && flight.delay_reason && (
        <div className="px-3 pb-2 -mt-1">
          <p className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded inline-block">
            {flight.delay_reason}
          </p>
        </div>
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
  const [delayMinutes, setDelayMinutes] = useState(0)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
      <div className="bg-[#141414] w-full max-w-md rounded-t-2xl p-4 pb-8 space-y-4 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#fafafa]">Actualizar Status</h3>
          <button onClick={onCancel} className="text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

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

        {/* Delay minutes input */}
        {status === 'DELAY' && (
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Minutos de demora</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    delayMinutes === mins
                      ? 'bg-[#f59e0b] text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onSave(status, status === 'DELAY' ? delayMinutes : undefined)}
          disabled={isSubmitting || (status === 'DELAY' && delayMinutes === 0)}
          className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-bold"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
