'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import type { Base, PilotoActual } from '../types'
import { BASES, BASE_LABELS } from '../types'

interface Props {
  onEntrar: (piloto: PilotoActual) => void
}

export function EntradaPiloto({ onEntrar }: Props) {
  const [rol, setRol] = useState('')
  const [base, setBase] = useState<Base | ''>('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rol.trim()) { setError('Ingresa tu Número de Rol'); return }
    if (!base) { setError('Selecciona tu base'); return }
    setError('')
    onEntrar({ numero_rol: rol.trim().toUpperCase(), base: base as Base })
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-sky-100 p-2 rounded-full">
          <LogIn className="text-sky-600" size={18} />
        </div>
        <h2 className="text-slate-700 font-bold text-base">Identifícate para continuar</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Número de Rol */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">
            Número de Rol
          </label>
          <input
            type="text"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            placeholder="Ej: 12345"
            maxLength={20}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-slate-50 placeholder-slate-400"
          />
        </div>

        {/* Base */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">
            Base de asignación
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BASES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBase(b)}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                  base === b
                    ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          {base && (
            <p className="text-xs text-slate-400 mt-1 ml-1">{BASE_LABELS[base as Base]}</p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm shadow-sky-200 text-sm"
        >
          Entrar al tablero ✈️
        </button>
      </form>
    </div>
  )
}
