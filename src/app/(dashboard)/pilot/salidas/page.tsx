'use client'

import { Clock, Plane, Search, RefreshCw } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

export default function SalidasPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#fafafa]">Salidas</h1>
            <p className="text-[#71717a] text-sm mt-1">Información de vuelos en tiempo real</p>
          </div>
          <Button variant="ghost" size="icon" className="text-[#71717a]">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <Input
            placeholder="Buscar vuelo (ej: VIV101, AM001)"
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button className="px-4 py-2 rounded-full bg-[#0066CC] text-white text-sm whitespace-nowrap">
            Todos
          </button>
          <button className="px-4 py-2 rounded-full bg-[#141414] text-[#71717a] border border-[#27272a] text-sm whitespace-nowrap hover:border-[#3f3f46]">
            En tiempo
          </button>
          <button className="px-4 py-2 rounded-full bg-[#141414] text-[#71717a] border border-[#27272a] text-sm whitespace-nowrap hover:border-[#3f3f46]">
            Demorados
          </button>
          <button className="px-4 py-2 rounded-full bg-[#141414] text-[#71717a] border border-[#27272a] text-sm whitespace-nowrap hover:border-[#3f3f46]">
            Cancelados
          </button>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#27272a] flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-[#71717a]" />
          </div>
          <h3 className="text-[#fafafa] font-medium mb-2">Sin vuelos</h3>
          <p className="text-sm text-[#71717a] mb-4">
            La información de salidas estará disponible pronto
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#71717a]">
            <Clock className="w-3 h-3" />
            <span>Última actualización: --:--</span>
          </div>
        </div>
      </div>
    </div>
  )
}
