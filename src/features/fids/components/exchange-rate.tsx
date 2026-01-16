'use client'

import { useState, useEffect } from 'react'
import { DollarSign, MapPin, Edit3, Check, X, Users } from 'lucide-react'
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
  rate: number
  updated_by: string | null
  updated_at: string
}

// Airports with exchange rate display
const EXCHANGE_AIRPORTS: Record<string, { locations: string[] }> = {
  MEX: {
    locations: ['Terminal'],
  },
  TIJ: {
    locations: ['Sala de espera', 'Entrada aeropuerto'],
  },
}

export function ExchangeRate({ airportCode }: ExchangeRateProps) {
  const [rates, setRates] = useState<ExchangeRateData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const config = EXCHANGE_AIRPORTS[airportCode]

  // Don't render if airport doesn't have exchange rate
  if (!config) return null

  // Load exchange rates
  useEffect(() => {
    loadRates()
    // Subscribe to realtime updates
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
  }, [airportCode])

  const loadRates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('airport_code', airportCode)
        .order('location')

      if (error) throw error

      // If no rates exist, create default ones
      if (!data || data.length === 0) {
        const defaultRates = config.locations.map((location) => ({
          airport_code: airportCode,
          location,
          rate: 0,
        }))

        const { data: newRates, error: insertError } = await supabase
          .from('exchange_rates')
          .insert(defaultRates)
          .select()

        if (insertError) {
          // Table might not exist, use local state
          setRates(
            config.locations.map((location, i) => ({
              id: `local-${i}`,
              airport_code: airportCode,
              location,
              rate: 0,
              updated_by: null,
              updated_at: new Date().toISOString(),
            }))
          )
        } else {
          setRates(newRates || [])
        }
      } else {
        setRates(data)
      }
    } catch (error) {
      // Fallback to local state if table doesn't exist
      setRates(
        config.locations.map((location, i) => ({
          id: `local-${i}`,
          airport_code: airportCode,
          location,
          rate: 0,
          updated_by: null,
          updated_at: new Date().toISOString(),
        }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (rate: ExchangeRateData) => {
    setEditingId(rate.id)
    setEditValue(rate.rate > 0 ? rate.rate.toFixed(2) : '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (rate: ExchangeRateData) => {
    const newRate = parseFloat(editValue)
    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Ingresa un tipo de cambio válido')
      return
    }

    try {
      // If it's a local ID, we need to create the record
      if (rate.id.startsWith('local-')) {
        // Try to upsert
        const supabase = createClient()
        const { error } = await supabase.from('exchange_rates').upsert({
          airport_code: airportCode,
          location: rate.location,
          rate: newRate,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      } else {
        const supabase = createClient()
        const { error } = await supabase
          .from('exchange_rates')
          .update({
            rate: newRate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rate.id)

        if (error) throw error
      }

      // Update local state
      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, rate: newRate, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado')
      cancelEdit()
    } catch (error) {
      // Update local state anyway for offline support
      setRates((prev) =>
        prev.map((r) =>
          r.id === rate.id
            ? { ...r, rate: newRate, updated_at: new Date().toISOString() }
            : r
        )
      )
      toast.success('Tipo de cambio actualizado (local)')
      cancelEdit()
    }
  }

  const handleInputChange = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) return
    if (parts[1]?.length > 2) return
    setEditValue(cleaned)
  }

  if (isLoading) {
    return (
      <div className="bg-[#0f1a0f] border border-[#22c55e]/20 rounded-xl p-3 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
        <div className="h-6 bg-zinc-800 rounded w-16" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[#0f1a0f] to-[#0a0a0a] border border-[#22c55e]/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-[#22c55e]/10 border-b border-[#22c55e]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#22c55e]" />
          <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider">
            Tipo de Cambio USD
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Users className="w-3 h-3" />
          <span>Colaborativo</span>
        </div>
      </div>

      {/* Rates */}
      <div className="divide-y divide-zinc-800/50">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="px-3 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-400 truncate">
                {rate.location}
              </span>
            </div>

            {editingId === rate.id ? (
              <div className="flex items-center gap-1">
                <span className="text-sm text-zinc-500">$</span>
                <Input
                  value={editValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="20.50"
                  className="w-20 h-8 text-sm text-center bg-[#1a1a1a] border-[#22c55e] text-[#fafafa]"
                  inputMode="decimal"
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(rate)}
                  className="p-1.5 text-[#22c55e] hover:bg-[#22c55e]/10 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1.5 text-zinc-500 hover:bg-zinc-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit(rate)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-800/50 transition-colors group"
              >
                {rate.rate > 0 ? (
                  <>
                    <span className="text-lg font-bold text-[#22c55e] font-mono">
                      ${rate.rate.toFixed(2)}
                    </span>
                    <Edit3 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-zinc-600">Sin dato</span>
                    <Edit3 className="w-3 h-3 text-zinc-600" />
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Last update info */}
      {rates.some((r) => r.rate > 0) && (
        <div className="px-3 py-1.5 bg-zinc-900/50 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600 text-center">
            Actualizado por la comunidad •{' '}
            {format(
              new Date(
                Math.max(...rates.filter((r) => r.rate > 0).map((r) => new Date(r.updated_at).getTime()))
              ),
              "d MMM HH:mm",
              { locale: es }
            )}
          </p>
        </div>
      )}
    </div>
  )
}
