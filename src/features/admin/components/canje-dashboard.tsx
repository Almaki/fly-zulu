'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, MessageCircle, ChevronDown, ChevronUp, ShirtIcon } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/shared/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'

/* ─── Types ─────────────────────────────────────────────────────────── */
interface PubRow {
  id: string
  numero_rol: string
  base: string
  tipo: string
  prenda: string
  talla: string
  talla_alternativa: string | null
  genero: string
  cantidad: number
  comentario: string | null
  estado: string
  resuelto_por: string[]
  created_at: string
}

interface MsgRow {
  id: string
  chat_key: string
  numero_rol: string
  mensaje: string
  created_at: string
}

interface ChatConvo {
  chat_key: string
  mensajes: MsgRow[]
  pub1?: PubRow
  pub2?: PubRow
  ultimo_mensaje: string
}

interface Stats {
  activas: number
  resueltas: number
  directoActivos: number
  poolActivos: number
  tasaResolucion: number
  porPrenda: Record<string, { activo: number; resuelto: number }>
  porBase: Record<string, number>
}

/* ─── Component ─────────────────────────────────────────────────────── */
export function CanjeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [convos, setConvos] = useState<ChatConvo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setIsLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    const [{ data: pubs }, { data: msgs }] = await Promise.all([
      db.from('canje_publicaciones').select('*').order('created_at', { ascending: false }),
      db.from('canje_mensajes').select('*').order('created_at', { ascending: true }),
    ])

    const publicaciones: PubRow[] = pubs ?? []
    const mensajes: MsgRow[] = msgs ?? []

    // ── Stats ──────────────────────────────────────────────────────────
    const activas = publicaciones.filter((p) => p.estado === 'activo').length
    const resueltas = publicaciones.filter((p) => p.estado === 'resuelto').length
    const total = activas + resueltas

    const porPrenda: Record<string, { activo: number; resuelto: number }> = {}
    const porBase: Record<string, number> = {}

    for (const p of publicaciones) {
      if (!porPrenda[p.prenda]) porPrenda[p.prenda] = { activo: 0, resuelto: 0 }
      porPrenda[p.prenda][p.estado === 'activo' ? 'activo' : 'resuelto']++
      if (p.tipo === 'TENGO') porBase[p.base] = (porBase[p.base] ?? 0) + 1
    }

    // Compute matches from active pubs (simplified: pubs with resuelto_por > 0 = en proceso)
    const enProceso = publicaciones.filter(
      (p) => p.estado === 'activo' && p.resuelto_por && p.resuelto_por.length > 0
    ).length

    setStats({
      activas,
      resueltas,
      directoActivos: Math.floor(enProceso / 2),
      poolActivos: 0,
      tasaResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
      porPrenda,
      porBase,
    })

    // ── Chats ──────────────────────────────────────────────────────────
    const pubById = new Map<string, PubRow>(publicaciones.map((p) => [p.id, p]))

    // Group messages by chat_key
    const chatMap = new Map<string, MsgRow[]>()
    for (const m of mensajes) {
      if (!chatMap.has(m.chat_key)) chatMap.set(m.chat_key, [])
      chatMap.get(m.chat_key)!.push(m)
    }

    const chatList: ChatConvo[] = []
    for (const [key, msgs] of chatMap) {
      const [id1, id2] = key.split('_')
      chatList.push({
        chat_key: key,
        mensajes: msgs,
        pub1: pubById.get(id1),
        pub2: pubById.get(id2),
        ultimo_mensaje: msgs[msgs.length - 1]?.created_at ?? '',
      })
    }

    // Sort by latest message desc
    chatList.sort((a, b) => b.ultimo_mensaje.localeCompare(a.ultimo_mensaje))
    setConvos(chatList)
    setIsLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full bg-zinc-800" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShirtIcon className="h-5 w-5 text-indigo-400" />
          Canje de Uniformes
        </h2>
        <Button variant="ghost" size="sm" onClick={cargar}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats grid */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-emerald-400">{stats.activas}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Publicaciones activas</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-slate-300">{stats.resueltas}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Resueltas (hist.)</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-violet-400">{stats.directoActivos}</p>
                <p className="text-xs text-zinc-500 mt-0.5">En negociación</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-[#00ff88]">{stats.tasaResolucion}%</p>
                <p className="text-xs text-zinc-500 mt-0.5">Tasa de resolución</p>
              </CardContent>
            </Card>
          </div>

          {/* Por prenda */}
          {Object.keys(stats.porPrenda).length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Publicaciones por prenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.porPrenda)
                  .sort((a, b) => (b[1].activo + b[1].resuelto) - (a[1].activo + a[1].resuelto))
                  .map(([prenda, counts]) => {
                    const total = counts.activo + counts.resuelto
                    const pct = total > 0 ? Math.round((counts.resuelto / total) * 100) : 0
                    return (
                      <div key={prenda}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300 font-medium">{prenda}</span>
                          <span className="text-zinc-500">{counts.activo} activas · {counts.resuelto} resueltas</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00ff88] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          )}

          {/* Por base */}
          {Object.keys(stats.porBase).length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Oferta por base (TENGO)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.porBase)
                    .sort((a, b) => b[1] - a[1])
                    .map(([base, count]) => (
                      <span
                        key={base}
                        className="bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {base} · {count}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Chat History */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-zinc-400" />
            Historial de chats
            <span className="text-zinc-600 font-normal">({convos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {convos.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">Sin conversaciones aún</p>
          ) : (
            convos.map((c) => {
              const isOpen = expandido === c.chat_key
              const prenda = c.pub1?.prenda ?? c.pub2?.prenda ?? '—'
              const piloto1 = c.pub1?.numero_rol ?? '?'
              const piloto2 = c.pub2?.numero_rol ?? '?'
              const ultimoMsg = c.mensajes[c.mensajes.length - 1]

              return (
                <div key={c.chat_key} className="border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Header del chat */}
                  <button
                    onClick={() => setExpandido(isOpen ? null : c.chat_key)}
                    className="w-full flex items-start justify-between gap-2 p-3 hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate">
                        {piloto1} ↔ {piloto2}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {prenda}
                        {c.pub1?.talla && ` · T.${c.pub1.talla}`}
                        {' · '}
                        {c.mensajes.length} mensaje{c.mensajes.length !== 1 ? 's' : ''}
                      </p>
                      {ultimoMsg && (
                        <p className="text-zinc-600 text-[11px] mt-0.5 truncate italic">
                          &ldquo;{ultimoMsg.mensaje}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-zinc-600 text-[10px]">
                        {c.ultimo_mensaje
                          ? formatDistanceToNow(new Date(c.ultimo_mensaje), { locale: es, addSuffix: true })
                          : ''}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                    </div>
                  </button>

                  {/* Mensajes expandidos */}
                  {isOpen && (
                    <div className="border-t border-zinc-800 bg-zinc-950/60 px-3 py-3 space-y-2 max-h-72 overflow-y-auto">
                      {c.mensajes.map((m) => (
                        <div key={m.id} className="flex gap-2">
                          <span className="text-[#00ff88] text-[10px] font-bold shrink-0 mt-0.5 w-14 truncate">
                            {m.numero_rol}
                          </span>
                          <div className="min-w-0">
                            <p className="text-zinc-300 text-xs leading-relaxed break-words">{m.mensaje}</p>
                            <p className="text-zinc-700 text-[10px] mt-0.5">
                              {format(new Date(m.created_at), 'dd/MM HH:mm', { locale: es })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
