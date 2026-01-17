'use client'

import { MapPin, Search, Hotel, Car, Utensils, Wrench } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

const categories = [
  { id: 'hotel', label: 'Hoteles', icon: Hotel, count: 0 },
  { id: 'transporte', label: 'Transporte', icon: Car, count: 0 },
  { id: 'comida', label: 'Comida', icon: Utensils, count: 0 },
  { id: 'servicios', label: 'Servicios', icon: Wrench, count: 0 },
]

export default function DirectorioPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <h1 className="text-2xl font-bold text-[#fafafa]">Directorio</h1>
          <p className="text-[#71717a] text-sm mt-1">Encuentra servicios por aeropuerto</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <Input
            placeholder="Buscar aeropuerto (ej: MEX, GDL, CUN)"
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#27272a] bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="p-3 rounded-full bg-[#22c55e]/10">
                  <Icon className="w-5 h-5 text-[#22c55e]" />
                </div>
                <span className="text-sm text-[#fafafa]">{cat.label}</span>
                <span className="text-xs text-[#71717a]">{cat.count} lugares</span>
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#27272a] flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#71717a]" />
          </div>
          <h3 className="text-[#fafafa] font-medium mb-2">Sin datos aún</h3>
          <p className="text-sm text-[#71717a]">
            El directorio de servicios estará disponible pronto
          </p>
        </div>
      </div>
    </div>
  )
}
