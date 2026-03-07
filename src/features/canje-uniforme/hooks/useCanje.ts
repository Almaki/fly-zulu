'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/shared/lib/supabase'
import {
  obtenerPublicaciones,
  crearPublicacion,
  marcarResueltoMatch,
  eliminarPublicacion,
  cancelarMatchPublicacion,
  existePublicacionActiva,
  buildChatKey,
} from '../services/supabase'
import type { Publicacion, Match, PilotoActual, Tipo, Prenda, Genero } from '../types'

export function useCanje() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [piloto, setPiloto] = useState<PilotoActual | null>(null)
  const [cargando, setCargando] = useState(true)
  // Guardamos solo el chat_key para evitar estado stale del Match
  const [chatKey, setChatKey] = useState<string | null>(null)

  const cargarPublicaciones = useCallback(async () => {
    try {
      const pubs = await obtenerPublicaciones()
      setPublicaciones(pubs)
    } catch (err) {
      console.error('[Canje] Error cargando publicaciones:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  // Realtime: escuchar cambios en publicaciones
  useEffect(() => {
    cargarPublicaciones()
    const sb = createClient()
    const channel = sb
      .channel('canje_publicaciones_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canje_publicaciones' },
        () => { cargarPublicaciones() })
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [cargarPublicaciones])

  // ─── Calcular matches (memoizado) ────────────────────────────────────────
  const matches = useMemo<Match[]>(() => {
    // Compatibilidad de talla: cualquier combinación principal/alternativa entre las dos pubs
    const tallasMatch = (a: Publicacion, b: Publicacion): boolean => {
      const aOps = [a.talla, a.talla_alternativa].filter((x): x is string => !!x)
      const bOps = [b.talla, b.talla_alternativa].filter((x): x is string => !!x)
      return aOps.some((t) => bOps.includes(t))
    }

    const result: Match[] = []
    const tengo = publicaciones.filter((p) => p.tipo === 'TENGO')
    const requiero = publicaciones.filter((p) => p.tipo === 'REQUIERO')

    // Mapas rápidos para check de reciprocidad
    const tengosPorPiloto = new Map<string, Publicacion[]>()
    const requierosPorPiloto = new Map<string, Publicacion[]>()
    for (const t of tengo) {
      tengosPorPiloto.set(t.numero_rol, [...(tengosPorPiloto.get(t.numero_rol) ?? []), t])
    }
    for (const r of requiero) {
      requierosPorPiloto.set(r.numero_rol, [...(requierosPorPiloto.get(r.numero_rol) ?? []), r])
    }

    const yaAgregados = new Set<string>()

    for (const t of tengo) {
      for (const r of requiero) {
        if (t.numero_rol === r.numero_rol) continue
        if (t.prenda !== r.prenda || t.genero !== r.genero) continue
        if (!tallasMatch(t, r)) continue
        const key = buildChatKey(t.id, r.id)
        if (yaAgregados.has(key)) continue

        const mismo_base = t.base === r.base

        // Match Directo: quien requiere también TIENE algo que el otro requiere (con tallas flexibles)
        const bTienes = tengosPorPiloto.get(r.numero_rol) ?? []
        const aRequiere = requierosPorPiloto.get(t.numero_rol) ?? []
        const esRecíproco = bTienes.some((bt) =>
          aRequiere.some((ar) => ar.prenda === bt.prenda && ar.genero === bt.genero && tallasMatch(ar, bt))
        )

        if (esRecíproco) {
          result.push({ tengo: t, requiero: r, chat_key: key, tipo: 'directo', mismo_base })
          yaAgregados.add(key)
        } else if (t.en_pool) {
          result.push({ tengo: t, requiero: r, chat_key: key, tipo: 'pool', mismo_base })
          yaAgregados.add(key)
        }
      }
    }

    // Prioridad: misma base primero, luego otras bases
    return result.sort((a, b) => {
      if (a.mismo_base && !b.mismo_base) return -1
      if (!a.mismo_base && b.mismo_base) return 1
      // Dentro del mismo grupo: directos antes que pool
      if (a.tipo === 'directo' && b.tipo !== 'directo') return -1
      if (a.tipo !== 'directo' && b.tipo === 'directo') return 1
      return 0
    })
  }, [publicaciones])

  // Match activo del chat (derivado en vivo, nunca stale)
  const chatAbierto = useMemo(
    () => matches.find((m) => m.chat_key === chatKey) ?? null,
    [matches, chatKey]
  )

  // Auto-cierre del chat si el match desaparece (ambos resolvieron)
  useEffect(() => {
    if (chatKey && !chatAbierto) {
      setChatKey(null)
    }
  }, [chatKey, chatAbierto])

  // IDs con match del piloto actual
  const misMatchIds = useMemo(() => {
    const ids = new Set<string>()
    if (!piloto) return ids
    for (const m of matches) {
      if (m.tengo.numero_rol === piloto.numero_rol) ids.add(m.tengo.id)
      if (m.requiero.numero_rol === piloto.numero_rol) ids.add(m.requiero.id)
    }
    return ids
  }, [matches, piloto])

  // ─── Sesión del piloto ────────────────────────────────────────────────────
  const entrarComoPiloto = (data: PilotoActual) => {
    setPiloto(data)
    localStorage.setItem('canje_piloto', JSON.stringify(data))
  }

  const salirSesion = () => {
    setPiloto(null)
    setChatKey(null)
    localStorage.removeItem('canje_piloto')
  }

  useEffect(() => {
    const guardado = localStorage.getItem('canje_piloto')
    if (guardado) {
      try { setPiloto(JSON.parse(guardado)) } catch { /* ignore */ }
    }
  }, [])

  // ─── Publicar ─────────────────────────────────────────────────────────────
  const publicar = async (
    tipo: Tipo,
    prenda: Prenda,
    talla: string,
    genero: Genero,
    enPool: boolean,
    tallaAlternativa?: string,
    cantidad: number = 1,
    comentario?: string,
  ): Promise<string | null> => {
    if (!piloto) return 'No hay piloto activo'
    const duplicado = await existePublicacionActiva({
      numero_rol: piloto.numero_rol,
      tipo,
      prenda,
      talla,
      genero,
    })
    if (duplicado) return `Ya tienes una publicación activa de ${tipo} ${prenda} T.${talla} (${genero === 'M' ? 'Masculino' : 'Femenino'})`
    await crearPublicacion({
      numero_rol: piloto.numero_rol,
      base: piloto.base,
      tipo,
      prenda,
      talla,
      talla_alternativa: tallaAlternativa || undefined,
      genero,
      cantidad,
      comentario: comentario || undefined,
      en_pool: enPool,
    })
    return null // sin error
  }

  // ─── RESUELTO bilateral (marca AMBAS pubs) ────────────────────────────────
  const resolverMatch = async (match: Match) => {
    if (!piloto) return
    await marcarResueltoMatch(match.tengo.id, match.requiero.id, piloto.numero_rol)
  }

  // ─── Retirar publicación propia sin match ─────────────────────────────────
  const retirar = async (id: string) => {
    await eliminarPublicacion(id)
  }

  // ─── Cancelar match: limpia estado para volver al tablero libre ───────────
  const cancelarMatch = async (match: Match) => {
    if (!piloto) return
    // Solo cancela la publicación del piloto que solicita
    const miPubId = match.tengo.numero_rol === piloto.numero_rol ? match.tengo.id : match.requiero.id
    await cancelarMatchPublicacion(miPubId)
    cerrarChat()
  }

  const abrirChat = (match: Match) => setChatKey(match.chat_key)
  const cerrarChat = () => setChatKey(null)

  const misPubs = useMemo(
    () => (piloto ? publicaciones.filter((p) => p.numero_rol === piloto.numero_rol) : []),
    [publicaciones, piloto]
  )

  return {
    publicaciones,
    matches,
    misMatchIds,
    misPubs,
    piloto,
    cargando,
    chatAbierto,
    entrarComoPiloto,
    salirSesion,
    publicar,
    resolverMatch,
    retirar,
    cancelarMatch,
    abrirChat,
    cerrarChat,
  }
}
