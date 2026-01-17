'use client'

import { useEffect, useState } from 'react'
import { Search, Ban, Crown, AlertTriangle, MoreVertical, ChevronDown, Users, Trash2 } from 'lucide-react'
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
import { getUsers, addStrike, removeStrike, toggleBan, setUserPremium, deleteUser } from '../services'
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

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<AdminFilters>({})
  const [search, setSearch] = useState('')
  const [expandedPositions, setExpandedPositions] = useState<string[]>([])

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
                      <div className="flex items-center justify-between">
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
                          {user.strikes > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] mt-1 flex items-center gap-1 w-fit"
                            >
                              <AlertTriangle className="h-2.5 w-2.5" />
                              {user.strikes} strike{user.strikes > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
    </div>
  )
}
