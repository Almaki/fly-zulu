import type { Metadata } from 'next'
import { DirectoryList } from '@/features/directory/components'

export const metadata: Metadata = {
  title: 'Directorio de Servicios',
  description: 'Encuentra hoteles, transporte, restaurantes y servicios cerca de cada aeropuerto en Mexico.',
  openGraph: {
    title: 'Directorio de Servicios | FLY-ZULU',
    description: 'Encuentra hoteles, transporte, restaurantes y servicios cerca de cada aeropuerto en Mexico.',
  },
}

export default function DirectoryPage() {
  return <DirectoryList />
}
