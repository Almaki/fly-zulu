'use client'

import { useState, useMemo } from 'react'
import { X, Plane, Clock, MapPin, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { searchAirports, getCityName, hasTerminals, getTerminalOptions, type Airport } from '../constants/airports'
import { createFlight } from '../services'
import type { FlightFormData } from '../types'

interface AddFlightSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  airportCode: string
  direction: 'departures' | 'arrivals'
  onFlightAdded: (flight: any) => void
}

export function AddFlightSheet({
  open,
  onOpenChange,
  airportCode,
  direction,
  onFlightAdded,
}: AddFlightSheetProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [time, setTime] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [destination, setDestination] = useState<Airport | null>(null)
  const [terminal, setTerminal] = useState('')
  const [gate, setGate] = useState('')

  // Search results for destination
  const destinationResults = useMemo(() => {
    if (!destinationQuery.trim() || destination) return []
    return searchAirports(destinationQuery, 5)
  }, [destinationQuery, destination])

  // Gate options based on terminal
  const gateOptions = useMemo(() => {
    if (hasTerminals(airportCode)) {
      const terminals = getTerminalOptions(airportCode)
      return terminals
    }
    return []
  }, [airportCode])

  // Reset form
  const resetForm = () => {
    setStep(1)
    setTime('')
    setFlightNumber('')
    setDestinationQuery('')
    setDestination(null)
    setTerminal('')
    setGate('')
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Handle time input
  const handleTimeInput = (value: string) => {
    let val = value.replace(/[^0-9]/g, '')
    if (val.length >= 2) {
      const hours = parseInt(val.slice(0, 2))
      if (hours > 23) val = '23' + val.slice(2)
      val = val.slice(0, 2) + ':' + val.slice(2)
    }
    if (val.length > 5) val = val.slice(0, 5)
    setTime(val)
  }

  // Handle destination select
  const handleSelectDestination = (airport: Airport) => {
    setDestination(airport)
    setDestinationQuery(airport.city)
  }

  // Clear destination
  const clearDestination = () => {
    setDestination(null)
    setDestinationQuery('')
  }

  // Submit flight
  const handleSubmit = async () => {
    if (!time || !flightNumber || !destination) {
      toast.error('Completa todos los campos')
      return
    }

    setIsSubmitting(true)
    try {
      // Build scheduled time
      const now = new Date()
      const [hours, minutes] = time.split(':').map(Number)
      const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)

      // If time is in the past, assume it's for tomorrow
      if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1)
      }

      // Calculate arrival time (estimate: +2 hours for domestic, +4 for international)
      const isDomestic = destination.country === 'México'
      const flightDuration = isDomestic ? 2 : 4
      const arrivalDate = new Date(scheduledDate.getTime() + flightDuration * 60 * 60 * 1000)

      const formData: FlightFormData = {
        flight_number: `VOI${flightNumber}`,
        airline: 'VOI',
        origin: direction === 'departures' ? airportCode : destination.code,
        destination: direction === 'departures' ? destination.code : airportCode,
        std: scheduledDate.toISOString(),
        sta: arrivalDate.toISOString(),
        gate: terminal ? `${terminal}${gate}` : gate || undefined,
      }

      const { data, error } = await createFlight(formData)

      if (error) throw new Error(error)

      onFlightAdded(data)
      handleClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar vuelo')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for each step
  const canProceed = () => {
    switch (step) {
      case 1: return time.length === 5
      case 2: return flightNumber.length >= 1
      case 3: return destination !== null
      case 4: return true // Gate is optional
      default: return false
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Sheet - Optimized for keyboard visibility */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[#27272a] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E91E8C]/20 flex items-center justify-center">
              <Plane className="w-4 h-4 text-[#E91E8C]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#fafafa]">Agregar Vuelo</h2>
              <p className="text-[10px] text-zinc-500">
                {direction === 'departures' ? 'Salida' : 'Llegada'} {airportCode}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Progress - Compact */}
        <div className="flex gap-1 px-4 py-2 flex-shrink-0">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-[#E91E8C]' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Step 1: Time */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fafafa]">¿A qué hora?</h3>
                  <p className="text-xs text-zinc-500">Hora de {direction === 'departures' ? 'salida' : 'llegada'} (24h)</p>
                </div>
              </div>

              <Input
                value={time}
                onChange={(e) => handleTimeInput(e.target.value)}
                placeholder="HH:MM"
                className="text-center text-3xl font-mono h-16 bg-[#141414] border-[#27272a] text-[#fafafa]"
                maxLength={5}
                inputMode="numeric"
                autoFocus
              />

              <p className="text-xs text-zinc-600 text-center">
                Ejemplo: 14:30 para las 2:30 PM
              </p>
            </div>
          )}

          {/* Step 2: Flight Number */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#E91E8C]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#E91E8C]">VOI</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fafafa]">Número de vuelo</h3>
                  <p className="text-xs text-zinc-500">Solo el número (sin VOI)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-4 bg-[#E91E8C] rounded-xl">
                  <span className="text-lg font-bold text-white">VOI</span>
                </div>
                <Input
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="text-center text-3xl font-mono h-14 bg-[#141414] border-[#27272a] text-[#fafafa]"
                  maxLength={4}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: Destination */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ffff]/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#00ffff]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fafafa]">
                    {direction === 'departures' ? 'Destino' : 'Origen'}
                  </h3>
                  <p className="text-xs text-zinc-500">Busca por código o ciudad</p>
                </div>
              </div>

              {destination ? (
                <div className="flex items-center justify-between p-4 bg-[#141414] border border-[#00ffff]/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono text-[#00ffff]">
                      {destination.code}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#fafafa]">{destination.city}</p>
                      <p className="text-xs text-zinc-500">{destination.country}</p>
                    </div>
                  </div>
                  <button onClick={clearDestination} className="p-2 hover:bg-zinc-800 rounded-lg">
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="MEX, Cancún, Miami..."
                    className="bg-[#141414] border-[#27272a] text-[#fafafa]"
                    autoFocus
                  />

                  {destinationResults.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {destinationResults.map((airport) => (
                        <button
                          key={airport.code}
                          onClick={() => handleSelectDestination(airport)}
                          className="w-full flex items-center gap-3 p-3 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors"
                        >
                          <span className="text-lg font-bold font-mono text-[#00ffff]">
                            {airport.code}
                          </span>
                          <div className="text-left">
                            <p className="text-sm text-[#fafafa]">{airport.city}</p>
                            <p className="text-xs text-zinc-500">{airport.country}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Gate */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#22c55e]">#</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fafafa]">Puerta de abordaje</h3>
                  <p className="text-xs text-zinc-500">Opcional - puedes agregarlo después</p>
                </div>
              </div>

              {gateOptions.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Terminal</label>
                    <div className="flex gap-2 flex-wrap">
                      {gateOptions.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTerminal(t)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            terminal === t
                              ? 'bg-[#22c55e] text-black'
                              : 'bg-[#141414] text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Número de puerta</label>
                    <Input
                      value={gate}
                      onChange={(e) => setGate(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="1-20"
                      className="text-center text-2xl font-mono h-14 bg-[#141414] border-[#27272a] text-[#fafafa]"
                      maxLength={2}
                    />
                  </div>

                  {terminal && gate && (
                    <p className="text-center text-lg font-mono text-[#22c55e]">
                      Puerta: {terminal}{gate}
                    </p>
                  )}
                </div>
              ) : (
                <Input
                  value={gate}
                  onChange={(e) => setGate(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="Ej: 12, A3, B5"
                  className="text-center text-2xl font-mono h-14 bg-[#141414] border-[#27272a] text-[#fafafa]"
                  maxLength={4}
                />
              )}
            </div>
          )}
        </div>

        {/* Summary preview */}
        {step === 4 && (
          <div className="px-4 pb-2">
            <div className="bg-[#141414] border border-[#27272a] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-mono text-zinc-400">{time}</span>
                <span className="px-2 py-0.5 bg-[#E91E8C] text-white text-xs font-bold rounded">
                  VOI{flightNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[#fafafa]">{airportCode}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-sm font-mono text-[#00ffff]">{destination?.code}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Always visible, above keyboard */}
        <div className="flex-shrink-0 bg-[#0a0a0a] border-t border-[#27272a] p-3 pb-safe">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-11 text-sm border-zinc-700"
              >
                Atrás
              </Button>
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 h-11 text-sm bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-bold disabled:opacity-50"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 text-sm bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold"
              >
                {isSubmitting ? 'Guardando...' : 'Agregar Vuelo'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
