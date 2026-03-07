'use client'

import type { Publicacion, Match, Prenda } from '../types'
import { PRENDA_ICONS } from '../types'
import { Trash2, CheckCircle, MessageCircle, Clock, XCircle } from 'lucide-react'

function fmt(prenda: Prenda, talla: string): string {
  if (prenda === 'CAMISA MC') return `C.${talla}`
  if (prenda === 'CAMISA ML') {
    const [c, m] = talla.split('/')
    return c && m ? `C.${c}/M.${m}` : talla
  }
  return `T.${talla}`
}

interface Props {
  publicaciones: Publicacion[]
  matches: Match[]
  misMatchIds: Set<string>
  numeroRol: string
  onRetirar: (id: string) => Promise<void>
  onResolver: (match: Match) => Promise<void>
  onAbrirChat: (match: Match) => void
  onCancelarMatch: (match: Match) => Promise<void>
}

export function Tablero({
  publicaciones,
  matches,
  misMatchIds,
  numeroRol,
  onRetirar,
  onResolver,
  onAbrirChat,
  onCancelarMatch,
}: Props) {
  const tengo = publicaciones.filter((p) => p.tipo === 'TENGO')
  const requiero = publicaciones.filter((p) => p.tipo === 'REQUIERO')

  const matchDePublicacion = (id: string): Match | undefined =>
    matches.find((m) => m.tengo.id === id || m.requiero.id === id)

  const renderCard = (pub: Publicacion) => {
    const esMia = pub.numero_rol === numeroRol
    const match = matchDePublicacion(pub.id)
    const tieneMatch = !!match
    const tipoMatch = match?.tipo
    const yaResolvi = pub.resuelto_por?.includes(numeroRol) ?? false

    let borderClass = ''
    let badgeLabel = ''
    let badgeClass = ''
    let botonClass = ''

    if (tieneMatch) {
      if (tipoMatch === 'pool') {
        borderClass = 'border-orange-300 bg-orange-50'
        badgeLabel = '🤝 POOL'
        badgeClass = 'bg-orange-500'
        botonClass = 'bg-orange-500 hover:bg-orange-600'
      } else {
        borderClass = 'border-violet-300 bg-violet-50'
        badgeLabel = '🎯 DIRECTO'
        badgeClass = 'bg-violet-500'
        botonClass = 'bg-violet-500 hover:bg-violet-600'
      }
    } else if (pub.tipo === 'TENGO') {
      borderClass = pub.en_pool ? 'border-orange-200 bg-orange-50/40' : 'border-emerald-200 bg-emerald-50'
    } else {
      borderClass = 'border-amber-200 bg-amber-50'
    }

    return (
      <div key={pub.id} className={`rounded-2xl border-2 p-3 transition-all ${borderClass}`}>
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {tieneMatch && badgeLabel && (
            <span className={`${badgeClass} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
              {badgeLabel}
            </span>
          )}
          {tieneMatch && match?.mismo_base && (
            <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              🏠 Misma base
            </span>
          )}
          {pub.en_pool && !tieneMatch && (
            <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              🟠 En POOL
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          {/* Info */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">{PRENDA_ICONS[pub.prenda]}</span>
            <div className="min-w-0">
              <p className="text-slate-800 font-bold text-sm leading-tight flex items-center gap-1 flex-wrap">
                <span>
                  {pub.prenda} · {fmt(pub.prenda, pub.talla)}
                  {pub.talla_alternativa && (
                    <span className="text-slate-500 font-normal"> / {fmt(pub.prenda, pub.talla_alternativa)}</span>
                  )}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pub.genero === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                  {pub.genero === 'F' ? '♀ F' : '♂ M'}
                </span>
              </p>
              <p className="text-slate-500 text-xs truncate">
                <span className="font-semibold">{pub.numero_rol}</span> · {pub.base}
                {pub.cantidad > 1 && (
                  <span className="ml-1 text-indigo-600 font-semibold">× {pub.cantidad}</span>
                )}
              </p>
              {pub.comentario && (
                <p className="text-slate-400 text-[11px] mt-0.5 leading-snug italic truncate" title={pub.comentario}>
                  💬 {pub.comentario}
                </p>
              )}
              {pub.resuelto_por && pub.resuelto_por.length > 0 && (
                <p className="text-amber-600 text-[10px] font-medium mt-0.5">
                  ⏳ {pub.resuelto_por.length}/2 confirmaron
                </p>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-1.5 shrink-0 items-end">
            {tieneMatch && match && misMatchIds.has(pub.id) && (
              <button
                onClick={() => onAbrirChat(match)}
                className={`${botonClass} text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95`}
              >
                <MessageCircle size={12} />
                Chat
              </button>
            )}
            {esMia && tieneMatch && match && !yaResolvi && (
              <button
                onClick={() => onResolver(match)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
              >
                <CheckCircle size={12} />
                Resuelto
              </button>
            )}
            {esMia && yaResolvi && (
              <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                <Clock size={10} /> Esperando...
              </span>
            )}
            {esMia && tieneMatch && match && !yaResolvi && (
              <button
                onClick={() => onCancelarMatch(match)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Cancelar match y volver al tablero"
              >
                <XCircle size={13} />
              </button>
            )}
            {esMia && !tieneMatch && (
              <button
                onClick={() => onRetirar(pub.id)}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Retirar publicación"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const directosMismaBase = matches.filter((m) => m.tipo === 'directo' && m.mismo_base).length
  const directosOtras = matches.filter((m) => m.tipo === 'directo' && !m.mismo_base).length
  const poolCount = matches.filter((m) => m.tipo === 'pool').length

  return (
    <div className="space-y-5">
      {matches.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {directosMismaBase > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs">🏠🎯</span>
              <span className="text-violet-700 text-xs font-semibold">{directosMismaBase} directo{directosMismaBase > 1 ? 's' : ''} · misma base</span>
            </div>
          )}
          {directosOtras > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs">✈️🎯</span>
              <span className="text-violet-700 text-xs font-semibold">{directosOtras} directo{directosOtras > 1 ? 's' : ''} · otras bases</span>
            </div>
          )}
          {poolCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs">🤝</span>
              <span className="text-orange-700 text-xs font-semibold">{poolCount} POOL</span>
            </div>
          )}
        </div>
      )}

      {/* TENGO */}
      <div>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
          ✅ TENGO ({tengo.length})
        </span>
        {tengo.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-emerald-400 text-sm">Sin publicaciones disponibles</p>
          </div>
        ) : (
          <div className="space-y-2">{tengo.map(renderCard)}</div>
        )}
      </div>

      {/* REQUIERO */}
      <div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
          🔍 REQUIERO ({requiero.length})
        </span>
        {requiero.length === 0 ? (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <p className="text-amber-400 text-sm">Sin publicaciones de búsqueda</p>
          </div>
        ) : (
          <div className="space-y-2">{requiero.map(renderCard)}</div>
        )}
      </div>
    </div>
  )
}
