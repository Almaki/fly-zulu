'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Crown, Plane, TrendingUp, AlertTriangle, RefreshCw, Activity, MapPin, MessageCircle, ChevronRight, UserPlus, ShirtIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

      {/* Users connected last hour */}
      <Card className="border-[#00ff88]/30 bg-[#00ff88]/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#00ff88]" />
              Conectados última hora
            </CardTitle>
            <span className="text-2xl font-bold text-[#00ff88]">{metrics.usersLastHour}</span>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.recentUsers.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {metrics.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#fafafa] truncate">{user.nombre}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      <span>{user.last_location || 'Desconocido'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-2">
              Sin usuarios activos en la última hora
            </p>
          )}
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {/* Support Tickets Link */}
        <Link href="/admin/tickets">
          <Card className="border-[#E91E8C]/30 bg-[#E91E8C]/5 hover:bg-[#E91E8C]/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E91E8C]/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#E91E8C]" />
                </div>
                <div>
                  <p className="font-medium text-[#fafafa] text-sm">Tickets</p>
                  <p className="text-xs text-zinc-500">Soporte</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Invite Users Link */}
        <Link href="/admin/invites">
          <Card className="border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-[#fafafa] text-sm">Invitar</p>
                  <p className="text-xs text-zinc-500">Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Canje Uniformes Link */}
        <Link href="/admin/canje">
          <Card className="border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <ShirtIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-[#fafafa] text-sm">Canje</p>
                  <p className="text-xs text-zinc-500">Uniformes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
