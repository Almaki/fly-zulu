'use client'

import { useMemo } from 'react'
import type { Publicacion, Prenda, Genero } from '../types'
import { PRENDAS, PRENDA_ICONS } from '../types'

interface Props {
  publicaciones: Publicacion[]
}

interface EntradaTalla {
  talla: string
  tengo: number
  requiero: number
}

type ResumenPorGenero = Record<Genero, Record<string, { tengo: number; requiero: number }>>
type Resumen = Record<Prenda, ResumenPorGenero>

export function ResumenInventario({ publicaciones }: Props) {
  const resumen = useMemo(() => {
    const mapa = {} as Resumen
    for (const prenda of PRENDAS) {
      mapa[prenda] = { M: {}, F: {} }
    }

    for (const pub of publicaciones) {
      if (!mapa[pub.prenda]) continue
      const genero: Genero = pub.genero ?? 'M'
      if (!mapa[pub.prenda][genero][pub.talla]) {
        mapa[pub.prenda][genero][pub.talla] = { tengo: 0, requiero: 0 }
      }
      if (pub.tipo === 'TENGO') mapa[pub.prenda][genero][pub.talla].tengo++
      else mapa[pub.prenda][genero][pub.talla].requiero++
    }

    return mapa
  }, [publicaciones])

  const prendasConDatos = PRENDAS.filter(
    (p) => Object.keys(resumen[p].M).length > 0 || Object.keys(resumen[p].F).length > 0
  )

  if (prendasConDatos.length === 0) return null

  const renderTabla = (entradas: EntradaTalla[]) => (
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-slate-50 rounded-lg">
          <th className="text-left text-slate-500 font-semibold px-3 py-2 rounded-l-xl">Talla</th>
          <th className="text-center text-emerald-600 font-semibold px-3 py-2">✅ Tienen</th>
          <th className="text-center text-amber-600 font-semibold px-3 py-2 rounded-r-xl">🔍 Buscan</th>
        </tr>
      </thead>
      <tbody>
        {entradas.map((entrada, i) => (
          <tr key={entrada.talla} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
            <td className="px-3 py-2 font-bold text-slate-700">T.{entrada.talla}</td>
            <td className="px-3 py-2 text-center">
              {entrada.tengo > 0 ? (
                <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold w-7 h-7 rounded-full">
                  {entrada.tengo}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </td>
            <td className="px-3 py-2 text-center">
              {entrada.requiero > 0 ? (
                <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 font-bold w-7 h-7 rounded-full">
                  {entrada.requiero}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 mb-5">
      <h2 className="text-slate-700 font-bold text-base mb-4 flex items-center gap-2">
        <span>📊</span>
        Resumen de inventario por talla
      </h2>

      <div className="space-y-5">
        {prendasConDatos.map((prenda) => {
          const entradasM: EntradaTalla[] = Object.entries(resumen[prenda].M)
            .map(([talla, counts]) => ({ talla, ...counts }))
            .sort((a, b) => Number(a.talla) - Number(b.talla))

          const entradasF: EntradaTalla[] = Object.entries(resumen[prenda].F)
            .map(([talla, counts]) => ({ talla, ...counts }))
            .sort((a, b) => Number(a.talla) - Number(b.talla))

          return (
            <div key={prenda}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{PRENDA_ICONS[prenda]}</span>
                <span className="text-slate-700 font-semibold text-sm">{prenda}</span>
              </div>

              <div className="space-y-3">
                {entradasM.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1.5 ml-1">👔 Masculino</p>
                    <div className="overflow-x-auto">{renderTabla(entradasM)}</div>
                  </div>
                )}
                {entradasF.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-pink-600 mb-1.5 ml-1">👗 Femenino</p>
                    <div className="overflow-x-auto">{renderTabla(entradasF)}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
