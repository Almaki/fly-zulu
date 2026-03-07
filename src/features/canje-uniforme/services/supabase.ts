/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/shared/lib/supabase'
import type { Publicacion, Mensaje, Base, Tipo, Prenda, Genero } from '../types'

// Las tablas canje_* no están en los tipos generados aún, se usa cast seguro
function db() {
  return createClient() as any
}

export async function obtenerPublicaciones(): Promise<Publicacion[]> {
  const { data, error } = await db()
    .from('canje_publicaciones')
    .select('*')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Publicacion[]
}

export async function existePublicacionActiva(params: {
  numero_rol: string
  tipo: Tipo
  prenda: Prenda
  talla: string
  genero: Genero
}): Promise<boolean> {
  const { data } = await db()
    .from('canje_publicaciones')
    .select('id')
    .eq('numero_rol', params.numero_rol)
    .eq('tipo', params.tipo)
    .eq('prenda', params.prenda)
    .eq('talla', params.talla)
    .eq('genero', params.genero)
    .eq('estado', 'activo')
    .limit(1)

  return (data?.length ?? 0) > 0
}

export async function crearPublicacion(pub: {
  numero_rol: string
  base: Base
  tipo: Tipo
  prenda: Prenda
  talla: string
  talla_alternativa?: string
  genero: Genero
  cantidad: number
  comentario?: string
  en_pool: boolean
}): Promise<Publicacion> {
  const { data, error } = await db()
    .from('canje_publicaciones')
    .insert(pub)
    .select()
    .single()

  if (error) throw error
  return data as Publicacion
}

// Marca AMBAS publicaciones del match con el numero_rol del piloto.
// Cuando cada pub acumula los 2 roles, se marca como 'resuelto'.
export async function marcarResueltoMatch(
  tengoId: string,
  requieroId: string,
  numero_rol: string
): Promise<void> {
  await marcarUna(tengoId, numero_rol)
  await marcarUna(requieroId, numero_rol)
}

async function marcarUna(id: string, numero_rol: string): Promise<void> {
  const { data: pub, error: fetchError } = await db()
    .from('canje_publicaciones')
    .select('resuelto_por')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const yaResueltos: string[] = pub?.resuelto_por ?? []
  if (yaResueltos.includes(numero_rol)) return

  const nuevos = [...yaResueltos, numero_rol]
  const estadoFinal = nuevos.length >= 2 ? 'resuelto' : 'activo'

  const { error } = await db()
    .from('canje_publicaciones')
    .update({ resuelto_por: nuevos, estado: estadoFinal })
    .eq('id', id)

  if (error) throw error
}

export async function eliminarPublicacion(id: string): Promise<void> {
  const { error } = await db()
    .from('canje_publicaciones')
    .update({ estado: 'resuelto' })
    .eq('id', id)

  if (error) throw error
}

// Cancela el match de UNA publicación: limpia resuelto_por para que vuelva al tablero activo
export async function cancelarMatchPublicacion(id: string): Promise<void> {
  const { error } = await db()
    .from('canje_publicaciones')
    .update({ resuelto_por: [] })
    .eq('id', id)
    .eq('estado', 'activo')

  if (error) throw error
}

export async function obtenerMensajes(chat_key: string): Promise<Mensaje[]> {
  const { data, error } = await db()
    .from('canje_mensajes')
    .select('*')
    .eq('chat_key', chat_key)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Mensaje[]
}

export async function enviarMensaje(msg: {
  chat_key: string
  numero_rol: string
  mensaje: string
}): Promise<void> {
  const { error } = await db().from('canje_mensajes').insert(msg)
  if (error) throw error
}

export function buildChatKey(id1: string, id2: string): string {
  return [id1, id2].sort().join('_')
}
