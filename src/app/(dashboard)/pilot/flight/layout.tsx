import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flight - Bitacora de Vuelo',
  description: 'Registra tu jornada de vuelo, tiempos OUT/OFF/ON/IN y calcula FLT y BLK automaticamente.',
  openGraph: {
    title: 'Flight - Bitacora de Vuelo | FLY-ZULU',
    description: 'Registra tu jornada de vuelo, tiempos OUT/OFF/ON/IN y calcula FLT y BLK automaticamente.',
  },
}

export default function FlightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
