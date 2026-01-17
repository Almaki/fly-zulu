'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/shared/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ExchangeRateProps {
  airportCode: string
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

// Airports with exchange rate display
const EXCHANGE_AIRPORTS: Record<string, { locations: { key: string; label: string; bgColor: string }[] }> = {
  MEX: {
    locations: [
      { key: 'terminal', label: 'Adentro Terminal', bgColor: 'bg-[#1a2520]' },
    ],
  },
  TIJ: {
    locations: [
      { key: 'terminal', label: 'Adentro Terminal', bgColor: 'bg-[#1a2520]' },
      { key: 'entrada', label: 'Entrada', bgColor: 'bg-[#201a1a]' },
    ],
  },
}

// Component for 4-digit rate input (XX.XX format)
interface RateInputProps {
  value: number
  onSave: (newValue: number) => void
  label: 'BUY' | 'SELL'
}

function RateInput({ value, onSave, label }: RateInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Convert number to 4 digits (e.g., 19.85 -> ['1','9','8','5'])
  useEffect(() => {
    if (value > 0 && !isEditing) {
      const formatted = value.toFixed(2).replace('.', '')
      const paddedDigits = formatted.padStart(4, '0').slice(-4).split('')
      setDigits(paddedDigits)
    } else if (!isEditing) {
      setDigits(['0', '0', '0', '0'])
    }
  }, [value, isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setDigits(['', '', '', ''])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 4)
    const newDigits = input.split('')
    // Pad with empty strings at the start
    while (newDigits.length < 4) {
      newDigits.unshift('')
    }
    setDigits(newDigits)

    // Auto-save when 4 digits entered
    if (input.length === 4) {
      const numValue = parseInt(input.slice(0, 2) + '.' + input.slice(2, 4), 10)
      const finalValue = parseFloat(input.slice(0, 2) + '.' + input.slice(2, 4))
      if (!isNaN(finalValue) && finalValue > 0) {
        onSave(finalValue)
        setIsEditing(false)
      }
    }
  }

  const handleBlur = () => {
    if (isEditing) {
      const fullInput = digits.join('')
      if (fullInput.length >= 4) {
        const finalValue = parseFloat(fullInput.slice(0, 2) + '.' + fullInput.slice(2, 4))
        if (!isNaN(finalValue) && finalValue > 0) {
          onSave(finalValue)
        }
      }
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <span className={`text-[9px] font-bold uppercase mb-1 ${label === 'BUY' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
        {label}
      </span>
      <button
        onClick={handleClick}
        className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-zinc-700 hover:border-zinc-500 transition-colors"
      >
        {/* Fixed $ */}
        <span className="text-lg font-bold text-[#71717a]">$</span>

        {/* Digit boxes */}
        <div className="flex items-center">
          {/* First 2 digits (tens, units) */}
          <span className={`text-xl font-bold font-mono min-w-[14px] text-center ${digits[0] ? 'text-[#fafafa]' : 'text-zinc-600'}`}>
            {digits[0] || '0'}
          </span>
          <span className={`text-xl font-bold font-mono min-w-[14px] text-center ${digits[1] ? 'text-[#fafafa]' : 'text-zinc-600'}`}>
            {digits[1] || '0'}
          </span>

          {/* Fixed . in color */}
          <span className="text-xl font-bold text-[#f59e0b] mx-0.5">.</span>

          {/* Last 2 digits (decimals) */}
          <span className={`text-xl font-bold font-mono min-w-[14px] text-center ${digits[2] ? 'text-[#fafafa]' : 'text-zinc-600'}`}>
            {digits[2] || '0'}
          </span>
          <span className={`text-xl font-bold font-mono min-w-[14px] text-center ${digits[3] ? 'text-[#fafafa]' : 'text-zinc-600'}`}>
            {digits[3] || '0'}
          </span>
        </div>

        {/* Hidden input for mobile keyboard */}
        {isEditing && (
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={digits.filter(d => d).join('')}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0"
            autoFocus
          />
        )}
      </button>
    </div>
  )
}

export function ExchangeRate({ airportCode }: ExchangeRateProps) {
  const [rates, setRates] = useState<ExchangeRateData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const config = EXCHANGE_AIRPORTS[airportCode]

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
        const { error } = await (supabase as any).from('exchange_rates').upsert({
          airport_code: airportCode,
          location: rate.location,
          [updateField]: newValue,
          updated_by_name: userName,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      } else {
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

      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, [updateField]: newValue, updated_by_name: userName, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado')
    } catch {
      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, [updateField]: newValue, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado (local)')
    }
  }

  const getLocationConfig = (locationKey: string) => {
    return config.locations.find(l => l.key === locationKey)
  }

  // Get the most recent update info
  const mostRecentUpdate = rates
    .filter(r => r.buy_rate > 0 || r.sell_rate > 0)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]

  if (isLoading) {
    return (
      <div className="bg-[#0f1a0f] border border-[#22c55e]/20 rounded-lg p-2 animate-pulse">
        <div className="h-3 bg-zinc-800 rounded w-24 mb-2" />
        <div className="h-10 bg-zinc-800 rounded w-full" />
      </div>
    )
  }

  return (
    <div className="border border-[#22c55e]/30 rounded-lg overflow-hidden">
      {/* Compact Header */}
      <div className="px-2 py-1.5 bg-[#22c55e]/10 border-b border-[#22c55e]/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-[#22c55e]" />
          <span className="text-[10px] font-bold text-[#22c55e] uppercase">
            USD {airportCode}
          </span>
        </div>
        <button className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 transition-colors">
          <Users className="w-2.5 h-2.5 text-[#f59e0b]" />
          <span className="text-[9px] text-[#f59e0b] font-medium">colaborativo</span>
        </button>
      </div>

      {/* Rates by Location */}
      {rates.map((rate) => {
        const locConfig = getLocationConfig(rate.location)
        return (
          <div
            key={rate.id}
            className={`px-2 py-2 ${locConfig?.bgColor || 'bg-[#141414]'} border-b border-zinc-800/30 last:border-b-0`}
          >
            {/* Location label */}
            <p className="text-[9px] text-zinc-500 text-center mb-1.5 uppercase tracking-wider">
              {locConfig?.label}
            </p>

            {/* BUY and SELL inputs */}
            <div className="flex justify-center gap-4">
              <RateInput
                value={rate.buy_rate}
                onSave={(val) => saveRate(rate, 'buy', val)}
                label="BUY"
              />
              <RateInput
                value={rate.sell_rate}
                onSave={(val) => saveRate(rate, 'sell', val)}
                label="SELL"
              />
            </div>
          </div>
        )
      })}

      {/* Last update info - compact */}
      {mostRecentUpdate && (
        <div className="px-2 py-1 bg-zinc-900/50">
          <p className="text-[9px] text-zinc-500 text-center">
            {format(new Date(mostRecentUpdate.updated_at), "d/M HH:mm", { locale: es })}
            {mostRecentUpdate.updated_by_name && (
              <span className="text-[#22c55e]"> • {mostRecentUpdate.updated_by_name}</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
