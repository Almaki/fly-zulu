'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign, Users, Pencil } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/shared/lib/supabase'

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
const EXCHANGE_AIRPORTS: Record<string, { locations: { key: string; label: string }[] }> = {
  MEX: {
    locations: [
      { key: 'terminal', label: 'DENTRO TERMINAL' },
    ],
  },
  TIJ: {
    locations: [
      { key: 'terminal', label: 'DENTRO TERMINAL' },
      { key: 'entrada', label: 'ENTRADA' },
    ],
  },
}

// Compact rate input
interface RateInputProps {
  value: number
  onSave: (newValue: number) => void
  type: 'buy' | 'sell'
}

function CompactRateInput({ value, onSave, type }: RateInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
    while (newDigits.length < 4) {
      newDigits.unshift('')
    }
    setDigits(newDigits)

    if (input.length === 4) {
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

  const color = type === 'buy' ? 'text-[#ef4444]' : 'text-[#22c55e]'

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-0.5 relative group"
    >
      <span className={`text-[10px] font-bold ${color} mr-0.5`}>
        {type === 'buy' ? 'C' : 'V'}
      </span>
      <span className="text-sm font-mono font-bold text-[#fafafa]">
        {digits[0] || '0'}{digits[1] || '0'}.{digits[2] || '0'}{digits[3] || '0'}
      </span>
      <Pencil className="w-2.5 h-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
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

  return (
    <div className="px-3 py-2 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
      {/* Row 1: Header with USD icon and colaborativo badge */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-[#22c55e]" />
          <span className="text-[10px] font-bold text-zinc-400">TIPO DE CAMBIO USD</span>
        </div>
        <button className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          <Users className="w-3 h-3 text-[#f59e0b]" />
          <span className="text-[8px] text-[#f59e0b] font-medium">COLAB</span>
        </button>
      </div>

      {/* Row 2: Rates by Location - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {rates.map((rate) => {
          const locConfig = getLocationConfig(rate.location)
          return (
            <div key={rate.id} className="flex items-center justify-between bg-zinc-900/50 rounded px-2 py-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase truncate mr-2">
                {locConfig?.label}
              </span>
              <div className="flex items-center gap-3">
                <CompactRateInput
                  value={rate.buy_rate}
                  onSave={(val) => saveRate(rate, 'buy', val)}
                  type="buy"
                />
                <CompactRateInput
                  value={rate.sell_rate}
                  onSave={(val) => saveRate(rate, 'sell', val)}
                  type="sell"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Row 3: Last update info */}
      {hasValidUpdate && (
        <div className="mt-1.5 pt-1.5 border-t border-zinc-700/30 flex items-center justify-end gap-1">
          <span className="text-[8px] text-zinc-600">
            Actualizado {formatDistanceToNow(lastUpdate.date, { addSuffix: true, locale: es })}
            {lastUpdate.by && ` por ${lastUpdate.by}`}
          </span>
        </div>
      )}
    </div>
  )
}
