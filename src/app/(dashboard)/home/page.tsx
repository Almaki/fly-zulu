'use client'

import Link from 'next/link'
import {
  MapPin,
  Plane,
  Clock,
  ChevronRight,
  Users,
  Edit3
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks'

const features = [
  {
    id: 'salidas',
    title: 'Salidas',
    description: 'Tablero FIDS colaborativo',
    subdescription: 'Consulta vuelos, reporta delays, cambios de gate y más. ¡Ayuda a otros tripulantes!',
    icon: Clock,
    href: '/board',
    color: 'from-[#f59e0b] to-[#fbbf24]',
    available: true,
    collaborative: true,
  },
  {
    id: 'directorio',
    title: 'Directorio',
    description: 'Encuentra hoteles, transporte y servicios por aeropuerto',
    icon: MapPin,
    href: '/directory',
    color: 'from-[#22c55e] to-[#4ade80]',
    available: true,
  },
  {
    id: 'work',
    title: 'Work',
    description: 'Registra tu jornada y bitácora de vuelo',
    icon: Plane,
    href: '/pilot/mcdu',
    color: 'from-[#0066CC] to-[#0088FF]',
    available: true,
  },
  // Academy oculto por ahora - descomentar cuando esté listo
  // {
  //   id: 'academy',
  //   title: 'Academy',
  //   description: 'Algo increíble está en camino...',
  //   icon: GraduationCap,
  //   href: '#',
  //   color: 'from-[#8b5cf6] to-[#a78bfa]',
  //   available: false,
  //   comingSoon: true,
  // },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-bold text-[#fafafa]">
            Hola, {user?.nombre?.split(' ')[0] || 'Tripulante'}
          </h1>
          <p className="text-[#71717a] text-sm mt-1">¿Qué necesitas hoy?</p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          {features.filter(f => f.available).map((feature) => {
            const Icon = feature.icon

            // Card especial para Salidas (colaborativa)
            if (feature.collaborative) {
              return (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="group block relative overflow-hidden rounded-xl border border-[#f59e0b]/30 bg-gradient-to-br from-[#141414] to-[#1a1a0a] p-5 transition-all duration-300 hover:border-[#f59e0b]/50 hover:bg-[#1a1a1a] active:scale-[0.98]"
                >
                  {/* Badge colaborativo */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/30">
                    <Users className="w-3 h-3 text-[#fbbf24]" />
                    <span className="text-[10px] font-medium text-[#fbbf24]">Colaborativo</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl group-hover:shadow-[#f59e0b]/20 transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pr-20">
                      <h3 className="font-semibold text-[#fafafa] text-lg group-hover:text-white transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#f59e0b] mt-1 font-medium">
                        {feature.description}
                      </p>
                      <p className="text-xs text-[#71717a] mt-2 group-hover:text-[#a1a1aa] transition-colors">
                        {feature.subdescription}
                      </p>
                      {/* Acciones rápidas */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#71717a]">
                          <Edit3 className="w-3 h-3" />
                          Editar status
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#71717a]">
                          <Clock className="w-3 h-3" />
                          Reportar delay
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#f59e0b]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#f59e0b]/20 transition-colors" />
                </Link>
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
