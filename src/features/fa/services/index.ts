'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { FALog, FALogFormData, Incident, IncidentFormData } from '../types'

export async function getFALogs(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: FALog[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('fa_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as FALog[], error: null }
}

export async function createFALog(
  formData: FALogFormData
): Promise<{ data: FALog | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('fa_logs') as any)
    .insert({
      user_id: user.id,
      date: formData.date,
      flight_number: formData.flight_number.toUpperCase(),
      aircraft_type: formData.aircraft_type,
      aircraft_registration: formData.aircraft_registration.toUpperCase(),
      origin: formData.origin.toUpperCase(),
      destination: formData.destination.toUpperCase(),
      captain: formData.captain || null,
      copilot: formData.copilot || null,
      entry_time: formData.entry_time || null,
      release_time: formData.release_time || null,
      boarding_time: formData.boarding_time || null,
      first_pax_time: formData.first_pax_time || null,
      last_pax_time: formData.last_pax_time || null,
      door_close_time: formData.door_close_time || null,
      bar_set_number: formData.bar_set_number || null,
      fleje_color: formData.fleje_color || null,
      cash_folio: formData.cash_folio || null,
      sales_mxn: formData.sales_mxn || 0,
      sales_usd: formData.sales_usd || 0,
      sales_card: formData.sales_card || 0,
      sync_status: 'synced',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as FALog, error: null }
}

export async function updateFALog(
  id: string,
  updates: Partial<FALog>
): Promise<{ data: FALog | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('fa_logs') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as FALog, error: null }
}

export async function createIncident(
  formData: IncidentFormData,
  flightId?: string
): Promise<{ data: Incident | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('incidents') as any)
    .insert({
      user_id: user.id,
      flight_id: flightId || null,
      type: formData.type,
      description: formData.description,
      actions_taken: formData.actions_taken || null,
      witnesses: formData.witnesses || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Incident, error: null }
}

export async function getIncidents(
  userId: string
): Promise<{ data: Incident[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Incident[], error: null }
}
