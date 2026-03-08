'use client'

import { useMemo } from 'react'
import type { Publicacion, Prenda, Match } from '../types'
import { PRENDA_ICONS } from '../types'

interface Props {
  publicaciones: Publicacion[]
  matches: Match[]
}

interface PosiblePool {
  tengo: Publicacion
  requiero: Publicacion
  mismo_base: boolean
}

export function PosiblesPools({ publicaciones, matches }: Props) {
  const posibles = useMemo(() => {
    // IDs que ya tienen match activo
    const idsConMatch = new Set<string>()
    for (const m of matches) {
      idsConMatch.add(m.tengo.id)
      idsConMatch.add(m.requiero.id)
    }

    const tengo = publicaciones.filter((p) => p.tipo === 'TENGO' && !p.en_pool && !idsConMatch.has(p.id))
    const requiero = publicaciones.filter((p) => p.tipo === 'REQUIERO' && !idsConMatch.has(p.id))

    const tallasMatch = (a: Publicacion, b: Publicacion): boolean => {
      const aOps = [a.talla, a.talla_alternativa].filter((x): x is string => !!x)
      const bOps = [b.talla, b.talla_alternativa].filter((x): x is string => !!x)
      return aOps.some((t) => bOps.includes(t))
    }

    const result: PosiblePool[] = []
    const yaVistos = new Set<string>()

    for (const t of tengo) {
      for (const r of requiero) {
        if (t.numero_rol === r.numero_rol) continue
        if (t.prenda !== r.prenda || t.genero !== r.genero) continue
        if (!tallasMatch(t, r)) continue

        const key = [t.id, r.id].sort().join('_')
        if (yaVistos.has(key)) continue
        yaVistos.add(key)

        result.push({
          tengo: t,
          requiero: r,
          mismo_base: t.base === r.base,
        })
      }
    }

    return result.sort((a, b) => {
      if (a.mismo_base && !b.mismo_base) return -1
      if (!a.mismo_base && b.mismo_base) return 1
      return 0
    })
  }, [publicaciones, matches])

  if (posibles.length === 0) return null

  function fmtTalla(prenda: Prenda, talla: string): string {
    if (prenda === 'MALETIN DE VUELO' || prenda === 'MALETA DE PERNOCTA') return talla
    return `T.${talla}`
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-4 shadow-sm mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">💡</span>
        <h3 className="text-amber-800 font-bold text-sm">
          Posibles intercambios
        </h3>
        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {posibles.length}
        </span>
      </div>
      <p className="text-amber-600 text-[11px] mb-3 ml-7">
        Estos pilotos coinciden en prenda y talla. Si activan el Pool, se genera el match automaticamente.
      </p>

      <div className="space-y-2">
        {posibles.map((p, i) => (
          <div
            key={`${p.tengo.id}-${p.requiero.id}-${i}`}
            className="bg-white/80 rounded-xl p-3 border border-amber-200"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{PRENDA_ICONS[p.tengo.prenda]}</span>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                {p.tengo.numero_rol}
              </span>
              <span className="text-amber-400 text-[10px] font-bold">TIENE</span>
              <span className="text-slate-400 text-xs">→</span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                {p.requiero.numero_rol}
              </span>
              <span className="text-amber-400 text-[10px] font-bold">BUSCA</span>
              {p.mismo_base && (
                <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  🏠 Misma base
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[11px] mt-1.5 ml-7">
              {p.tengo.prenda} · {fmtTalla(p.tengo.prenda, p.tengo.talla)}{' '}
              <span className={p.tengo.genero === 'F' ? 'text-pink-500' : 'text-sky-500'}>
                {p.tengo.genero === 'F' ? '♀' : '♂'}
              </span>{' '}
              · {p.tengo.base}{p.tengo.base !== p.requiero.base ? ` ↔ ${p.requiero.base}` : ''}
            </p>
          </div>
        ))}
      </div>

      <p className="text-amber-600 text-[11px] mt-3 text-center font-semibold">
        Activa el Pool al publicar para que tu prenda sea visible y se genere el match
      </p>
    </div>
  )
}
