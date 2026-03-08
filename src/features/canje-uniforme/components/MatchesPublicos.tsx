'use client'

import type { Publicacion, Match, Prenda } from '../types'
import { PRENDA_ICONS } from '../types'

function fmtTalla(prenda: Prenda, talla: string): string {
  if (prenda === 'CAMISA MC') return `C.${talla}`
  if (prenda === 'CAMISA ML') {
    const [c, m] = talla.split('/')
    return c && m ? `C.${c}/M.${m}` : talla
  }
  if (prenda === 'MALETIN DE VUELO' || prenda === 'MALETA DE PERNOCTA') return talla
  return `T.${talla}`
}

interface Props {
  matches: Match[]
  resueltas: Publicacion[]
}

export function MatchesPublicos({ matches, resueltas }: Props) {

  // Agrupar resoluciones en pares por proximidad (TENGO + REQUIERO del mismo piloto o matching)
  const paresResueltos: { piloto1: string; piloto2: string; prenda: Prenda; base1: string; base2: string }[] = []
  const usados = new Set<string>()

  for (const pub of resueltas) {
    if (usados.has(pub.id)) continue
    // Buscar la contraparte
    const contraparte = resueltas.find(
      (p) =>
        p.id !== pub.id &&
        !usados.has(p.id) &&
        p.prenda === pub.prenda &&
        p.genero === pub.genero &&
        p.tipo !== pub.tipo
    )
    if (contraparte) {
      usados.add(pub.id)
      usados.add(contraparte.id)
      const tengo = pub.tipo === 'TENGO' ? pub : contraparte
      const requiero = pub.tipo === 'REQUIERO' ? pub : contraparte
      paresResueltos.push({
        piloto1: tengo.numero_rol,
        piloto2: requiero.numero_rol,
        prenda: tengo.prenda,
        base1: tengo.base,
        base2: requiero.base,
      })
    } else {
      usados.add(pub.id)
      paresResueltos.push({
        piloto1: pub.numero_rol,
        piloto2: '—',
        prenda: pub.prenda,
        base1: pub.base,
        base2: '',
      })
    }
  }

  if (matches.length === 0 && paresResueltos.length === 0) return null

  return (
    <div className="space-y-4 mb-5">
      {/* Matches activos */}
      {matches.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤝</span>
            <h3 className="text-violet-800 font-bold text-sm">
              Matches activos
            </h3>
            <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {matches.length}
            </span>
          </div>
          <div className="space-y-2">
            {matches.map((m) => (
              <div
                key={m.chat_key}
                className={`rounded-xl p-3 border ${
                  m.tipo === 'directo'
                    ? 'bg-white/80 border-violet-200'
                    : 'bg-orange-50/80 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg">{PRENDA_ICONS[m.tengo.prenda]}</span>
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                    {m.tengo.numero_rol}
                  </span>
                  <span className="text-slate-400 text-xs">↔</span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                    {m.requiero.numero_rol}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    m.tipo === 'directo' ? 'bg-violet-100 text-violet-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {m.tipo === 'directo' ? '🎯 DIRECTO' : '🤝 POOL'}
                  </span>
                  {m.mismo_base && (
                    <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      🏠 Misma base
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] mt-1.5 ml-7">
                  {m.tengo.prenda} · {fmtTalla(m.tengo.prenda, m.tengo.talla)}{' '}
                  <span className={m.tengo.genero === 'F' ? 'text-pink-500' : 'text-sky-500'}>
                    {m.tengo.genero === 'F' ? '♀' : '♂'}
                  </span>{' '}
                  · {m.tengo.base} ↔ {m.requiero.base}
                </p>
              </div>
            ))}
          </div>
          <p className="text-violet-500 text-[11px] mt-3 text-center font-medium">
            Estos pilotos ya se están poniendo de acuerdo para intercambiar
          </p>
        </div>
      )}

      {/* Resoluciones completadas */}
      {paresResueltos.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎉</span>
            <h3 className="text-emerald-800 font-bold text-sm">
              Canjes resueltos
            </h3>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {paresResueltos.length}
            </span>
          </div>
          <div className="space-y-2">
            {paresResueltos.map((par, i) => (
              <div
                key={`${par.piloto1}-${par.piloto2}-${i}`}
                className="bg-white/80 rounded-xl p-3 border border-emerald-200 flex items-center gap-2 flex-wrap"
              >
                <span className="text-lg">{PRENDA_ICONS[par.prenda]}</span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                  {par.piloto1}
                </span>
                {par.piloto2 !== '—' && (
                  <>
                    <span className="text-emerald-400 text-xs font-bold">✓</span>
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      {par.piloto2}
                    </span>
                  </>
                )}
                <span className="text-slate-500 text-[11px]">
                  {par.prenda}
                  {par.base1 && ` · ${par.base1}`}
                  {par.base2 && par.base2 !== par.base1 && ` ↔ ${par.base2}`}
                </span>
              </div>
            ))}
          </div>
          <p className="text-emerald-500 text-[11px] mt-3 text-center font-medium">
            Intercambios completados exitosamente
          </p>
        </div>
      )}
    </div>
  )
}
