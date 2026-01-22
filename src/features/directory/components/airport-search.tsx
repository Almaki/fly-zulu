'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, MapPin, Plane } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { searchAirports, type Airport } from '@/shared/constants/airports'
import { cn } from '@/shared/lib/utils'

interface AirportSearchProps {
  onSelect: (airport: Airport) => void
  placeholder?: string
  className?: string
}

export function AirportSearch({ onSelect, placeholder = 'Buscar aeropuerto, ciudad o código IATA...', className }: AirportSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.length >= 1) {
      const found = searchAirports(value)
      setResults(found)
      setIsOpen(found.length > 0)
      setHighlightIndex(-1)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [])

  const handleSelect = useCallback((airport: Airport) => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    onSelect(airport)
  }, [onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && results[highlightIndex]) {
          handleSelect(results[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightIndex(-1)
        break
    }
  }, [isOpen, highlightIndex, results, handleSelect])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-12 pr-4 h-14 text-base bg-[#141414] border-[#27272a] focus:border-[#22c55e] rounded-xl"
          autoComplete="off"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#141414] border border-[#27272a] rounded-xl shadow-xl overflow-hidden">
          {results.map((airport, index) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              className={cn(
                'w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-[#1f1f1f] last:border-0',
                index === highlightIndex
                  ? 'bg-[#22c55e]/10'
                  : 'hover:bg-[#1a1a1a]'
              )}
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-[#22c55e]/10">
                <Plane className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#22c55e] text-lg">{airport.code}</span>
                  <span className="text-[#fafafa] font-medium truncate">{airport.city}</span>
                  {airport.country && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                      {airport.country === 'MX' ? '🇲🇽' : '🇺🇸'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#71717a] mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{airport.state}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-[#141414] border border-[#27272a] rounded-xl text-center">
          <p className="text-[#71717a] text-sm">No se encontraron aeropuertos</p>
        </div>
      )}
    </div>
  )
}
