'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import { FIDS_RETENTION } from '@/shared/constants'
import type { Flight, FlightFormData, FIDSFilters } from '../types'

export async function getFlights(filters?: FIDSFilters): Promise<{ data: Flight[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // Calculate retention window: -3 hours to +24 hours
  const now = new Date()
  const pastLimit = new Date(now.getTime() - FIDS_RETENTION.PAST_HOURS * 60 * 60 * 1000)
  const futureLimit = new Date(now.getTime() + FIDS_RETENTION.FUTURE_HOURS * 60 * 60 * 1000)

  let query = supabase
    .from('flights')
    .select('*')
    .is('archived_at', null)
    .gte('std', pastLimit.toISOString())
    .lte('std', futureLimit.toISOString())
    .order('std', { ascending: true })

  // Apply filters
  if (filters?.airport) {
    if (filters.direction === 'departures') {
      query = query.eq('origin', filters.airport)
    } else if (filters.direction === 'arrivals') {
      query = query.eq('destination', filters.airport)
    } else {
      query = query.or(`origin.eq.${filters.airport},destination.eq.${filters.airport}`)
    }
  }

  if (filters?.airline) {
    query = query.eq('airline', filters.airline)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Flight[], error: null }
}

export async function createFlight(formData: FlightFormData): Promise<{ data: Flight | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Check if user is PREMIUM or SUPERADMIN
  const { data: profileData } = await supabase
    .from('users')
    .select('subscription_tier, role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { subscription_tier: string; role: string } | null
  if (!profile || (profile.subscription_tier !== 'PREMIUM' && profile.role !== 'SUPERADMIN')) {
    return { data: null, error: 'Se requiere suscripción Premium para agregar vuelos' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('flights') as any)
    .insert({
      ...formData,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Flight, error: null }
}

export async function updateFlight(
  id: string,
  updates: Partial<Flight>
): Promise<{ data: Flight | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Check if user is PREMIUM or SUPERADMIN
  const { data: profileData } = await supabase
    .from('users')
    .select('subscription_tier, role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { subscription_tier: string; role: string } | null
  if (!profile || (profile.subscription_tier !== 'PREMIUM' && profile.role !== 'SUPERADMIN')) {
    return { data: null, error: 'Se requiere suscripción Premium para editar vuelos' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('flights') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Flight, error: null }
}

export async function updateFlightStatus(
  id: string,
  status: Flight['status'],
  delayMinutes?: number,
  delayReason?: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const updates: Record<string, unknown> = { status }

  if (status === 'DELAY' && delayMinutes !== undefined) {
    updates.delay_minutes = delayMinutes
    updates.delay_reason = delayReason || null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('flights') as any)
    .update(updates)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Archive flights older than retention window (called by cron)
export async function archiveOldFlights(): Promise<{ count: number; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const pastLimit = new Date(Date.now() - FIDS_RETENTION.PAST_HOURS * 60 * 60 * 1000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('flights') as any)
    .update({ archived_at: new Date().toISOString() })
    .is('archived_at', null)
    .lt('std', pastLimit.toISOString())
    .select('id')

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: data?.length || 0, error: null }
}
