'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

export interface AddressResult {
  address: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  value?: string
  onChange: (result: AddressResult | null) => void
  placeholder?: string
  className?: string
  ciudadCode?: string // Para filtrar resultados por ciudad
}

interface Prediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export function AddressAutocomplete({
  value = '',
  onChange,
  placeholder = 'Buscar dirección...',
  className,
  ciudadCode
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Get city bias for better results
  const getCityBias = () => {
    const cityBounds: Record<string, { lat: number; lng: number }> = {
      TIJ: { lat: 32.5149, lng: -117.0382 },
      BJX: { lat: 21.0190, lng: -101.6866 },
      GDL: { lat: 20.6597, lng: -103.3496 },
      MTY: { lat: 25.6866, lng: -100.3161 },
      MEX: { lat: 19.4326, lng: -99.1332 },
      CUN: { lat: 21.1619, lng: -86.8515 },
    }
    return ciudadCode ? cityBounds[ciudadCode] : null
  }

  const searchAddress = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      // Use Google Places Autocomplete API
      // Note: This requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        // Fallback: just store the text as-is
        setPredictions([{
          place_id: 'manual',
          description: input,
          structured_formatting: {
            main_text: input,
            secondary_text: 'Dirección manual'
          }
        }])
        setIsOpen(true)
        setIsLoading(false)
        return
      }

      const cityBias = getCityBias()
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&language=es&components=country:mx|country:us`

      if (cityBias) {
        url += `&location=${cityBias.lat},${cityBias.lng}&radius=50000`
      }

      // Use a server-side API route to avoid CORS
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}&ciudad=${ciudadCode || ''}`)

      if (response.ok) {
        const data = await response.json()
        setPredictions(data.predictions || [])
        setIsOpen(data.predictions?.length > 0)
      }
    } catch (error) {
      console.error('Address search error:', error)
      // Fallback to manual entry
      setPredictions([{
        place_id: 'manual',
        description: input,
        structured_formatting: {
          main_text: input,
          secondary_text: 'Usar esta dirección'
        }
      }])
      setIsOpen(true)
    }

    setIsLoading(false)
  }, [ciudadCode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(value)
    }, 300)
  }

  const handleSelect = async (prediction: Prediction) => {
    setQuery(prediction.description)
    setIsOpen(false)
    setPredictions([])

    // If manual entry, just use the text
    if (prediction.place_id === 'manual') {
      onChange({
        address: prediction.description,
        lat: 0,
        lng: 0
      })
      return
    }

    // Get place details for coordinates
    try {
      const response = await fetch(`/api/places/details?place_id=${prediction.place_id}`)

      if (response.ok) {
        const data = await response.json()
        onChange({
          address: prediction.description,
          lat: data.lat || 0,
          lng: data.lng || 0
        })
      } else {
        onChange({
          address: prediction.description,
          lat: 0,
          lng: 0
        })
      }
    } catch {
      onChange({
        address: prediction.description,
        lat: 0,
        lng: 0
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(prev => Math.min(prev + 1, predictions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && predictions[highlightIndex]) {
          handleSelect(predictions[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync external value
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-[#141414] border-[#27272a]"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#141414] border border-[#27272a] rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className={cn(
                'w-full flex items-start gap-2 p-3 text-left transition-colors border-b border-[#1f1f1f] last:border-0',
                index === highlightIndex ? 'bg-[#22c55e]/10' : 'hover:bg-[#1a1a1a]'
              )}
            >
              <MapPin className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[#fafafa] truncate">
                  {prediction.structured_formatting.main_text}
                </p>
                <p className="text-xs text-[#71717a] truncate">
                  {prediction.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
