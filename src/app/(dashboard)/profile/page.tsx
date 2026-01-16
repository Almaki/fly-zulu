'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, AlertTriangle, Settings, UserCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useAuth } from '@/features/auth/hooks'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
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

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="py-8 text-center text-zinc-500">
          Cargando perfil...
        </CardContent>
      </Card>
    )
  }

  // Anonymous user (no profile in database)
  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-zinc-700 text-zinc-400 text-xl">
                  <UserCircle className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-zinc-300">Usuario Invitado</h2>
                <p className="text-sm text-zinc-500">Modo anónimo</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                    Sin cuenta
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0088FF]/30 bg-[#0088FF]/5">
          <CardContent className="p-4">
            <p className="text-sm text-[#0088FF] mb-3">
              Crea una cuenta para acceder a todas las funciones
            </p>
            <Button
              className="w-full bg-[#0088FF] hover:bg-[#0066CC]"
              onClick={() => router.push('/register')}
            >
              Crear cuenta
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full border-zinc-700 text-zinc-400"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Saliendo...' : 'Salir del modo invitado'}
        </Button>
      </div>
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
