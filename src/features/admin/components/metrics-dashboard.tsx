'use client'

import { useEffect, useState } from 'react'
import { Users, Crown, Plane, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Progress } from '@/shared/components/ui/progress'
import { getAdminMetrics } from '../services'
import type { AdminMetrics } from '../types'

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMetrics = async () => {
    setIsLoading(true)
    const result = await getAdminMetrics()
    if (result.data) {
      setMetrics(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full bg-zinc-800" />
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-[#FF9500] mb-2" />
          <p className="text-zinc-400">Error cargando métricas</p>
          <Button onClick={fetchMetrics} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Button variant="ghost" size="sm" onClick={fetchMetrics}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-zinc-500" />
              <span className="text-2xl font-bold">{metrics.totalUsers}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Usuarios totales</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Crown className="h-5 w-5 text-[#00ff88]" />
              <span className="text-2xl font-bold">{metrics.premiumUsers}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Premium</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Plane className="h-5 w-5 text-zinc-500" />
              <span className="text-2xl font-bold">{metrics.flightsToday}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Vuelos hoy</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-zinc-500" />
              <span className="text-2xl font-bold">
                {metrics.conversionRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Conversión</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion progress */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tasa de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Free: {metrics.freeUsers}</span>
              <span>Premium: {metrics.premiumUsers}</span>
            </div>
            <Progress value={metrics.conversionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Users by role */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Usuarios por Rol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{role}</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(count / metrics.totalUsers) * 100}
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
