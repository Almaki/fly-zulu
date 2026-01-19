'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { DirectoryEntry, DirectoryEntryFormData, DirectoryFilters } from '../types'

export async function getDirectoryEntries(
  filters?: DirectoryFilters
): Promise<{ data: DirectoryEntry[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('directory_entries')
    .select(`
      *,
      created_by_user:users!directory_entries_created_by_fkey(nombre),
      updated_by_user:users!directory_entries_updated_by_fkey(nombre)
    `)
    .order('rating', { ascending: false })

  if (filters?.airport) {
    query = query.eq('airport_code', filters.airport.toUpperCase())
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    // Search in both name and description
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
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
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return { data: null, error: 'Error de autenticación' }
    }

    if (!user) {
      return { data: null, error: 'No autenticado' }
    }

    // Check if user is FLIGHT (PILOT or FA) or SUPERADMIN
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('categoria, role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return { data: null, error: 'Error al verificar perfil' }
    }

    const profile = profileData as { categoria: string; role: string } | null
    if (!profile || (profile.categoria !== 'FLIGHT' && profile.role !== 'SUPERADMIN')) {
      return { data: null, error: 'Solo tripulación FLIGHT puede agregar entradas' }
    }

    // Extract initial_rating from form data
    const { initial_rating, ...entryData } = formData

    // Convert empty strings to null for optional fields
    // Note: phone is optional (nullable in DB), whatsapp is the primary contact
    const insertData = {
      airport_code: entryData.airport_code.toUpperCase(),
      category: entryData.category,
      name: entryData.name,
      description: entryData.description || null,
      phone: entryData.phone || null,
      whatsapp: entryData.whatsapp || null,
      address: entryData.address || null,
      created_by: user.id,
      rating: initial_rating || 0,
      rating_count: initial_rating ? 1 : 0,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('directory_entries')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return { data: null, error: error.message }
    }

    return { data: data as DirectoryEntry, error: null }
  } catch (err) {
    console.error('Unexpected error in createDirectoryEntry:', err)
    return { data: null, error: 'Error inesperado al crear contacto' }
  }
}

export async function updateDirectoryEntry(
  entryId: string,
  formData: DirectoryEntryFormData
): Promise<{ data: DirectoryEntry | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return { data: null, error: 'Error de autenticación' }
    }

    if (!user) {
      return { data: null, error: 'No autenticado' }
    }

    // Remove initial_rating from form data (not used in updates)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initial_rating, ...updateData } = formData

    // Convert empty strings to null for optional fields
    const cleanedData = {
      airport_code: updateData.airport_code.toUpperCase(),
      category: updateData.category,
      name: updateData.name,
      description: updateData.description || null,
      phone: updateData.phone || null,
      whatsapp: updateData.whatsapp || null,
      address: updateData.address || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('directory_entries')
      .update(cleanedData)
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return { data: null, error: error.message }
    }

    return { data: data as DirectoryEntry, error: null }
  } catch (err) {
    console.error('Unexpected error in updateDirectoryEntry:', err)
    return { data: null, error: 'Error inesperado al actualizar contacto' }
  }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entryData } = await (supabase as any)
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
  const { error } = await (supabase as any)
    .from('directory_entries')
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
