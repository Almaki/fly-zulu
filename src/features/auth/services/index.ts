'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { RegisterFormData } from '../types'
import type { User } from '@/shared/types'

type AuthResult = { data: User | null; error: string | null }

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { data: null, error: error.message }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if ((profile as User | null)?.is_banned) {
    await supabase.auth.signOut()
    return { data: null, error: 'Tu cuenta ha sido suspendida' }
  }

  // Update last IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('users') as any)
    .update({ last_ip: ip })
    .eq('id', data.user.id)

  return { data: profile as User | null, error: null }
}

export async function register(formData: Omit<RegisterFormData, 'confirmPassword' | 'terminos' | 'privacidad' | 'cookies'>): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()
  const serviceClient = await createServiceRoleClient()

  // Check if email exists
  const { data: existingEmail } = await serviceClient
    .from('users')
    .select('id')
    .eq('email', formData.email)
    .single()

  if (existingEmail) {
    return { data: null, error: 'Este email ya está registrado' }
  }

  // Check if whatsapp exists
  const { data: existingWhatsapp } = await serviceClient
    .from('users')
    .select('id')
    .eq('whatsapp', formData.whatsapp)
    .single()

  if (existingWhatsapp) {
    return { data: null, error: 'Este WhatsApp ya está registrado' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  })

  if (authError) {
    return { data: null, error: authError.message }
  }

  if (!authData.user) {
    return { data: null, error: 'Error al crear usuario' }
  }

  // Get IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // Create user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileError } = await (serviceClient.from('users') as any)
    .insert({
      id: authData.user.id,
      email: formData.email,
      nombre: formData.nombre,
      whatsapp: formData.whatsapp,
      categoria: formData.categoria,
      posicion: formData.posicion,
      last_ip: ip,
    })
    .select()
    .single()

  if (profileError) {
    // Rollback: delete auth user
    await serviceClient.auth.admin.deleteUser(authData.user.id)
    return { data: null, error: 'Error al crear perfil: ' + profileError.message }
  }

  return { data: profile as User, error: null }
}

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as User | null
}

export async function updateProfile(userId: string, updateData: { nombre?: string }): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase.from('users') as any)
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: profile as User, error: null }
}
