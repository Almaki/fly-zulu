import type { Metadata } from 'next'
import { CanjeDashboard } from '@/features/admin/components/canje-dashboard'

export const metadata: Metadata = {
  title: 'Admin - Canje de Uniformes',
  description: 'Estadísticas e historial de chats de la Bolsa de Canje de Uniformes.',
  robots: { index: false, follow: false },
}

export default function AdminCanjePage() {
  return (
    <div className="space-y-4">
      <CanjeDashboard />
    </div>
  )
}
