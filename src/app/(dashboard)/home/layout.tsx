import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Tu base de operaciones. Accede a FIDS, Flight, Directorio y mas herramientas para tripulaciones.',
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
