'use client'

import { useEffect, useState } from 'react'
import { Search, Ban, Crown, AlertTriangle, MoreVertical } from 'lucide-react'
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
import { getUsers, addStrike, removeStrike, toggleBan, setUserPremium } from '../services'
import type { User } from '@/shared/types'
import type { AdminFilters } from '../types'

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<AdminFilters>({})
  const [search, setSearch] = useState('')

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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select
          value={filters.role || 'all'}
          onValueChange={(v) => handleFilterChange('role', v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
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

      {/* Users list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-zinc-800" />
          ))
        ) : users.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="py-8 text-center text-zinc-500">
              No se encontraron usuarios
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card
              key={user.id}
              className={`border-zinc-800 bg-zinc-900/50 ${user.is_banned ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.nombre}</span>
                      {user.subscription_tier === 'PREMIUM' && (
                        <Crown className="h-4 w-4 text-[#00ff88]" />
                      )}
                      {user.is_banned && (
                        <Ban className="h-4 w-4 text-[#FF3B30]" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.posicion}
                      </Badge>
                      {user.strikes > 0 && (
                        <Badge
                          variant="destructive"
                          className="text-xs flex items-center gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {user.strikes} strike{user.strikes > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {users.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {users.length} usuario{users.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
