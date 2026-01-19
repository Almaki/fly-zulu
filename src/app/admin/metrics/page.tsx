import type { Metadata } from 'next'
import { MetricsDashboard, LiveMap } from '@/features/admin/components'

export const metadata: Metadata = {
  title: 'Admin - Metricas',
  description: 'Panel de administracion de FLY-ZULU. Metricas de usuarios y sistema.',
  robots: { index: false, follow: false },
}

export default function AdminMetricsPage() {
  return (
    <div className="space-y-4">
      <MetricsDashboard />
      <LiveMap refreshInterval={30000} />
    </div>
  )
}
