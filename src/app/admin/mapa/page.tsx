import type { Metadata } from 'next'
import { CityUsersMap } from '@/features/admin/components'

export const metadata: Metadata = {
  title: 'Admin - Mapa de Usuarios',
  description: 'Mapa de usuarios por ciudad base',
  robots: { index: false, follow: false },
}

export default function AdminMapPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#fafafa]">Mapa de Usuarios</h1>
          <p className="text-xs text-zinc-500">Usuarios conectados por ciudad base</p>
        </div>
      </div>
      <CityUsersMap refreshInterval={30000} />
    </div>
  )
}
