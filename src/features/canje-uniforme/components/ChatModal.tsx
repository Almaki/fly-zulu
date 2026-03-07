'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send } from 'lucide-react'
import { createClient } from '@/shared/lib/supabase'
import { obtenerMensajes, enviarMensaje } from '../services/supabase'
import type { Match, Mensaje } from '../types'
import { PRENDA_ICONS } from '../types'

interface Props {
  match: Match
  numeroRol: string
  onCerrar: () => void
  onResolver: (match: Match) => Promise<void>
}

const headerColor = {
  directo: 'from-violet-500 to-purple-600',
  pool: 'from-orange-500 to-amber-500',
}

export function ChatModal({ match, numeroRol, onCerrar, onResolver }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resolviendo, setResolviendo] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const cargarMensajes = useCallback(async () => {
    try {
      const msgs = await obtenerMensajes(match.chat_key)
      setMensajes(msgs)
    } catch (err) {
      console.error('[Chat] Error cargando mensajes:', err)
    }
  }, [match.chat_key])

  useEffect(() => {
    cargarMensajes()
    const sb = createClient()
    const channel = sb
      .channel(`chat_${match.chat_key}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'canje_mensajes',
        filter: `chat_key=eq.${match.chat_key}`,
      }, (payload) => {
        setMensajes((prev) => [...prev, payload.new as Mensaje])
      })
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [match.chat_key, cargarMensajes])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    try {
      await enviarMensaje({ chat_key: match.chat_key, numero_rol: numeroRol, mensaje: texto.trim() })
      setTexto('')
    } catch (err) {
      console.error('[Chat] Error enviando mensaje:', err)
    } finally {
      setEnviando(false)
    }
  }

  const handleResolver = async () => {
    setResolviendo(true)
    try {
      await onResolver(match)
    } finally {
      setResolviendo(false)
    }
  }

  // Determinar publicaciones del piloto actual y de la contraparte
  const miPub = match.tengo.numero_rol === numeroRol ? match.tengo : match.requiero
  const contraparte = match.tengo.numero_rol === numeroRol ? match.requiero : match.tengo

  // ✅ CORRECTO: yaResolvi = mi rol está en MI pub.resuelto_por
  const yaResolvi = miPub.resuelto_por?.includes(numeroRol) ?? false
  // ✅ CORRECTO: otroresolvio = rol del otro está en MI pub (ambas pubs reciben los 2 rols)
  const otroresolvio = miPub.resuelto_por?.includes(contraparte.numero_rol) ?? false
  const ambosResolvieron = yaResolvi && otroresolvio

  const baseBadge = match.mismo_base
    ? <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🏠 Misma base</span>
    : <span className="bg-white/15 text-white/80 text-[10px] px-2 py-0.5 rounded-full">Base: {match.tengo.base} → {match.requiero.base}</span>

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">

        {/* Header — color según tipo de match */}
        <div className={`bg-gradient-to-r ${headerColor[match.tipo]} px-4 py-3 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{PRENDA_ICONS[match.tengo.prenda]}</span>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm flex items-center gap-1.5">
                {match.tengo.prenda} · T.{match.tengo.talla}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                  {match.tengo.genero === 'F' ? '♀ F' : '♂ M'}
                </span>
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-white/80 text-xs">
                  {contraparte.numero_rol} · {contraparte.base}
                </p>
                {baseBadge}
              </div>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Estado de confirmación RESUELTO */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs flex-1">
              {ambosResolvieron ? (
                <span className="text-emerald-600 font-semibold">✅ ¡Canje completado! Ambos confirmaron.</span>
              ) : yaResolvi ? (
                <span className="text-amber-600 font-medium">⏳ Esperando que {contraparte.numero_rol} confirme...</span>
              ) : otroresolvio ? (
                <span className="text-sky-600 font-medium">👋 {contraparte.numero_rol} ya confirmó. ¡Confirma tú también!</span>
              ) : (
                <span className="text-slate-500">¿Llegaron a un acuerdo? Ambos deben confirmar.</span>
              )}
            </p>
            {!yaResolvi && (
              <button
                onClick={handleResolver}
                disabled={resolviendo}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition-colors disabled:opacity-60 active:scale-95"
              >
                {resolviendo ? '...' : '✓ RESUELTO'}
              </button>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-1">
              <p className="text-4xl">💬</p>
              <p className="text-slate-400 text-sm">Ningún mensaje aún.</p>
              <p className="text-slate-400 text-xs">¡Sé el primero en escribir!</p>
            </div>
          )}
          {mensajes.map((msg) => {
            const esMio = msg.numero_rol === numeroRol
            return (
              <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  esMio ? 'bg-violet-500 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {!esMio && (
                    <p className="text-xs font-semibold text-violet-600 mb-0.5">{msg.numero_rol}</p>
                  )}
                  <p className="text-sm leading-relaxed break-words">{msg.mensaje}</p>
                  <p className={`text-[10px] mt-0.5 ${esMio ? 'text-violet-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input de mensaje */}
        <div className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !enviando && handleEnviar()}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-slate-50 placeholder-slate-400"
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white p-3 rounded-xl transition-colors active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
