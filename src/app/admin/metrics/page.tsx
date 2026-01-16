import type { Metadata } from 'next'
import { MetricsDashboard } from '@/features/admin/components'

export const metadata: Metadata = {
  title: 'Admin - Metricas',
  description: 'Panel de administracion de FLY-ZULU. Metricas de usuarios y sistema.',
  robots: { index: false, follow: false },
}

export default function AdminMetricsPage() {
  return <MetricsDashboard />
}
