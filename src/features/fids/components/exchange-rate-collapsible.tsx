'use client'

import { useState } from 'react'
import { DollarSign, ChevronDown } from 'lucide-react'
import { ExchangeRate } from './exchange-rate'

interface ExchangeRateCollapsibleProps {
  airportCode: string
}

export function ExchangeRateCollapsible({ airportCode }: ExchangeRateCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#27272a] bg-[#141414] transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4ade80] shadow-md">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-[#fafafa] text-base">Tipo de Cambio</h3>
          <span className="text-[10px] text-[#71717a]">USD/MXN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30">
            Colaborativo
          </span>
          <ChevronDown className={`w-4 h-4 text-[#71717a] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#27272a]">
          <ExchangeRate airportCode={airportCode} />
        </div>
      )}
    </div>
  )
}
