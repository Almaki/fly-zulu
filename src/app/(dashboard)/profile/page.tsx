'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Crown, AlertTriangle, Settings } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useAuth } from '@/features/auth/hooks'
import { SUBSCRIPTION } from '@/shared/constants'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Sesión cerrada')
    } catch {
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="py-8 text-center text-zinc-500">
          Cargando perfil...
        </CardContent>
      </Card>
    )
  }

  const initials = user.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#00ff88]/20 text-[#00ff88] text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{user.nombre}</h2>
                {user.subscription_tier === 'PREMIUM' && (
                  <Crown className="h-5 w-5 text-[#00ff88]" />
                )}
              </div>
              <p className="text-sm text-zinc-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{user.posicion}</Badge>
                <Badge variant="outline">{user.categoria}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription status */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4" />
            Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.subscription_tier === 'PREMIUM' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#00ff88] font-medium">Plan Premium</span>
                <Badge className="bg-[#00ff88]/20 text-[#00ff88]">Activo</Badge>
              </div>
              {user.subscription_expires_at && (
                <p className="text-xs text-zinc-500">
                  Vence: {new Date(user.subscription_expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-400">Plan Free</p>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Upgrade a Premium</p>
                <p className="text-xs text-zinc-500 mb-3">
                  Acceso ilimitado, historial, export y más
                </p>
                <Button className="w-full bg-[#00ff88] hover:bg-[#00ff88]/90 text-black">
                  ${SUBSCRIPTION.PREMIUM_PRICE_MXN} MXN/mes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strikes warning */}
      {user.strikes > 0 && (
        <Card className="border-[#FF9500]/50 bg-[#FF9500]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[#FF9500]" />
              <div>
                <p className="font-medium text-[#FF9500]">
                  {user.strikes} Strike{user.strikes > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-zinc-400">
                  {user.strikes === 1 && 'Advertencia'}
                  {user.strikes === 2 && 'Próximo strike = ban permanente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account info */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Información de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">WhatsApp</span>
            <span className="text-sm">{user.whatsapp}</span>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">Miembro desde</span>
            <span className="text-sm">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex justify-between">
            <span className="text-sm text-zinc-500">Rol</span>
            <span className="text-sm">{user.role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Admin link */}
      {user.role === 'SUPERADMIN' && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/admin/metrics')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Panel de Administración
        </Button>
      )}

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </Button>
    </div>
  )
}
