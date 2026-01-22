import type { Metadata } from 'next'
import { Megaphone, Users } from 'lucide-react'
import { CiudadCard } from '@/features/avisos-ocasion/components'
import { getAvisosCount } from '@/features/avisos-ocasion/services'
import type { CiudadCode } from '@/features/avisos-ocasion/types'

export const metadata: Metadata = {
  title: 'Aviso de Ocasión',
  description: 'Clasificados para tripulaciones: compra/venta, renta de inmuebles, autos, roomies y más.',
}

const CIUDADES: CiudadCode[] = ['TIJ', 'BJX', 'GDL', 'MTY', 'MEX', 'CUN']

async function getCounts() {
  const counts: Record<CiudadCode, number> = {
    TIJ: 0, BJX: 0, GDL: 0, MTY: 0, MEX: 0, CUN: 0
  }

  // Fetch counts in parallel
  const results = await Promise.all(
    CIUDADES.map(async (code) => {
      const { count } = await getAvisosCount(code)
      return { code, count }
    })
  )

  results.forEach(({ code, count }) => {
    counts[code] = count
  })

  return counts
}

export default async function AvisoOcasionPage() {
  const counts = await getCounts()

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex p-4 rounded-full bg-[#E91E8C]/10 mb-4">
            <Megaphone className="h-10 w-10 text-[#E91E8C]" />
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa] mb-2">
            Aviso de Ocasión
          </h1>
          <p className="text-[#71717a] text-sm max-w-xs mx-auto">
            Compra, vende, renta o busca roomie. Clasificados exclusivos para tripulaciones.
          </p>
        </div>

        {/* Ciudad Cards */}
        <div className="space-y-3">
          {CIUDADES.map((code) => (
            <CiudadCard
              key={code}
              code={code}
              count={counts[code]}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-[#1f1f1f] mt-8">
          <div className="flex items-center justify-center gap-2 text-[#71717a] text-sm">
            <Users className="w-4 h-4" />
            <span>Exclusivo para tripulaciones verificadas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
