import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Plane,
  Wind,
  Clock,
  Users,
  Wrench,
  Shirt,
  MapPin,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'FLY-ZULU — Tu compañero de vuelo digital',
  description:
    'Plataforma colaborativa para tripulaciones de aviación en México. FIDS, meteorología, comunicación y herramientas operativas en un solo lugar.',
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const ROLES = [
  { icon: '✈️', label: 'Pilotos', sub: 'Comandantes & PF' },
  { icon: '🛎️', label: 'Sobrecargos', sub: 'FA & Jefe Cabina' },
  { icon: '🎯', label: 'Operaciones', sub: 'OPS Ground' },
  { icon: '📡', label: 'Tráfico', sub: 'Check-in & Gates' },
  { icon: '🔧', label: 'Mantenimiento', sub: 'AMTs & Técnicos' },
]

const FEATURES = [
  {
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-400',
    title: 'Board de Salidas',
    desc: 'FIDS en tiempo real: estado de vuelos, puertas y retrasos actualizados al minuto.',
  },
  {
    icon: Wind,
    color: 'bg-cyan-500/10 text-cyan-400',
    title: 'Meteorología',
    desc: 'METAR, TAF y condiciones actuales para todas tus rutas y escalas.',
  },
  {
    icon: Users,
    color: 'bg-violet-500/10 text-violet-400',
    title: 'Aviso de Ocasión',
    desc: 'Tablero de cambios de turno, permisos y oportunidades en tu base.',
  },
  {
    icon: Shirt,
    color: 'bg-indigo-500/10 text-indigo-400',
    title: 'Canje de Uniformes',
    desc: 'Intercambia prendas con otros tripulantes de tu compañía de forma directa.',
  },
  {
    icon: MapPin,
    color: 'bg-rose-500/10 text-rose-400',
    title: 'Directorio de Aeropuertos',
    desc: 'Hoteles, transporte y servicios en cada escala. Siempre actualizado.',
  },
  {
    icon: MessageSquare,
    color: 'bg-[#00ff88]/10 text-[#00ff88]',
    title: 'Foros por Área',
    desc: 'Comunicación interna organizada por departamento, sin salir de la app.',
  },
]

const ROLE_FEATURES: Record<string, string[]> = {
  Pilotos: ['FIDS + Plan de vuelo', 'Clima en ruta', 'MCDU digital', 'Foro de pilotos', 'Directorio de aeropuertos'],
  Sobrecargos: ['FIDS + Estado de vuelo', 'Catering', 'Seguridad PAX', 'Incidentes', 'Foro FA'],
  Operaciones: ['Control operativo', 'Walkaround digital', 'GPU tracking', 'Responsabilidades', 'Lounge OPS'],
  Tráfico: ['Tiempos de turnaround', 'Seatmap', 'Vuelos especiales', 'Lounge Tráfico'],
  Mantenimiento: ['Transit check', 'Certificaciones', 'Lounge MANTTO', 'Directorio técnico'],
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-[#00ff88]" />
            <span className="font-bold text-lg tracking-tight">
              FLY<span className="text-[#00ff88]">-ZULU</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm bg-[#0066CC] hover:bg-[#0055aa] text-white px-4 py-1.5 rounded-full font-medium transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#0066CC]/6 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#00ff88]/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-2xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
            Plataforma exclusiva para tripulaciones
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
            Tu compañero de<br />
            <span className="text-[#00ff88]">vuelo digital</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Salidas en tiempo real, meteorología, comunicación entre tripulaciones y
            herramientas operativas — todo en un solo lugar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#0055aa] text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0066CC]/20"
            >
              Crear cuenta gratuita
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 px-7 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="text-zinc-700 text-xs mt-5">
            Solo para personal de aviación verificado · Acceso por invitación
          </p>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-zinc-600 text-xs uppercase tracking-widest mb-8 font-medium">
            Diseñado para cada área
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ROLES.map((r) => (
              <div
                key={r.label}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center hover:border-zinc-600 transition-colors group"
              >
                <div className="text-2xl mb-2">{r.icon}</div>
                <p className="text-zinc-200 text-sm font-semibold group-hover:text-white transition-colors">
                  {r.label}
                </p>
                <p className="text-zinc-600 text-[11px] mt-0.5">{r.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-zinc-600 text-xs uppercase tracking-widest mb-3 font-medium">
            Herramientas
          </p>
          <h2 className="text-2xl font-bold text-center mb-10">
            Todo lo que necesitas en cabina
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center mb-3`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-zinc-100 mb-1">{f.title}</p>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role breakdown ─────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-zinc-600 text-xs uppercase tracking-widest mb-3 font-medium">
            Por rol
          </p>
          <h2 className="text-2xl font-bold text-center mb-10">
            Funciones específicas para cada área
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((r) => {
              const features = ROLE_FEATURES[r.label] ?? []
              return (
                <div
                  key={r.label}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className="font-semibold text-zinc-100 text-sm">{r.label}</p>
                      <p className="text-zinc-600 text-[11px]">{r.sub}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="w-1 h-1 bg-[#00ff88] rounded-full shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            {/* Shared modules card */}
            <div className="bg-[#0066CC]/5 border border-[#0066CC]/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-[#0066CC]" />
                <p className="font-semibold text-zinc-100 text-sm">Módulos compartidos</p>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Canje de Uniformes',
                  'Directorio de Aeropuertos',
                  'Board de Salidas',
                  'Meteorología',
                  'Perfil de tripulante',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-1 h-1 bg-[#0066CC] rounded-full shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
          <div className="w-14 h-14 bg-[#00ff88]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Plane className="h-7 w-7 text-[#00ff88]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Listo para despegar</h2>
          <p className="text-zinc-400 text-sm mb-7 leading-relaxed">
            Únete a la comunidad de tripulantes que ya vuelan con FLY-ZULU.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#00ff88] hover:bg-[#00dd77] text-zinc-950 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Crear cuenta gratuita
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-1"
            >
              Ya tengo cuenta — Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-[#00ff88]" />
            <span className="font-bold text-sm">
              FLY<span className="text-[#00ff88]">-ZULU</span>
            </span>
            <span className="text-zinc-700 text-xs ml-1">
              App colaborativa para tripulaciones
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-zinc-400 transition-colors">
              Cookies
            </Link>
          </div>
          <p className="text-xs text-zinc-700">© 2026 FLY-ZULU</p>
        </div>
      </footer>

    </div>
  )
}
