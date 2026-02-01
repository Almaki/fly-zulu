'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DollarSign, Users, Pencil } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { createClient } from '@/shared/lib/supabase'

interface ExchangeRateProps {
  airportCode: string
  onAllFieldsComplete?: () => void
}

interface ExchangeRateData {
  id: string
  airport_code: string
  location: string
  buy_rate: number
  sell_rate: number
  updated_by_name: string | null
  updated_at: string
}

// Airports with exchange rate display - with centered titles
const EXCHANGE_AIRPORTS: Record<string, { title: string; locations: { key: string; label: string; color: string }[] }> = {
  MEX: {
    title: 'Centro de Cambio CDMX',
    locations: [
      { key: 'toro_shop', label: 'Toro Shop', color: 'from-[#f59e0b] to-[#fbbf24]' },
      { key: 'gates', label: 'Gates', color: 'from-[#3b82f6] to-[#60a5fa]' },
    ],
  },
  TIJ: {
    title: 'Centro de Cambio Tijuana',
    locations: [
      { key: 'toro_shop', label: 'Toro Shop', color: 'from-[#f59e0b] to-[#fbbf24]' },
      { key: 'gates', label: 'Gates', color: 'from-[#3b82f6] to-[#60a5fa]' },
    ],
  },
}

// Compact rate input - Format: XX.XXX (decena, unidad, centavos)
interface RateInputProps {
  value: number
  onSave: (newValue: number) => void
  type: 'buy' | 'sell'
  isHighlighted?: boolean
}

function CompactRateInput({ value, onSave, type, isHighlighted }: RateInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', ''])
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value > 0 && !isEditing) {
      // Format: XX.XXX (5 digits total)
      const formatted = value.toFixed(3).replace('.', '')
      const paddedDigits = formatted.padStart(5, '0').slice(-5).split('')
      setDigits(paddedDigits)
    } else if (!isEditing) {
      setDigits(['0', '0', '0', '0', '0'])
    }
  }, [value, isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setDigits(['', '', '', '', ''])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 5)
    const newDigits = input.split('')
    while (newDigits.length < 5) {
      newDigits.unshift('')
    }
    setDigits(newDigits)

    if (input.length === 5) {
      const finalValue = parseFloat(input.slice(0, 2) + '.' + input.slice(2, 5))
      if (!isNaN(finalValue) && finalValue > 0) {
        onSave(finalValue)
        setIsEditing(false)
      }
    }
  }

  const handleBlur = () => {
    if (isEditing) {
      const fullInput = digits.join('')
      if (fullInput.length >= 5) {
        const finalValue = parseFloat(fullInput.slice(0, 2) + '.' + fullInput.slice(2, 5))
        if (!isNaN(finalValue) && finalValue > 0) {
          onSave(finalValue)
        }
      }
      setIsEditing(false)
    }
  }

  const color = type === 'buy' ? 'text-[#ef4444]' : 'text-[#22c55e]'

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center relative group w-full py-1"
    >
      {/* Rate display - centered */}
      <div className="flex items-center justify-center gap-1">
        <span className={`text-[10px] font-bold ${color}`}>
          {type === 'buy' ? 'C' : 'V'}
        </span>
        <span className={`text-lg font-mono font-bold transition-colors ${isHighlighted ? 'text-[#00ff88]' : 'text-[#fafafa]'}`}>
          {digits[0] || '0'}{digits[1] || '0'}.{digits[2] || '0'}{digits[3] || '0'}{digits[4] || '0'}
        </span>
      </div>
      {/* Edit hint - always visible */}
      <div className="flex items-center gap-1 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-2.5 h-2.5 text-zinc-400" />
        <span className="text-[8px] text-zinc-400">toca para editar</span>
      </div>
      {isEditing && (
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={digits.filter(d => d).join('')}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="absolute opacity-0 w-0 h-0"
          autoFocus
        />
      )}
    </button>
  )
}

export function ExchangeRate({ airportCode, onAllFieldsComplete }: ExchangeRateProps) {
  const [rates, setRates] = useState<ExchangeRateData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

  const config = EXCHANGE_AIRPORTS[airportCode]

  // Check if all fields are complete and trigger confetti
  const checkAllFieldsComplete = useCallback((currentRates: ExchangeRateData[]) => {
    const toroShop = currentRates.find(r => r.location === 'toro_shop')
    const gates = currentRates.find(r => r.location === 'gates')

    const allComplete =
      toroShop && toroShop.buy_rate > 0 && toroShop.sell_rate > 0 &&
      gates && gates.buy_rate > 0 && gates.sell_rate > 0

    if (allComplete && !hasTriggeredConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      toast.success('¡Gracias por actualizar los tipos de cambio! 🎉')
      setHasTriggeredConfetti(true)
      onAllFieldsComplete?.()
    }
  }, [hasTriggeredConfetti, onAllFieldsComplete])

  useEffect(() => {
    if (!config) {
      setIsLoading(false)
      return
    }

    loadRates()
    const supabase = createClient()
    const channel = supabase
      .channel('exchange_rates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates',
          filter: `airport_code=eq.${airportCode}`,
        },
        () => {
          loadRates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

    async function loadRates() {
      const fallbackRates = config!.locations.map((loc, i) => ({
        id: `local-${i}`,
        airport_code: airportCode,
        location: loc.key,
        buy_rate: 0,
        sell_rate: 0,
        updated_by_name: null,
        updated_at: new Date().toISOString(),
      }))

      try {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('exchange_rates')
          .select('*')
          .eq('airport_code', airportCode)
          .order('location')

        if (error) throw error

        if (!data || data.length === 0) {
          const defaultRates = config!.locations.map((loc) => ({
            airport_code: airportCode,
            location: loc.key,
            buy_rate: 0,
            sell_rate: 0,
          }))

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: newRates, error: insertError } = await (supabase as any)
            .from('exchange_rates')
            .insert(defaultRates)
            .select()

          if (insertError) {
            setRates(fallbackRates)
          } else {
            setRates(newRates || fallbackRates)
          }
        } else {
          setRates(data as ExchangeRateData[])
        }
      } catch {
        setRates(fallbackRates)
      } finally {
        setIsLoading(false)
      }
    }
  }, [airportCode, config])

  if (!config) return null

  const saveRate = async (rate: ExchangeRateData, field: 'buy' | 'sell', newValue: number) => {
    const updateField = field === 'buy' ? 'buy_rate' : 'sell_rate'

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userName = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Anónimo'

      if (rate.id.startsWith('local-')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('exchange_rates').upsert({
          airport_code: airportCode,
          location: rate.location,
          [updateField]: newValue,
          updated_by_name: userName,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('exchange_rates')
          .update({
            [updateField]: newValue,
            updated_by_name: userName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rate.id)
        if (error) throw error
      }

      const updatedRates = rates.map((r) =>
        r.id === rate.id
          ? { ...r, [updateField]: newValue, updated_by_name: userName, updated_at: new Date().toISOString() }
          : r
      )
      setRates(updatedRates)
      checkAllFieldsComplete(updatedRates)
      toast.success('Tipo de cambio actualizado')
    } catch {
      const updatedRates = rates.map((r) =>
        r.id === rate.id
          ? { ...r, [updateField]: newValue, updated_at: new Date().toISOString() }
          : r
      )
      setRates(updatedRates)
      checkAllFieldsComplete(updatedRates)
      toast.success('Tipo de cambio actualizado (local)')
    }
  }

  const getLocationConfig = (locationKey: string) => {
    return config.locations.find(l => l.key === locationKey)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 rounded animate-pulse">
        <div className="h-3 bg-zinc-800 rounded w-16" />
      </div>
    )
  }

  // Get the most recent update across all rates
  const lastUpdate = rates.reduce((latest, rate) => {
    const rateDate = new Date(rate.updated_at)
    return rateDate > latest.date ? { date: rateDate, by: rate.updated_by_name } : latest
  }, { date: new Date(0), by: null as string | null })

  const hasValidUpdate = lastUpdate.date.getTime() > 0 && rates.some(r => r.buy_rate > 0 || r.sell_rate > 0)

  // Get rates by location
  const toroShopRate = rates.find(r => r.location === 'toro_shop')
  const gatesRate = rates.find(r => r.location === 'gates')

  // Determine which location has the cheapest sell rate (best for customer)
  const getCheapestSellLocation = (): 'toro_shop' | 'gates' | null => {
    const toroSell = toroShopRate?.sell_rate || 0
    const gatesSell = gatesRate?.sell_rate || 0

    if (toroSell <= 0 && gatesSell <= 0) return null
    if (toroSell <= 0) return 'gates'
    if (gatesSell <= 0) return 'toro_shop'

    return toroSell < gatesSell ? 'toro_shop' : 'gates'
  }

  const cheapestLocation = getCheapestSellLocation()

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#22c55e]" />
          <span className="text-xs font-bold text-zinc-300">TIPO DE CAMBIO USD</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-[#f59e0b]" />
          <span className="text-[9px] text-[#f59e0b] font-medium">COLABORATIVO</span>
        </div>
      </div>

      {/* Two location cards stacked */}
      <div className="space-y-3">
        {/* Toro Shop Card */}
        <div className={`rounded-xl border ${
          cheapestLocation === 'toro_shop'
            ? 'animate-breathe-glow'
            : 'border-[#f59e0b]/20'
        } bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5`}>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h3 className="text-sm font-bold text-[#fbbf24]">Toro Shop</h3>
            {cheapestLocation === 'toro_shop' && (
              <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-medium">
                MEJOR PRECIO
              </span>
            )}
          </div>

          {toroShopRate && (
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {/* Compra */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Compra</span>
                <div className="bg-zinc-900/60 rounded-lg py-2 px-3">
                  <CompactRateInput
                    value={toroShopRate.buy_rate}
                    onSave={(val) => saveRate(toroShopRate, 'buy', val)}
                    type="buy"
                  />
                </div>
              </div>

              {/* Venta */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Venta</span>
                <div className={`rounded-lg py-2 px-3 transition-all ${
                  cheapestLocation === 'toro_shop'
                    ? 'bg-[#22c55e]/20 border border-[#22c55e]/40'
                    : 'bg-zinc-900/60'
                }`}>
                  <CompactRateInput
                    value={toroShopRate.sell_rate}
                    onSave={(val) => saveRate(toroShopRate, 'sell', val)}
                    type="sell"
                    isHighlighted={cheapestLocation === 'toro_shop'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gates Card */}
        <div className={`rounded-xl border ${
          cheapestLocation === 'gates'
            ? 'animate-breathe-glow'
            : 'border-[#3b82f6]/20'
        } bg-gradient-to-br from-[#3b82f6]/10 to-[#3b82f6]/5`}>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h3 className="text-sm font-bold text-[#60a5fa]">Gates</h3>
            {cheapestLocation === 'gates' && (
              <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-medium">
                MEJOR PRECIO
              </span>
            )}
          </div>

          {gatesRate && (
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {/* Compra */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Compra</span>
                <div className="bg-zinc-900/60 rounded-lg py-2 px-3">
                  <CompactRateInput
                    value={gatesRate.buy_rate}
                    onSave={(val) => saveRate(gatesRate, 'buy', val)}
                    type="buy"
                  />
                </div>
              </div>

              {/* Venta */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Venta</span>
                <div className={`rounded-lg py-2 px-3 transition-all ${
                  cheapestLocation === 'gates'
                    ? 'bg-[#22c55e]/20 border border-[#22c55e]/40'
                    : 'bg-zinc-900/60'
                }`}>
                  <CompactRateInput
                    value={gatesRate.sell_rate}
                    onSave={(val) => saveRate(gatesRate, 'sell', val)}
                    type="sell"
                    isHighlighted={cheapestLocation === 'gates'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last update info */}
      {hasValidUpdate && (
        <div className="mt-4 pt-3 border-t border-zinc-700/30 flex items-center justify-center gap-1">
          <span className="text-[10px] text-zinc-400">
            Actualizado {formatDistanceToNow(lastUpdate.date, { addSuffix: true, locale: es })}
            {lastUpdate.by && <span className="text-[#f59e0b]"> por {lastUpdate.by}</span>}
          </span>
        </div>
      )}
    </div>
  )
}
