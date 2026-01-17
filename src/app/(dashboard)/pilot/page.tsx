'use client'

import Link from 'next/link'
import {
  Plane,
  MapPin,
  Clock,
  GraduationCap,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react'

const features = [
  {
    id: 'jornada',
    title: 'Jornada y Vuelo',
    description: 'Registra tu bitácora de vuelo con el MCDU digital',
    icon: Plane,
    href: '/pilot/mcdu',
    color: 'from-[#0066CC] to-[#0088FF]',
    available: true,
  },
  {
    id: 'foro',
    title: 'Crew Lounge',
    description: 'Foro interno para compartir con la tripulación',
    icon: MessageSquare,
    href: '/pilot/foro',
    color: 'from-[#E91E8C] to-[#ff6eb4]',
    available: true,
  },
  {
    id: 'directorio',
    title: 'Directorio',
    description: 'Encuentra hoteles, transporte y servicios por aeropuerto',
    icon: MapPin,
    href: '/pilot/directorio',
    color: 'from-[#22c55e] to-[#4ade80]',
    available: true,
  },
  {
    id: 'salidas',
    title: 'Salidas',
    description: 'Consulta información de salidas y FIDS en tiempo real',
    icon: Clock,
    href: '/pilot/salidas',
    color: 'from-[#f59e0b] to-[#fbbf24]',
    available: true,
  },
  {
    id: 'academy',
    title: 'Academy',
    description: 'Cursos y certificaciones para pilotos profesionales',
    icon: GraduationCap,
    href: '#',
    color: 'from-[#8b5cf6] to-[#a78bfa]',
    available: false,
    comingSoon: true,
  },
]

export default function PilotDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold text-[#fafafa]">Dashboard</h1>
          <p className="text-[#71717a] text-sm mt-1">Selecciona una opción para continuar</p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          {features.map((feature) => {
            const Icon = feature.icon

            if (!feature.available) {
              return (
                <div
                  key={feature.id}
                  className="relative overflow-hidden rounded-xl border border-[#27272a] bg-[#141414]/50 p-5 opacity-60 cursor-not-allowed"
                >
                  {/* Coming Soon Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30">
                    <Sparkles className="w-3 h-3 text-[#8b5cf6]" />
                    <span className="text-[10px] font-medium text-[#8b5cf6]">Próximamente</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} opacity-50`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#fafafa]/70 text-lg">{feature.title}</h3>
                      <p className="text-sm text-[#71717a] mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="group block relative overflow-hidden rounded-xl border border-[#27272a] bg-[#141414] p-5 transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#1a1a1a] active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#fafafa] text-lg group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#71717a] mt-1 group-hover:text-[#a1a1aa] transition-colors">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#3f3f46] group-hover:text-[#71717a] group-hover:translate-x-1 transition-all self-center" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
