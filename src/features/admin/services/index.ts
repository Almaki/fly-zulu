'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/shared/lib/supabase/server'
import type { AdminMetrics, AdminFilters } from '../types'
import type { User } from '@/shared/types'

async function checkSuperAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { authorized: false, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role
  if (userRole !== 'SUPERADMIN') {
    return { authorized: false, error: 'No autorizado' }
  }

  return { authorized: true, error: null }
}

export async function getAdminMetrics(): Promise<{
  data: AdminMetrics | null
  error: string | null
}> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // Get user counts
  const { data: usersData } = await supabase.from('users').select('*')
  const users = usersData as User[] | null

  if (!users) {
    return { data: null, error: 'Error obteniendo usuarios' }
  }

  const totalUsers = users.length
  const premiumUsers = users.filter((u) => u.subscription_tier === 'PREMIUM').length
  const freeUsers = totalUsers - premiumUsers
  const bannedUsers = users.filter((u) => u.is_banned).length
  const activeUsers = totalUsers - bannedUsers

  // Users by role
  const usersByRole: Record<string, number> = {}
  users.forEach((u) => {
    usersByRole[u.posicion] = (usersByRole[u.posicion] || 0) + 1
  })

  // Today's flights
  const today = new Date().toISOString().split('T')[0]
  const { count: flightsToday } = await supabase
    .from('flights')
    .select('*', { count: 'exact', head: true })
    .gte('std', `${today}T00:00:00`)
    .lte('std', `${today}T23:59:59`)

  // Users active in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: activeUsersData } = await supabase
    .from('users')
    .select('id, nombre, last_seen_at, last_location')
    .gte('last_seen_at', oneHourAgo)
    .order('last_seen_at', { ascending: false })

  const usersLastHour = (activeUsersData || []) as Array<{
    id: string
    nombre: string
    last_seen_at: string
    last_location: string | null
  }>

  const metrics: AdminMetrics = {
    totalUsers,
    activeUsers,
    premiumUsers,
    freeUsers,
    usersByRole,
    flightsToday: flightsToday || 0,
    conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
    usersLastHour: usersLastHour.length,
    recentUsers: usersLastHour.slice(0, 10),
  }

  return { data: metrics, error: null }
}

export async function getUsers(
  filters?: AdminFilters
): Promise<{ data: User[] | null; error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  let query = supabase.from('users').select('*').order('created_at', { ascending: false })

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('posicion', filters.role)
  }

  if (filters?.status === 'banned') {
    query = query.eq('is_banned', true)
  } else if (filters?.status === 'active') {
    query = query.eq('is_banned', false)
  }

  if (filters?.subscription && filters.subscription !== 'all') {
    query = query.eq('subscription_tier', filters.subscription)
  }

  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as User[], error: null }
}

export async function addStrike(
  userId: string
): Promise<{ data: User | null; error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // Get current strikes
  const { data: userData } = await supabase
    .from('users')
    .select('strikes')
    .eq('id', userId)
    .single()

  const user = userData as { strikes: number } | null
  if (!user) {
    return { data: null, error: 'Usuario no encontrado' }
  }

  const newStrikes = user.strikes + 1
  const isBanned = newStrikes >= 3

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .update({
      strikes: newStrikes,
      is_banned: isBanned,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as User, error: null }
}

export async function removeStrike(
  userId: string
): Promise<{ data: User | null; error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  const { data: userData } = await supabase
    .from('users')
    .select('strikes')
    .eq('id', userId)
    .single()

  const user = userData as { strikes: number } | null
  if (!user) {
    return { data: null, error: 'Usuario no encontrado' }
  }

  const newStrikes = Math.max(0, user.strikes - 1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('users') as any)
    .update({
      strikes: newStrikes,
      is_banned: false,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as User, error: null }
}

export async function toggleBan(
  userId: string,
  ban: boolean
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ is_banned: ban })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function setUserPremium(
  userId: string,
  isPremium: boolean
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  const updates: Record<string, unknown> = {
    subscription_tier: isPremium ? 'PREMIUM' : 'FREE',
  }

  if (isPremium) {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 1)
    updates.subscription_expires_at = expires.toISOString()
  } else {
    updates.subscription_expires_at = null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any).update(updates).eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function deleteUser(
  userId: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Delete user from users table (auth user remains but profile is deleted)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .delete()
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function deleteDirectoryEntry(
  entryId: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('directory_entries') as any)
    .delete()
    .eq('id', entryId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
