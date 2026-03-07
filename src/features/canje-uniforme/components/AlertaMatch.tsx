'use client'

import type { Match } from '../types'
import { PRENDA_ICONS } from '../types'
import { MessageCircle } from 'lucide-react'

interface Props {
  matches: Match[]
  numeroRol: string
  onAbrirChat: (match: Match) => void
}

const estiloTipo = {
  directo: {
    banner: 'from-violet-500 to-purple-600 shadow-violet-200',
    tarjeta: 'border-violet-200 bg-violet-50',
    boton: 'bg-violet-500 hover:bg-violet-600',
    etiqueta: 'text-violet-600',
    icono: '🎯',
    label: 'Match Directo',
  },
  pool: {
    banner: 'from-orange-500 to-amber-500 shadow-orange-200',
    tarjeta: 'border-orange-200 bg-orange-50',
    boton: 'bg-orange-500 hover:bg-orange-600',
    etiqueta: 'text-orange-600',
    icono: '🤝',
    label: 'Match POOL',
  },
}

function TarjetaMatch({ match, numeroRol, onAbrirChat }: {
  match: Match
  numeroRol: string
  onAbrirChat: (m: Match) => void
}) {
  const e = estiloTipo[match.tipo]
  const esTengo = match.tengo.numero_rol === numeroRol
  const contraparte = esTengo ? match.requiero : match.tengo

  return (
    <div className={`border-2 rounded-2xl p-3 ${e.tarjeta}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{PRENDA_ICONS[match.tengo.prenda]}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className="text-slate-800 font-bold text-sm flex items-center gap-1">
                {match.tengo.prenda} · T.{match.tengo.talla}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${match.tengo.genero === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                  {match.tengo.genero === 'F' ? '♀ F' : '♂ M'}
                </span>
              </p>
              {match.mismo_base && (
                <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  🏠 Tu base
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs truncate">
              Con <span className={`font-semibold ${e.etiqueta}`}>{contraparte.numero_rol}</span>
              {' · '}{contraparte.base}
            </p>
            <p className={`text-[11px] font-medium mt-0.5 ${e.etiqueta}`}>
              {esTengo
                ? match.tipo === 'pool' ? '🤝 Tú donas → ellos reciben del POOL' : '✅ Tú tienes → ellos requieren'
                : match.tipo === 'pool' ? '🟠 Recibes del POOL comunitario' : '🔍 Tú requieres → ellos tienen'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onAbrirChat(match)}
          className={`${e.boton} text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 active:scale-95`}
        >
          <MessageCircle size={14} />
          Chat
        </button>
      </div>
    </div>
  )
}

function GrupoMatches({ tipo, matches, numeroRol, onAbrirChat }: {
  tipo: 'directo' | 'pool'
  matches: Match[]
  numeroRol: string
  onAbrirChat: (m: Match) => void
}) {
  if (matches.length === 0) return null
  const e = estiloTipo[tipo]
  const mismaBase = matches.filter((m) => m.mismo_base)
  const otrasBase = matches.filter((m) => !m.mismo_base)

  return (
    <div className="mb-3">
      <div className={`bg-gradient-to-r ${e.banner} rounded-2xl p-3 shadow-lg mb-2`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{e.icono}</span>
          <div>
            <h3 className="text-white font-bold text-sm">
              {matches.length === 1 ? `1 ${e.label}` : `${matches.length} ${e.label}s`}
            </h3>
            {mismaBase.length > 0 && (
              <p className="text-white/80 text-[11px]">
                🏠 {mismaBase.length} en tu misma base
                {otrasBase.length > 0 && ` · ${otrasBase.length} en otras bases`}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {mismaBase.length > 0 && (
          <>
            <p className="text-xs font-semibold text-sky-600 ml-1">🏠 Misma base — prioridad</p>
            {mismaBase.map((m) => <TarjetaMatch key={m.chat_key} match={m} numeroRol={numeroRol} onAbrirChat={onAbrirChat} />)}
          </>
        )}
        {otrasBase.length > 0 && (
          <>
            {mismaBase.length > 0 && <p className="text-xs font-semibold text-slate-400 ml-1 pt-1">✈️ Otras bases</p>}
            {otrasBase.map((m) => <TarjetaMatch key={m.chat_key} match={m} numeroRol={numeroRol} onAbrirChat={onAbrirChat} />)}
          </>
        )}
      </div>
    </div>
  )
}

export function AlertaMatch({ matches, numeroRol, onAbrirChat }: Props) {
  const misMatches = matches.filter(
    (m) => m.tengo.numero_rol === numeroRol || m.requiero.numero_rol === numeroRol
  )
  if (misMatches.length === 0) return null

  return (
    <div className="mb-5">
      <GrupoMatches tipo="directo" matches={misMatches.filter((m) => m.tipo === 'directo')} numeroRol={numeroRol} onAbrirChat={onAbrirChat} />
      <GrupoMatches tipo="pool" matches={misMatches.filter((m) => m.tipo === 'pool')} numeroRol={numeroRol} onAbrirChat={onAbrirChat} />
    </div>
  )
}
