'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { PilotLog, MCDUEntryFormData } from '../types'

export async function getPilotLogs(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: PilotLog[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('pilot_logs')
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

  return { data: data as PilotLog[], error: null }
}

export async function getTodayLog(
  userId: string
): Promise<{ data: PilotLog | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pilot_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as PilotLog | null, error: null }
}

export async function createPilotLog(
  formData: MCDUEntryFormData
): Promise<{ data: PilotLog | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Calculate times
  const outMinutes = timeToMinutes(formData.out_time)
  const offMinutes = timeToMinutes(formData.off_time)
  const onMinutes = timeToMinutes(formData.on_time)
  const inMinutes = timeToMinutes(formData.in_time)

  // Handle overnight flights
  let flightTime = onMinutes - offMinutes
  if (flightTime < 0) flightTime += 24 * 60

  let blockTime = inMinutes - outMinutes
  if (blockTime < 0) blockTime += 24 * 60

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('pilot_logs') as any)
    .insert({
      user_id: user.id,
      date: formData.date,
      tail: formData.tail.toUpperCase(),
      aircraft_type: formData.aircraft_type,
      dep: formData.dep.toUpperCase(),
      dest: formData.dest.toUpperCase(),
      out_time: formData.out_time,
      off_time: formData.off_time,
      on_time: formData.on_time,
      in_time: formData.in_time,
      notes: formData.notes || null,
      sync_status: 'synced',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as PilotLog, error: null }
}

export async function updatePilotLog(
  id: string,
  updates: Partial<PilotLog>
): Promise<{ data: PilotLog | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('pilot_logs') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as PilotLog, error: null }
}

export async function updateDutyTime(
  logId: string,
  dutyStart: string,
  dutyEnd?: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  let dutyTimeMinutes: number | null = null

  if (dutyStart && dutyEnd) {
    const startMinutes = timeToMinutes(dutyStart)
    let endMinutes = timeToMinutes(dutyEnd)

    // Handle overnight
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    dutyTimeMinutes = endMinutes - startMinutes
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('pilot_logs') as any)
    .update({
      duty_start: dutyStart,
      duty_end: dutyEnd || null,
      duty_time_minutes: dutyTimeMinutes,
    })
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Helper function
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
