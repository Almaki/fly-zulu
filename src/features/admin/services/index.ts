'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/shared/lib/supabase/server'
import type { AdminMetrics, AdminFilters, CityUser, CityUsersData } from '../types'
import type { User, CiudadBase } from '@/shared/types'

async function checkSuperAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { authorized: false, error: 'No autenticado - Inicia sesión primero' }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { authorized: false, error: `Error obteniendo perfil: ${profileError.message}` }
  }

  const userRole = (profile as { role: string; email: string } | null)?.role
  if (userRole !== 'SUPERADMIN') {
    return { authorized: false, error: `No autorizado - Tu rol es "${userRole || 'sin rol'}"` }
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
  const { error, count } = await (supabase.from('users') as any)
    .update({ is_banned: ban }, { count: 'exact' })
    .eq('id', userId)

  if (error) {
    return { error: `Error actualizando usuario: ${error.message}` }
  }

  if (count === 0) {
    return { error: 'No se pudo actualizar el usuario - verifica que existe' }
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
  const { error, count } = await (supabase.from('users') as any)
    .update(updates, { count: 'exact' })
    .eq('id', userId)

  if (error) {
    return { error: `Error actualizando suscripción: ${error.message}` }
  }

  if (count === 0) {
    return { error: 'No se pudo actualizar el usuario - verifica que existe' }
  }

  return { error: null }
}

export async function deleteUser(
  userId: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // First verify user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, nombre')
    .eq('id', userId)
    .single()

  if (!existingUser) {
    return { error: 'Usuario no encontrado' }
  }

  // Delete user from users table first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError, count } = await (supabase.from('users') as any)
    .delete({ count: 'exact' })
    .eq('id', userId)

  if (profileError) {
    return { error: `Error eliminando perfil: ${profileError.message}` }
  }

  if (count === 0) {
    return { error: 'No se pudo eliminar el perfil - verifica permisos RLS' }
  }

  // Now delete the auth user completely so they can't login
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    // Profile was deleted but auth user remains - log but don't fail
    console.error(`Error eliminando auth user ${userId}:`, authError.message)
    // User won't be able to use the app anyway since profile is gone
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

export async function updateUserRole(
  userId: string,
  categoria: 'FLIGHT' | 'GROUND',
  posicion: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Validate position based on categoria
  const validPositions = categoria === 'FLIGHT'
    ? ['PILOT', 'FA']
    : ['OPS', 'TRAFICO', 'MANTTO']

  if (!validPositions.includes(posicion)) {
    return { error: `Posición inválida para categoría ${categoria}` }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, count } = await (supabase.from('users') as any)
    .update({
      categoria,
      posicion,
    }, { count: 'exact' })
    .eq('id', userId)

  if (error) {
    return { error: `Error actualizando rol: ${error.message}` }
  }

  if (count === 0) {
    return { error: 'No se pudo actualizar el usuario - verifica que existe' }
  }

  return { error: null }
}

// =====================================================
// INVITACIONES
// =====================================================

export interface InviteUserData {
  email: string
  categoria: 'FLIGHT' | 'GROUND'
  posicion: string
  nombre?: string
}

export async function inviteUser(
  data: InviteUserData
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Validar posición según categoría
  const validPositions = data.categoria === 'FLIGHT'
    ? ['PILOT', 'FA']
    : ['OPS', 'TRAFICO', 'MANTTO']

  if (!validPositions.includes(data.posicion)) {
    return { error: `Posición inválida para categoría ${data.categoria}` }
  }

  // Verificar si el email ya existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', data.email.toLowerCase())
    .single()

  if (existingUser) {
    return { error: 'Este email ya está registrado en el sistema' }
  }

  // Generar invitación usando Supabase Auth Admin
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        nombre: data.nombre || '',
        categoria: data.categoria,
        posicion: data.posicion,
        invited_by_admin: true
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://flyzulu.vercel.app'}/auth/callback`
    }
  )

  if (inviteError) {
    return { error: `Error enviando invitación: ${inviteError.message}` }
  }

  return { error: null }
}

export async function generateMagicLink(
  email: string
): Promise<{ error: string | null; link?: string }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Verificar si el usuario existe
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, nombre')
    .eq('email', email.toLowerCase())
    .single()

  if (!existingUser) {
    return { error: 'Este email no está registrado. Usa "Invitar Usuario" para nuevos usuarios.' }
  }

  // Generar magic link
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://flyzulu.vercel.app'}/auth/callback`
    }
  })

  if (linkError) {
    return { error: `Error generando link: ${linkError.message}` }
  }

  return {
    error: null,
    link: linkData.properties.action_link
  }
}

// =====================================================
// AVISOS PERMANENTES
// =====================================================

export interface PendingAviso {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  ciudad_code: string
  precio: number | null
  moneda: string
  whatsapp: string | null
  telefono: string | null
  email: string | null
  pagina_web: string | null
  solicita_permanente: boolean
  created_at: string
  expires_at: string
  created_by_user?: {
    nombre: string
    role: string
    empresa: string | null
  }
}

export async function getPendingPermanentAvisos(): Promise<{
  data: PendingAviso[] | null
  error: string | null
}> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('avisos_ocasion')
    .select('*, created_by_user:users!avisos_ocasion_created_by_fkey(nombre, posicion, empresa)')
    .eq('solicita_permanente', true)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  // Map posicion to role for display
  const mapped = (data || []).map((a: Record<string, unknown>) => ({
    ...a,
    created_by_user: a.created_by_user ? {
      ...(a.created_by_user as Record<string, unknown>),
      role: (a.created_by_user as Record<string, string>).posicion
    } : undefined
  }))

  return { data: mapped as PendingAviso[], error: null }
}

export async function approvePermanentAviso(
  avisoId: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Set expires_at to 10 years from now (effectively permanent)
  const permanentDate = new Date()
  permanentDate.setFullYear(permanentDate.getFullYear() + 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('avisos_ocasion')
    .update({ expires_at: permanentDate.toISOString() })
    .eq('id', avisoId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function rejectPermanentAviso(
  avisoId: string
): Promise<{ error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  // Remove the permanent request flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('avisos_ocasion')
    .update({ solicita_permanente: false })
    .eq('id', avisoId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// USERS BY CITY MAP
// =====================================================

const CIUDADES_INFO: Record<CiudadBase, { city: string; state: string; lat: number; lng: number }> = {
  TIJ: { city: 'Tijuana', state: 'BC', lat: 32.5411, lng: -116.9706 },
  BJX: { city: 'León/Bajío', state: 'GTO', lat: 20.9935, lng: -101.4806 },
  GDL: { city: 'Guadalajara', state: 'JAL', lat: 20.5218, lng: -103.3112 },
  MTY: { city: 'Monterrey', state: 'NL', lat: 25.7785, lng: -100.1069 },
  MEX: { city: 'Ciudad de México', state: 'CDMX', lat: 19.4363, lng: -99.0721 },
  CUN: { city: 'Cancún', state: 'QR', lat: 21.0365, lng: -86.8771 },
}

export async function getUsersByCity(): Promise<{
  data: CityUsersData[] | null
  error: string | null
}> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // Get users with activity in last 24 hours or with ciudad_base set
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const { data: usersData, error } = await supabase
    .from('users')
    .select('id, nombre, posicion, empresa, ciudad_base, last_seen_at, last_location')
    .eq('is_banned', false)
    .order('last_seen_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  const users = usersData as Array<{
    id: string
    nombre: string
    posicion: string
    empresa: string | null
    ciudad_base: CiudadBase | null
    last_seen_at: string | null
    last_location: string | null
  }>

  // Group users by city
  const citiesMap = new Map<CiudadBase, CityUser[]>()

  // Initialize all cities
  const allCities: CiudadBase[] = ['TIJ', 'BJX', 'GDL', 'MTY', 'MEX', 'CUN']
  allCities.forEach(city => citiesMap.set(city, []))

  // Assign users to their city
  users.forEach(user => {
    const isOnline = user.last_seen_at ? new Date(user.last_seen_at) >= new Date(fifteenMinutesAgo) : false
    const cityUser: CityUser = {
      id: user.id,
      nombre: user.nombre,
      posicion: user.posicion,
      empresa: user.empresa,
      ciudad_base: user.ciudad_base,
      last_seen_at: user.last_seen_at,
      last_location: user.last_location,
      is_online: isOnline,
    }

    // If user has ciudad_base, use that
    if (user.ciudad_base) {
      citiesMap.get(user.ciudad_base)?.push(cityUser)
    }
  })

  // Build result array
  const result: CityUsersData[] = allCities.map(ciudadCode => {
    const info = CIUDADES_INFO[ciudadCode]
    const cityUsers = citiesMap.get(ciudadCode) || []
    const onlineCount = cityUsers.filter(u => u.is_online).length
    const recentCount = cityUsers.filter(u => {
      if (!u.last_seen_at) return false
      return new Date(u.last_seen_at) >= new Date(twentyFourHoursAgo)
    }).length

    return {
      ciudad_code: ciudadCode,
      city_name: info.city,
      state: info.state,
      lat: info.lat,
      lng: info.lng,
      users: cityUsers,
      online_count: onlineCount,
      recent_count: recentCount,
    }
  })

  return { data: result, error: null }
}
