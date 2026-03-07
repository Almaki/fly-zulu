'use client'

import { useState } from 'react'
import { Plus, X, Minus } from 'lucide-react'
import type { Tipo, Prenda, Genero } from '../types'
import { PRENDAS, PRENDA_ICONS } from '../types'

interface Props {
  onPublicar: (
    tipo: Tipo,
    prenda: Prenda,
    talla: string,
    genero: Genero,
    enPool: boolean,
    tallaAlternativa?: string,
    cantidad?: number,
    comentario?: string,
  ) => Promise<string | null>
}

export function FormPublicacion({ onPublicar }: Props) {
  const [tipo, setTipo] = useState<Tipo>('TENGO')
  const [prenda, setPrenda] = useState<Prenda | ''>('')
  const [talla, setTalla] = useState('')
  const [tallaAlt, setTallaAlt] = useState('')
  const [mostrarTallaAlt, setMostrarTallaAlt] = useState(false)
  const [genero, setGenero] = useState<Genero>('M')
  const [cantidad, setCantidad] = useState(1)
  const [comentario, setComentario] = useState('')
  const [mostrarComentario, setMostrarComentario] = useState(false)
  const [enPool, setEnPool] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleTipo = (t: Tipo) => {
    setTipo(t)
    if (t === 'REQUIERO') setEnPool(false)
  }

  const quitarTallaAlt = () => {
    setTallaAlt('')
    setMostrarTallaAlt(false)
  }

  const quitarComentario = () => {
    setComentario('')
    setMostrarComentario(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prenda) { setError('Selecciona una prenda'); return }
    const tallaNum = parseInt(talla)
    if (!talla || isNaN(tallaNum) || tallaNum < 1) {
      setError('Ingresa una talla válida (número)')
      return
    }
    if (tallaAlt && tallaAlt === talla) {
      setError('La talla alternativa debe ser diferente a la principal')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const errorMsg = await onPublicar(
        tipo,
        prenda as Prenda,
        talla.trim(),
        genero,
        tipo === 'TENGO' ? enPool : false,
        tallaAlt.trim() || undefined,
        cantidad,
        comentario.trim() || undefined,
      )
      if (errorMsg) {
        setError(errorMsg)
        return
      }
      setPrenda('')
      setTalla('')
      setTallaAlt('')
      setMostrarTallaAlt(false)
      setCantidad(1)
      setComentario('')
      setMostrarComentario(false)
      setEnPool(false)
      setExito(true)
      setTimeout(() => setExito(false), 3500)
    } catch {
      setError('Error al publicar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-emerald-100 p-2 rounded-full">
          <Plus className="text-emerald-600" size={18} />
        </div>
        <h2 className="text-slate-700 font-bold text-base">Publicar prenda</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* TENGO / REQUIERO */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-2">
            ¿Qué quieres hacer?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTipo('TENGO')}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                tipo === 'TENGO'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300'
              }`}
            >
              ✅ TENGO
            </button>
            <button
              type="button"
              onClick={() => handleTipo('REQUIERO')}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                tipo === 'REQUIERO'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300'
              }`}
            >
              🔍 REQUIERO
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 ml-1">
            {tipo === 'TENGO'
              ? 'Tienes esta prenda disponible para intercambiar'
              : 'Necesitas esta prenda y buscas a alguien que la tenga'}
          </p>
        </div>

        {/* POOL toggle — solo visible en TENGO */}
        {tipo === 'TENGO' && (
          <button
            type="button"
            onClick={() => setEnPool(!enPool)}
            className={`w-full rounded-xl border-2 p-3 transition-all text-left ${
              enPool
                ? 'bg-orange-50 border-orange-400 shadow-sm shadow-orange-100'
                : 'bg-slate-50 border-slate-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  enPool ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'
                }`}
              >
                {enPool && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <div>
                <p className={`text-sm font-bold leading-tight ${enPool ? 'text-orange-600' : 'text-slate-600'}`}>
                  🟠 Entrar al POOL comunitario
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${enPool ? 'text-orange-500' : 'text-slate-400'}`}>
                  Donas esta prenda a quien la necesite, aunque no tenga lo que tú requieres.
                  El POOL te asignará tu prenda cuando esté disponible.
                </p>
              </div>
            </div>
            {enPool && (
              <div className="mt-2 ml-8 bg-orange-100 rounded-lg px-3 py-1.5">
                <p className="text-orange-700 text-[11px] font-medium">
                  ✓ Activo — Tu prenda irá al POOL comunitario
                </p>
              </div>
            )}
          </button>
        )}

        {/* Prenda */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-2">Prenda</label>
          <div className="grid grid-cols-2 gap-2">
            {PRENDAS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrenda(p)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 px-3 ${
                  prenda === p
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <span className="text-xl">{PRENDA_ICONS[p]}</span>
                <span className="text-xs font-semibold leading-tight">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Género */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-2">Género</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGenero('M')}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                genero === 'M'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              👔 Masculino
            </button>
            <button
              type="button"
              onClick={() => setGenero('F')}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                genero === 'F'
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300'
              }`}
            >
              👗 Femenino
            </button>
          </div>
        </div>

        {/* Talla principal */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-1">
            Talla (número)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            placeholder="Ej: 42, 30, 58..."
            min={1}
            max={99}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 placeholder-slate-400"
          />
        </div>

        {/* Talla alternativa */}
        {!mostrarTallaAlt ? (
          <button
            type="button"
            onClick={() => setMostrarTallaAlt(true)}
            className="text-slate-400 text-xs font-medium hover:text-indigo-500 transition-colors flex items-center gap-1 -mt-2 ml-1"
          >
            <span className="text-base leading-none">+</span> También acepto otra talla
          </button>
        ) : (
          <div className="-mt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-500 text-xs font-medium">También acepto talla</label>
              <button
                type="button"
                onClick={quitarTallaAlt}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-0.5 text-[11px]"
              >
                <X size={11} /> quitar
              </button>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={tallaAlt}
              onChange={(e) => setTallaAlt(e.target.value)}
              placeholder="Ej: 44"
              min={1}
              max={99}
              className="w-full border border-dashed border-indigo-300 rounded-xl px-4 py-2.5 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50/40 placeholder-slate-400"
            />
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="text-slate-600 text-sm font-medium block mb-2">
            Cantidad de prendas
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="text-slate-800 font-bold text-lg w-8 text-center">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(10, c + 1))}
              disabled={cantidad >= 10}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <Plus size={16} />
            </button>
            <span className="text-slate-400 text-xs ml-1">
              {cantidad === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>
        </div>

        {/* Comentario opcional */}
        {!mostrarComentario ? (
          <button
            type="button"
            onClick={() => setMostrarComentario(true)}
            className="text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors flex items-center gap-1 -mt-2 ml-1"
          >
            <span className="text-base leading-none">+</span> Agregar comentario (estado, detalles...)
          </button>
        ) : (
          <div className="-mt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-500 text-xs font-medium">Comentario (opcional)</label>
              <button
                type="button"
                onClick={quitarComentario}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-0.5 text-[11px]"
              >
                <X size={11} /> quitar
              </button>
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: En buen estado, sin manchas. Disponible en base TIJ."
              maxLength={150}
              rows={2}
              className="w-full border border-dashed border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/60 placeholder-slate-400 resize-none"
            />
            <p className="text-slate-400 text-[10px] text-right mt-0.5">{comentario.length}/150</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {exito && (
          <p className="text-emerald-600 text-xs bg-emerald-50 px-3 py-2 rounded-lg font-medium">
            ✅ Publicación registrada exitosamente
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className={`w-full font-bold py-3.5 rounded-xl transition-colors text-sm text-white shadow-sm ${
            enPool
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200 disabled:bg-orange-300'
              : tipo === 'TENGO'
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 disabled:bg-emerald-300'
              : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 disabled:bg-amber-300'
          }`}
        >
          {enviando
            ? 'Publicando...'
            : enPool
            ? '🟠 Publicar al POOL'
            : `Publicar ${tipo}`}
        </button>
      </form>
    </div>
  )
}
