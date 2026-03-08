'use client'

import { useMemo } from 'react'
import type { Publicacion, Prenda } from '../types'
import { PRENDA_ICONS } from '../types'

interface Props {
  publicaciones: Publicacion[]
}

interface Eslabon {
  piloto: string
  base: string
  tiene: Publicacion
  recibe: Publicacion
}

interface Cadena {
  eslabones: Eslabon[]
}

function tallasMatch(a: Publicacion, b: Publicacion): boolean {
  const aOps = [a.talla, a.talla_alternativa].filter((x): x is string => !!x)
  const bOps = [b.talla, b.talla_alternativa].filter((x): x is string => !!x)
  return aOps.some((t) => bOps.includes(t))
}

function fmtTalla(prenda: Prenda, talla: string): string {
  if (prenda === 'MALETIN DE VUELO' || prenda === 'MALETA DE PERNOCTA') return talla
  return `T.${talla}`
}

interface Edge {
  from: string
  to: string
  tengo: Publicacion
  requiero: Publicacion
}

export function CadenasMatch({ publicaciones }: Props) {
  const cadenas = useMemo(() => {
    const tengoPubs = publicaciones.filter((p) => p.tipo === 'TENGO')
    const requieroPubs = publicaciones.filter((p) => p.tipo === 'REQUIERO')

    // Build directed edges: from (pilot who HAS) → to (pilot who NEEDS)
    const edges: Edge[] = []
    for (const t of tengoPubs) {
      for (const r of requieroPubs) {
        if (t.numero_rol === r.numero_rol) continue
        if (t.prenda !== r.prenda || t.genero !== r.genero) continue
        if (!tallasMatch(t, r)) continue
        edges.push({ from: t.numero_rol, to: r.numero_rol, tengo: t, requiero: r })
      }
    }

    // Adjacency map: from → edges[]
    const adj = new Map<string, Edge[]>()
    for (const e of edges) {
      adj.set(e.from, [...(adj.get(e.from) ?? []), e])
    }

    // Find triangles (3-pilot chains): A→B→C→A
    const result: Cadena[] = []
    const seen = new Set<string>()

    for (const ab of edges) {
      const bcEdges = adj.get(ab.to) ?? []
      for (const bc of bcEdges) {
        if (bc.to === ab.from) continue // 2-cycle = direct match, skip
        if (bc.to === ab.to) continue // self-loop

        const caEdges = adj.get(bc.to) ?? []
        for (const ca of caEdges) {
          if (ca.to !== ab.from) continue // must close the cycle

          // Triangle: A→B→C→A
          const key = [ab.from, ab.to, bc.to].sort().join('|')
          if (seen.has(key)) continue
          seen.add(key)

          result.push({
            eslabones: [
              {
                piloto: ab.from,
                base: ab.tengo.base,
                tiene: ab.tengo,
                recibe: ca.tengo,
              },
              {
                piloto: ab.to,
                base: bc.tengo.base,
                tiene: bc.tengo,
                recibe: ab.tengo,
              },
              {
                piloto: bc.to,
                base: ca.tengo.base,
                tiene: ca.tengo,
                recibe: bc.tengo,
              },
            ],
          })
        }
      }
    }

    return result
  }, [publicaciones])

  if (cadenas.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-2xl border-2 border-fuchsia-200 p-4 shadow-sm mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🔗</span>
        <h3 className="text-fuchsia-800 font-bold text-sm">
          Cadenas de intercambio
        </h3>
        <span className="bg-fuchsia-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {cadenas.length}
        </span>
      </div>
      <p className="text-fuchsia-600 text-[11px] mb-3 ml-7">
        3 pilotos que pueden intercambiar en cadena: A da a B, B da a C, C da a A
      </p>

      <div className="space-y-3">
        {cadenas.map((cadena, i) => (
          <div
            key={i}
            className="bg-white/80 rounded-xl p-3 border border-fuchsia-200"
          >
            <div className="space-y-2">
              {cadena.eslabones.map((eslabon, j) => {
                const siguiente = cadena.eslabones[(j + 1) % cadena.eslabones.length]
                return (
                  <div key={j} className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{PRENDA_ICONS[eslabon.tiene.prenda]}</span>
                    <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                      {eslabon.piloto}
                    </span>
                    <span className="text-fuchsia-400 text-[10px]">da</span>
                    <span className="text-slate-600 text-[11px] font-semibold">
                      {eslabon.tiene.prenda} {fmtTalla(eslabon.tiene.prenda, eslabon.tiene.talla)}
                    </span>
                    <span className="text-fuchsia-400 text-xs">→</span>
                    <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                      {siguiente.piloto}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({eslabon.base})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-fuchsia-600 text-[11px] mt-3 text-center font-semibold">
        Coordinen entre los 3 para completar el intercambio en cadena
      </p>
    </div>
  )
}
