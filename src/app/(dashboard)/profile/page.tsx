'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  User,
  AlertTriangle,
  Settings,
  UserCircle,
  Bell,
  BellOff,
  MessageCircle,
  HeadphonesIcon,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useAuth } from '@/features/auth/hooks'
import { useThemeStore } from '@/shared/stores/theme-store'
import { NotificationBell, NotificationCenter, CreateTicketDialog, TicketList } from '@/features/support/components'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [notificationsMuted, setNotificationsMuted] = useState(
    user?.notifications_muted ?? false
  )

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

  // Support view
  if (showSupport) {
    return (
      <div className="h-[calc(100vh-180px)] bg-background rounded-xl overflow-hidden">
        <TicketList userId={user.id} />
        <div className="p-4 border-t border-zinc-800">
          <Button
            variant="outline"
            className="w-full border-zinc-700"
            onClick={() => setShowSupport(false)}
          >
            Volver al Perfil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile header with notification bell */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#00ff88]/20 text-[#00ff88] text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold truncate">{user.nombre}</h2>
              </div>
              <p className="text-sm text-zinc-500 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge>{user.posicion}</Badge>
                <Badge variant="outline">{user.categoria}</Badge>
              </div>
            </div>

            {/* Notification bell */}
            <div className="flex-shrink-0">
              <NotificationBell
                userId={user.id}
                muted={notificationsMuted}
                onClick={() => setShowNotifications(true)}
              />
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

      {/* Contact Support - prominent CTA */}
      <Card className="border-[#E91E8C]/30 bg-[#E91E8C]/5">
        <CardContent className="p-4">
          <button
            onClick={() => setShowSupport(true)}
            className="w-full flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon className="w-6 h-6 text-[#E91E8C]" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[#fafafa]">Soporte</h3>
              <p className="text-xs text-zinc-400">
                Reporta bugs, sugerencias o contacta al admin
              </p>
            </div>
            <MessageCircle className="w-5 h-5 text-[#E91E8C]" />
          </button>
        </CardContent>
      </Card>

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

      {/* Theme Settings */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {themeMode === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : themeMode === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            Tema de la App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-500 mb-3">
            Auto cambia según la hora (día 6:00-18:00)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                themeMode === 'light'
                  ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-medium">Día</span>
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                themeMode === 'dark'
                  ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#8b5cf6]'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-medium">Noche</span>
            </button>
            <button
              onClick={() => setThemeMode('auto')}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                themeMode === 'auto'
                  ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span className="text-xs font-medium">Auto</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification settings */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {notificationsMuted ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setShowNotifications(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm text-zinc-400">Ver notificaciones</span>
            <NotificationBell
              userId={user.id}
              muted={notificationsMuted}
            />
          </button>
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

      {/* Notification Center Modal */}
      {showNotifications && (
        <NotificationCenter
          userId={user.id}
          muted={notificationsMuted}
          onMutedChange={setNotificationsMuted}
          onClose={() => setShowNotifications(false)}
          onTicketClick={(ticketId) => {
            setShowNotifications(false)
            setShowSupport(true)
          }}
        />
      )}

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={showCreateTicket}
        onOpenChange={setShowCreateTicket}
        userId={user.id}
      />
    </div>
  )
}
