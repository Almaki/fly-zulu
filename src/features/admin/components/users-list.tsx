'use client'

import { useEffect, useState } from 'react'
import { Search, Ban, Crown, AlertTriangle, MoreVertical, ChevronDown, Users, Trash2, Phone, Mail, Calendar, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { getUsers, addStrike, removeStrike, toggleBan, setUserPremium, deleteUser, updateUserRole } from '../services'
import type { User } from '@/shared/types'
import type { AdminFilters } from '../types'

const POSITION_LABELS: Record<string, string> = {
  PILOT: 'Pilotos',
  FA: 'Sobrecargos',
  OPS: 'Operaciones',
  TRAFICO: 'Tráfico',
  MANTTO: 'Mantenimiento',
}

const POSITION_COLORS: Record<string, string> = {
  PILOT: 'from-[#0066CC] to-[#0088FF]',
  FA: 'from-[#E91E8C] to-[#ff6eb4]',
  OPS: 'from-[#22c55e] to-[#4ade80]',
  TRAFICO: 'from-[#f59e0b] to-[#fbbf24]',
  MANTTO: 'from-[#8b5cf6] to-[#a78bfa]',
}

const CATEGORIA_OPTIONS = [
  { value: 'FLIGHT', label: 'FLIGHT (Tripulación)' },
  { value: 'GROUND', label: 'GROUND (Tierra)' },
]

const POSICION_BY_CATEGORIA: Record<string, Array<{ value: string; label: string }>> = {
  FLIGHT: [
    { value: 'PILOT', label: 'Piloto' },
    { value: 'FA', label: 'Sobrecargo' },
  ],
  GROUND: [
    { value: 'OPS', label: 'Operaciones' },
    { value: 'TRAFICO', label: 'Tráfico' },
    { value: 'MANTTO', label: 'Mantenimiento' },
  ],
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<AdminFilters>({})
  const [search, setSearch] = useState('')
  const [expandedPositions, setExpandedPositions] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editCategoria, setEditCategoria] = useState<string>('')
  const [editPosicion, setEditPosicion] = useState<string>('')
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

  const fetchUsers = async (newFilters?: AdminFilters) => {
    setIsLoading(true)
    const result = await getUsers(newFilters || filters)
    if (result.data) {
      setUsers(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const newFilters = { ...filters, search: search || undefined }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const handleAddStrike = async (userId: string) => {
    const result = await addStrike(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Strike agregado')
      fetchUsers()
    }
  }

  const handleRemoveStrike = async (userId: string) => {
    const result = await removeStrike(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Strike removido')
      fetchUsers()
    }
  }

  const handleToggleBan = async (userId: string, ban: boolean) => {
    const result = await toggleBan(userId, ban)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(ban ? 'Usuario baneado' : 'Usuario desbaneado')
      fetchUsers()
    }
  }

  const handleTogglePremium = async (userId: string, isPremium: boolean) => {
    const result = await setUserPremium(userId, isPremium)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isPremium ? 'Usuario ahora es Premium' : 'Suscripción cancelada')
      fetchUsers()
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      return
    }
    const result = await deleteUser(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Usuario eliminado')
      fetchUsers()
    }
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !editCategoria || !editPosicion) return

    setIsUpdatingRole(true)
    const result = await updateUserRole(
      selectedUser.id,
      editCategoria as 'FLIGHT' | 'GROUND',
      editPosicion
    )
    setIsUpdatingRole(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Rol actualizado')
      fetchUsers()
      setSelectedUser(null)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setEditCategoria(user.categoria)
    setEditPosicion(user.posicion)
  }

  const togglePosition = (position: string) => {
    setExpandedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    )
  }

  // Group users by position
  const usersByPosition = users.reduce((acc, user) => {
    const position = user.posicion
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(user)
    return acc
  }, {} as Record<string, User[]>)

  // Get positions in order
  const positions = Object.keys(POSITION_LABELS).filter(
    (pos) => usersByPosition[pos]?.length > 0
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.role || 'all'}
          onValueChange={(v) => handleFilterChange('role', v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Posición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="PILOT">Pilot</SelectItem>
            <SelectItem value="FA">FA</SelectItem>
            <SelectItem value="OPS">OPS</SelectItem>
            <SelectItem value="TRAFICO">Tráfico</SelectItem>
            <SelectItem value="MANTTO">Mantto</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="banned">Baneados</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.subscription || 'all'}
          onValueChange={(v) => handleFilterChange('subscription', v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users grouped by position */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
          ))
        ) : users.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="py-8 text-center text-zinc-500">
              No se encontraron usuarios
            </CardContent>
          </Card>
        ) : (
          positions.map((position) => (
            <Collapsible
              key={position}
              open={expandedPositions.includes(position)}
              onOpenChange={() => togglePosition(position)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full">
                  <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${POSITION_COLORS[position]} flex items-center justify-center`}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-[#fafafa]">
                              {POSITION_LABELS[position]}
                            </h3>
                            <p className="text-xs text-zinc-500">
                              {usersByPosition[position].length} usuario{usersByPosition[position].length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-zinc-500 transition-transform ${
                            expandedPositions.includes(position) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 space-y-2 pl-4">
                {usersByPosition[position].map((user) => (
                  <Card
                    key={user.id}
                    className={`border-zinc-700/50 bg-zinc-800/50 ${user.is_banned ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{user.nombre}</span>
                            {user.subscription_tier === 'PREMIUM' && (
                              <Crown className="h-3.5 w-3.5 text-[#00ff88] flex-shrink-0" />
                            )}
                            {user.is_banned && (
                              <Ban className="h-3.5 w-3.5 text-[#FF3B30] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {user.whatsapp && (
                              <a
                                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-[#25D366] hover:underline"
                              >
                                <Phone className="h-2.5 w-2.5" />
                                {user.whatsapp}
                              </a>
                            )}
                            {user.strikes > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] flex items-center gap-1 h-5"
                              >
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {user.strikes} strike{user.strikes > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Eye className="h-4 w-4 text-zinc-400" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSelectUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddStrike(user.id)}>
                                Agregar Strike
                              </DropdownMenuItem>
                              {user.strikes > 0 && (
                                <DropdownMenuItem onClick={() => handleRemoveStrike(user.id)}>
                                  Quitar Strike
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleBan(user.id, !user.is_banned)}
                              >
                                {user.is_banned ? 'Desbanear' : 'Banear'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleTogglePremium(
                                    user.id,
                                    user.subscription_tier !== 'PREMIUM'
                                  )
                                }
                              >
                                {user.subscription_tier === 'PREMIUM'
                                  ? 'Quitar Premium'
                                  : 'Dar Premium'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id, user.nombre)}
                                className="text-[#FF3B30] focus:text-[#FF3B30]"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>

      {users.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {users.length} usuario{users.length !== 1 ? 's' : ''} en total
        </p>
      )}

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-[#141414] border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${POSITION_COLORS[selectedUser?.posicion || 'PILOT']} flex items-center justify-center`}>
                <span className="text-lg font-bold text-white">
                  {selectedUser?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span>{selectedUser?.nombre}</span>
                  {selectedUser?.subscription_tier === 'PREMIUM' && (
                    <Crown className="h-4 w-4 text-[#00ff88]" />
                  )}
                  {selectedUser?.is_banned && (
                    <Ban className="h-4 w-4 text-[#FF3B30]" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-normal">{selectedUser?.posicion} • {selectedUser?.categoria}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#25D366]" />
                  <div>
                    <p className="text-xs text-zinc-500">WhatsApp</p>
                    {selectedUser.whatsapp ? (
                      <a
                        href={`https://wa.me/${selectedUser.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#25D366] hover:underline"
                      >
                        {selectedUser.whatsapp}
                      </a>
                    ) : (
                      <p className="text-sm text-zinc-500">No registrado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Miembro desde</p>
                    <p className="text-sm">
                      {format(new Date(selectedUser.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Suscripción</p>
                  <Badge variant={selectedUser.subscription_tier === 'PREMIUM' ? 'default' : 'secondary'}>
                    {selectedUser.subscription_tier === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Estado</p>
                  <Badge variant={selectedUser.is_banned ? 'destructive' : 'outline'}>
                    {selectedUser.is_banned ? '🚫 Baneado' : '✅ Activo'}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Strikes</p>
                  <p className="text-lg font-bold text-[#fafafa]">
                    {selectedUser.strikes} / 3
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Rol</p>
                  <p className="text-sm font-medium text-[#fafafa]">
                    {selectedUser.role}
                  </p>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Role Editor */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-medium">Cambiar Rol</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-1">Categoría</p>
                    <Select
                      value={editCategoria}
                      onValueChange={(value) => {
                        setEditCategoria(value)
                        // Reset position when category changes
                        const firstPos = POSICION_BY_CATEGORIA[value]?.[0]?.value
                        if (firstPos) setEditPosicion(firstPos)
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIA_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-1">Posición</p>
                    <Select
                      value={editPosicion}
                      onValueChange={setEditPosicion}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(POSICION_BY_CATEGORIA[editCategoria] || []).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(editCategoria !== selectedUser.categoria || editPosicion !== selectedUser.posicion) && (
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleUpdateUserRole}
                    disabled={isUpdatingRole}
                  >
                    {isUpdatingRole ? 'Guardando...' : 'Guardar Cambio de Rol'}
                  </Button>
                )}
              </div>

              <Separator className="bg-zinc-800" />

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleAddStrike(selectedUser.id)
                    setSelectedUser(null)
                  }}
                >
                  + Strike
                </Button>
                {selectedUser.strikes > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleRemoveStrike(selectedUser.id)
                      setSelectedUser(null)
                    }}
                  >
                    - Strike
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggleBan(selectedUser.id, !selectedUser.is_banned)
                    setSelectedUser(null)
                  }}
                >
                  {selectedUser.is_banned ? 'Desbanear' : 'Banear'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleTogglePremium(selectedUser.id, selectedUser.subscription_tier !== 'PREMIUM')
                    setSelectedUser(null)
                  }}
                >
                  {selectedUser.subscription_tier === 'PREMIUM' ? 'Quitar Premium' : 'Dar Premium'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteUser(selectedUser.id, selectedUser.nombre)
                    setSelectedUser(null)
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
