'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Edit3, Check, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/shared/components/ui/input'
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
const EXCHANGE_AIRPORTS: Record<string, { locations: { key: string; label: string }[] }> = {
  MEX: {
    locations: [
      { key: 'terminal', label: 'Adentro Terminal' },
    ],
  },
  TIJ: {
    locations: [
      { key: 'terminal', label: 'Adentro Terminal' },
      { key: 'entrada', label: 'Entrada Terminal' },
    ],
  },
}

export function ExchangeRate({ airportCode }: ExchangeRateProps) {
  const [rates, setRates] = useState<ExchangeRateData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editField, setEditField] = useState<'buy' | 'sell' | null>(null)
  const [editValue, setEditValue] = useState('')

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

  const startEdit = (rate: ExchangeRateData, field: 'buy' | 'sell') => {
    setEditingId(rate.id)
    setEditField(field)
    const currentValue = field === 'buy' ? rate.buy_rate : rate.sell_rate
    setEditValue(currentValue > 0 ? currentValue.toFixed(3) : '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditField(null)
    setEditValue('')
  }

  const saveEdit = async (rate: ExchangeRateData) => {
    const newRate = parseFloat(editValue)
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Ingresa un tipo de cambio válido')
      return
    }

    const updateField = editField === 'buy' ? 'buy_rate' : 'sell_rate'

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userName = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Anónimo'

      if (rate.id.startsWith('local-')) {
        const { error } = await (supabase as any).from('exchange_rates').upsert({
          airport_code: airportCode,
          location: rate.location,
          [updateField]: newRate,
          updated_by_name: userName,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from('exchange_rates')
          .update({
            [updateField]: newRate,
            updated_by_name: userName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rate.id)
        if (error) throw error
      }

      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, [updateField]: newRate, updated_by_name: userName, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado')
      cancelEdit()
    } catch {
      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, [updateField]: newRate, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado (local)')
      cancelEdit()
    }
  }

  const handleInputChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    if (parts[1]?.length > 3) return
    setEditValue(cleaned)
  }

  const getLocationLabel = (locationKey: string) => {
    return config.locations.find(l => l.key === locationKey)?.label || locationKey
  }

  // Get the most recent update info
  const mostRecentUpdate = rates
    .filter(r => r.buy_rate > 0 || r.sell_rate > 0)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]

  if (isLoading) {
    return (
      <div className="bg-[#0f1a0f] border border-[#22c55e]/20 rounded-xl p-3 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-2" />
        <div className="h-8 bg-zinc-800 rounded w-full" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#0a1a0a] to-[#0a0a0a] border border-[#22c55e]/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-[#22c55e]/10 border-b border-[#22c55e]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#22c55e]" />
          <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider">
            Tipo de Cambio USD
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#22c55e]/10 rounded-full">
          <Users className="w-3 h-3 text-[#22c55e]" />
          <span className="text-[10px] text-[#22c55e] font-medium">colaborativo</span>
        </div>
      </div>

      {/* Rates Grid */}
      <div className="divide-y divide-zinc-800/50">
        {rates.map((rate) => (
          <div key={rate.id} className="px-3 py-2.5">
            {/* Location row with BUY and SELL */}
            <div className="flex items-center gap-3">
              {/* BUY */}
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-[#ef4444] uppercase">BUY</span>
                {editingId === rate.id && editField === 'buy' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">$</span>
                    <Input
                      value={editValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="00.000"
                      className="w-16 h-7 text-xs text-center bg-[#1a1a1a] border-[#22c55e] text-[#fafafa] px-1"
                      inputMode="decimal"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(rate)}
                      className="p-1 text-[#22c55e] hover:bg-[#22c55e]/10 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-zinc-500 hover:bg-zinc-800 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(rate, 'buy')}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/50 transition-colors group"
                  >
                    {rate.buy_rate > 0 ? (
                      <span className="text-sm font-bold text-[#fafafa] font-mono">
                        ${rate.buy_rate.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">$00.000</span>
                    )}
                    <Edit3 className="w-2.5 h-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* SELL */}
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-[#ef4444] uppercase">SELL</span>
                {editingId === rate.id && editField === 'sell' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">$</span>
                    <Input
                      value={editValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="00.000"
                      className="w-16 h-7 text-xs text-center bg-[#1a1a1a] border-[#22c55e] text-[#fafafa] px-1"
                      inputMode="decimal"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(rate)}
                      className="p-1 text-[#22c55e] hover:bg-[#22c55e]/10 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-zinc-500 hover:bg-zinc-800 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(rate, 'sell')}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/50 transition-colors group"
                  >
                    {rate.sell_rate > 0 ? (
                      <span className="text-sm font-bold text-[#fafafa] font-mono">
                        ${rate.sell_rate.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">$00.000</span>
                    )}
                    <Edit3 className="w-2.5 h-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Location label */}
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] text-zinc-500 italic">
                  {getLocationLabel(rate.location)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last update info */}
      {mostRecentUpdate && (
        <div className="px-3 py-2 bg-zinc-900/50 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-500 text-center">
            Última actualización:{' '}
            <span className="text-zinc-400">
              {format(new Date(mostRecentUpdate.updated_at), "d MMM HH:mm", { locale: es })}
            </span>
            {mostRecentUpdate.updated_by_name && (
              <>
                {' • por '}
                <span className="text-[#22c55e]">{mostRecentUpdate.updated_by_name}</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
