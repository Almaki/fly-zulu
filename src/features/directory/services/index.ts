'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { DirectoryEntry, DirectoryEntryFormData, DirectoryFilters } from '../types'

export async function getDirectoryEntries(
  filters?: DirectoryFilters
): Promise<{ data: DirectoryEntry[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('directory_entries')
    .select('*')
    .order('rating', { ascending: false })

  if (filters?.airport) {
    query = query.eq('airport_code', filters.airport.toUpperCase())
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as DirectoryEntry[], error: null }
}

export async function createDirectoryEntry(
  formData: DirectoryEntryFormData
): Promise<{ data: DirectoryEntry | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Check if user is FLIGHT (PILOT or FA)
  const { data: profileData } = await supabase
    .from('users')
    .select('categoria')
    .eq('id', user.id)
    .single()

  const profile = profileData as { categoria: string } | null
  if (!profile || profile.categoria !== 'FLIGHT') {
    return { data: null, error: 'Solo tripulación FLIGHT puede agregar entradas' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('directory_entries') as any)
    .insert({
      ...formData,
      airport_code: formData.airport_code.toUpperCase(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as DirectoryEntry, error: null }
}

export async function rateDirectoryEntry(
  entryId: string,
  rating: number
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Get current entry
  const { data: entryData } = await supabase
    .from('directory_entries')
    .select('rating, rating_count')
    .eq('id', entryId)
    .single()

  const entry = entryData as { rating: number; rating_count: number } | null
  if (!entry) {
    return { error: 'Entrada no encontrada' }
  }

  // Calculate new average
  const newCount = entry.rating_count + 1
  const newRating = ((entry.rating * entry.rating_count) + rating) / newCount

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('directory_entries') as any)
    .update({
      rating: Math.round(newRating * 10) / 10,
      rating_count: newCount,
    })
    .eq('id', entryId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
