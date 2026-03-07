'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const modosIntercambio = [
  {
    badge: '🟣 Match Directo',
    bgColor: 'bg-violet-500/20 border-violet-400/40',
    badgeColor: 'bg-violet-500',
    titulo: 'Intercambio 1 a 1',
    desc: 'Tú tienes lo que otro necesita Y ese otro tiene lo que tú buscas. Coincidencia exacta de prenda y talla.',
    ejemplo: 'Tú tienes GABARDINA T42 · El otro la requiere Y tiene lo que tú necesitas.',
  },
  {
    badge: '🟠 Match POOL',
    bgColor: 'bg-orange-500/20 border-orange-400/40',
    badgeColor: 'bg-orange-500',
    titulo: 'Intercambio Comunitario',
    desc: 'Entras al POOL cuando donas tus prendas a quien las necesite, sin importar si esa persona tiene lo que tú buscas. El POOL te asignará tu prenda cuando otro piloto la aporte.',
    ejemplo: 'Donas GABARDINA T42 a quien la necesite → el POOL te asignará lo que tú requieres cuando esté disponible.',
  },
]

const pasos = [
  {
    num: '1',
    color: 'bg-sky-500',
    titulo: 'Identifícate',
    desc: 'Ingresa tu Número de Rol y selecciona tu base. No necesitas contraseña ni cuenta.',
  },
  {
    num: '2',
    color: 'bg-emerald-500',
    titulo: 'Publica lo que TIENES',
    desc: 'Selecciona "TENGO", elige la prenda y escribe la talla disponible para intercambiar.',
  },
  {
    num: '3',
    color: 'bg-amber-500',
    titulo: 'Publica lo que REQUIERES',
    desc: 'Selecciona "REQUIERO", elige la prenda y la talla que necesitas. El sistema buscará quién la tiene.',
  },
  {
    num: '4',
    color: 'bg-orange-500',
    titulo: '(Opcional) Únete al POOL',
    desc: 'Al activar el POOL en tu publicación, aceptas entregar tu prenda a cualquier piloto que la necesite — aunque esa persona no tenga lo que tú requieres. A cambio, el POOL comunitario te asignará tu prenda requerida cuando esté disponible.',
  },
  {
    num: '5',
    color: 'bg-violet-500',
    titulo: 'Recibe la alerta de Match',
    desc: '🟣 Morado = Match Directo (intercambio exacto entre dos pilotos). 🟠 Naranja = Match POOL (intercambio comunitario flexible).',
  },
  {
    num: '6',
    color: 'bg-pink-500',
    titulo: 'Coordínate por chat',
    desc: 'Abre el chat en tiempo real con el piloto asignado. Acuerden cómo y cuándo hacer el intercambio.',
  },
  {
    num: '7',
    color: 'bg-teal-500',
    titulo: 'Confirma RESUELTO',
    desc: 'Cuando se concrete el intercambio, AMBOS pilotos deben confirmar "RESUELTO". Solo entonces la publicación se retira del tablero.',
  },
]

export function PageHeader() {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="rounded-2xl p-5 shadow-lg mb-5" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb, #4338ca)' }}>

      {/* Logo + Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="text-4xl">✈️</div>
        <div>
          <h1 className="text-white text-xl font-bold leading-tight">
            Bolsa de Canje de Uniformes
          </h1>
          <p className="text-sky-200 text-xs font-medium">FLY-ZULU · Entre tripulantes · Sin contraseña</p>
        </div>
      </div>

      {/* Descripción principal */}
      <p className="text-sky-100 text-sm leading-relaxed mb-3">
        Intercambia prendas de uniforme con compañeros de tu base y/o de otras bases.
        Publica lo que tienes y lo que necesitas — el sistema hace el match automáticamente.
        También puedes unirte al{' '}
        <span className="text-orange-300 font-semibold">POOL comunitario</span>{' '}
        para intercambios más flexibles.
      </p>

      {/* Prendas disponibles */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { icon: '🧥', label: 'Gabardina' },
          { icon: '👖', label: 'Pantalón' },
          { icon: '🧢', label: 'Kepí' },
          { icon: '👔', label: 'Camisa MC' },
          { icon: '🥼', label: 'Camisa ML' },
        ].map((p) => (
          <span
            key={p.label}
            className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium"
          >
            {p.icon} {p.label}
          </span>
        ))}
      </div>

      {/* Tipos de match — siempre visible como resumen rápido */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {modosIntercambio.map((modo) => (
          <div key={modo.badge} className={`border rounded-xl p-2.5 ${modo.bgColor}`}>
            <span className={`${modo.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1`}>
              {modo.badge}
            </span>
            <p className="text-white text-xs font-semibold leading-snug">{modo.titulo}</p>
          </div>
        ))}
      </div>

      {/* Botón instrucciones */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="flex items-center gap-2 text-sky-200 text-sm font-medium hover:text-white transition-colors"
      >
        {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expandido ? 'Ocultar guía' : '¿Cómo funciona? Ver guía completa'}
      </button>

      {/* Instrucciones expandibles */}
      {expandido && (
        <div className="mt-4 space-y-3">

          {/* Sección: Tipos de intercambio */}
          <p className="text-sky-300 text-[11px] font-bold uppercase tracking-widest">
            Tipos de intercambio
          </p>
          {modosIntercambio.map((modo) => (
            <div key={modo.badge} className={`border rounded-xl p-3 space-y-1.5 ${modo.bgColor}`}>
              <div className="flex items-center gap-2">
                <span className={`${modo.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                  {modo.badge}
                </span>
                <span className="text-white text-sm font-semibold">{modo.titulo}</span>
              </div>
              <p className="text-sky-100 text-xs leading-relaxed">{modo.desc}</p>
              <p className="text-sky-300 text-[11px] italic border-l-2 border-white/20 pl-2">
                Ejemplo: {modo.ejemplo}
              </p>
            </div>
          ))}

          {/* Sección: Pasos */}
          <p className="text-sky-300 text-[11px] font-bold uppercase tracking-widest pt-1">
            Paso a paso
          </p>
          <div className="space-y-2">
            {pasos.map((paso) => (
              <div key={paso.num} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <span
                  className={`${paso.color} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {paso.num}
                </span>
                <div>
                  <p className="text-white text-sm font-semibold">{paso.titulo}</p>
                  <p className="text-sky-200 text-xs leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Aviso importante */}
          <div className="bg-amber-400/20 border border-amber-400/40 rounded-xl p-3">
            <p className="text-amber-200 text-xs font-medium leading-relaxed">
              ⚠️ <strong>Recuerda:</strong> Para cerrar cualquier intercambio —directo o POOL—
              <strong> ambos pilotos deben confirmar "RESUELTO".</strong>{' '}
              Si solo uno confirma, la publicación queda activa hasta que el otro lo haga.
            </p>
          </div>

        </div>
      )}
    </div>
  )
}
