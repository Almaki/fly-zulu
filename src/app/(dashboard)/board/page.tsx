import type { Metadata } from 'next'
import { DigitalBoard } from '@/features/fids/components'

export const metadata: Metadata = {
  title: 'FIDS - Pantalla de Vuelos',
  description: 'Informacion de vuelos en tiempo real estilo aeropuerto. Consulta salidas, llegadas y estados de vuelos.',
  openGraph: {
    title: 'FIDS - Pantalla de Vuelos | FLY-ZULU',
    description: 'Informacion de vuelos en tiempo real estilo aeropuerto. Consulta salidas, llegadas y estados de vuelos.',
  },
}

export default function BoardPage() {
  return <DigitalBoard />
}
