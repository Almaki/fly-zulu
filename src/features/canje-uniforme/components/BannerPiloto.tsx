'use client'

import { LogOut, User } from 'lucide-react'
import type { PilotoActual } from '../types'
import { BASE_LABELS } from '../types'

interface Props {
  piloto: PilotoActual
  misPubs: number
  onSalir: () => void
}

export function BannerPiloto({ piloto, misPubs, onSalir }: Props) {
  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-sky-100 p-2 rounded-full">
          <User className="text-sky-600" size={16} />
        </div>
        <div>
          <p className="text-slate-800 font-bold text-sm">{piloto.numero_rol}</p>
          <p className="text-slate-500 text-xs">
            {BASE_LABELS[piloto.base]} · {misPubs} {misPubs === 1 ? 'publicación' : 'publicaciones'}
          </p>
        </div>
      </div>
      <button
        onClick={onSalir}
        className="flex items-center gap-1 text-slate-400 hover:text-red-500 text-xs transition-colors p-1.5 rounded-lg hover:bg-red-50"
        title="Salir de la sesión"
      >
        <LogOut size={14} />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  )
}
