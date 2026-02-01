'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { Aviso, AvisoFormData, AvisoFilters, CiudadCode } from '../types'

export async function getAvisos(
  filters: AvisoFilters
): Promise<{ data: Aviso[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('avisos_ocasion')
    .select(`
      *,
      created_by_user:users!avisos_ocasion_created_by_fkey(nombre, role, empresa)
    `)
    .eq('activo', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (filters.ciudad_code) {
    query = query.eq('ciudad_code', filters.ciudad_code)
  }

  if (filters.categoria) {
    query = query.eq('categoria', filters.categoria)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching avisos:', error)
    return { data: null, error: error.message }
  }

  return { data: data as Aviso[], error: null }
}

export async function getAvisosByCiudad(
  ciudadCode: CiudadCode
): Promise<{ data: Aviso[] | null; error: string | null }> {
  return getAvisos({ ciudad_code: ciudadCode })
}

export async function getAvisoById(
  id: string
): Promise<{ data: Aviso | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('avisos_ocasion')
    .select(`
      *,
      created_by_user:users!avisos_ocasion_created_by_fkey(nombre, role, empresa)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Aviso, error: null }
}

export async function createAviso(
  formData: AvisoFormData
): Promise<{ data: Aviso | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'No autenticado' }
  }

  const insertData = {
    ciudad_code: formData.ciudad_code,
    categoria: formData.categoria,
    titulo: formData.titulo,
    descripcion: formData.descripcion,
    precio: formData.precio || null,
    moneda: formData.moneda || 'MXN',
    whatsapp: formData.whatsapp || null,
    telefono: formData.telefono || null,
    // Campos para inmuebles y roomie
    direccion: formData.direccion || null,
    direccion_lat: formData.direccion_lat || null,
    direccion_lng: formData.direccion_lng || null,
    fecha_disponibilidad: formData.fecha_disponibilidad || null,
    // Campos para inmuebles
    tipo_inmueble: formData.tipo_inmueble || null,
    tiene_cochera: formData.tiene_cochera ?? null,
    // Campos para roomie e inmuebles
    acepta_mascotas: formData.acepta_mascotas ?? null,
    servicios_incluidos: formData.servicios_incluidos || [],
    precio_todo_incluido: formData.precio_todo_incluido || false,
    // Campo general (excepto inmuebles)
    servicio_domicilio: formData.servicio_domicilio || false,
    // Campos para taxi seguro
    nombre_conductor: formData.nombre_conductor || null,
    tipo_auto_taxi: formData.tipo_auto_taxi || null,
    // Página web y permanente
    pagina_web: formData.pagina_web || null,
    solicita_permanente: formData.solicita_permanente || false,
    created_by: user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('avisos_ocasion')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating aviso:', error)
    return { data: null, error: error.message }
  }

  // Send admin notification if requesting permanent
  if (formData.solicita_permanente) {
    const userName = user.user_metadata?.nombre || user.email || 'Usuario'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('admin_notifications').insert({
      event_type: 'aviso_permanente_request',
      title: 'Solicitud de aviso permanente',
      message: `${userName} solicita que su aviso "${formData.titulo}" en ${formData.ciudad_code} sea permanente.`,
      user_id: user.id,
      user_name: userName,
      metadata: {
        aviso_id: (data as Aviso).id,
        ciudad_code: formData.ciudad_code,
        categoria: formData.categoria,
        titulo: formData.titulo,
      },
    }).then(({ error: notifError }: { error: { message: string } | null }) => {
      if (notifError) console.error('Error sending admin notification:', notifError)
    })
  }

  return { data: data as Aviso, error: null }
}

export async function updateAviso(
  id: string,
  formData: Partial<AvisoFormData>
): Promise<{ data: Aviso | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'No autenticado' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('avisos_ocasion')
    .update(formData)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Aviso, error: null }
}

export async function deleteAviso(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('avisos_ocasion')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function getAvisosCount(
  ciudadCode: CiudadCode
): Promise<{ count: number; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('avisos_ocasion')
    .select('*', { count: 'exact', head: true })
    .eq('ciudad_code', ciudadCode)
    .eq('activo', true)
    .gt('expires_at', new Date().toISOString())

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: count || 0, error: null }
}
