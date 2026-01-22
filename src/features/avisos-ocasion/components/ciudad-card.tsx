'use client'

import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { CiudadCode } from '../types'
import { CIUDADES_INFO } from '../types'

interface CiudadCardProps {
  code: CiudadCode
  count?: number
  className?: string
}

// Colores por ciudad
const CIUDAD_COLORS: Record<CiudadCode, string> = {
  TIJ: 'from-[#06b6d4] to-[#0891b2]', // Cyan - frontera
  BJX: 'from-[#8b5cf6] to-[#7c3aed]', // Purple - bajío
  GDL: 'from-[#f59e0b] to-[#d97706]', // Amber - guadalajara
  MTY: 'from-[#22c55e] to-[#16a34a]', // Green - monterrey
  MEX: 'from-[#ef4444] to-[#dc2626]', // Red - cdmx
  CUN: 'from-[#0ea5e9] to-[#0284c7]', // Sky - cancun/caribe
}

export function CiudadCard({ code, count = 0, className }: CiudadCardProps) {
  const info = CIUDADES_INFO[code]

  return (
    <Link
      href={`/aviso-ocasion/${code.toLowerCase()}`}
      className={cn(
        'group block relative overflow-hidden rounded-xl border border-[#27272a] bg-[#141414] transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#1a1a1a] active:scale-[0.98]',
        className
      )}
    >
      {/* Gradient accent */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', CIUDAD_COLORS[code])} />

      <div className="p-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg bg-gradient-to-br shadow-md', CIUDAD_COLORS[code])}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#fafafa] text-lg">{code}</h3>
              <p className="text-xs text-[#71717a]">{info.city}, {info.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#E91E8C]/20 text-[#E91E8C] text-xs font-medium">
                {count} {count === 1 ? 'aviso' : 'avisos'}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-[#3f3f46] group-hover:text-[#71717a] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}
