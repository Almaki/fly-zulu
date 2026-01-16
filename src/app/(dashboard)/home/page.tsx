'use client'

import Link from 'next/link'
import {
  MapPin,
  Plane,
  Clock,
  ChevronRight,
  Users,
  Edit3,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks'

// Features base para todos los usuarios
const baseFeatures = [
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
]

// Features específicos para PILOT
const pilotFeatures = [
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
    id: 'flight',
    title: 'Flight',
    description: 'Jornada y bitácora de vuelo',
    subdescription: 'Registra OUT/OFF/ON/IN, calcula tiempos de vuelo y bloque. Funciona sin conexión.',
    icon: Plane,
    href: '/pilot/flight',
    color: 'from-[#0066CC] to-[#0088FF]',
    available: true,
    offlineReady: true,
  },
]

export default function HomePage() {
  const { user } = useAuth()

  // Seleccionar features según posición
  // Por ahora mostramos pilotFeatures para todos (la mayoría son pilotos)
  // TODO: Personalizar por rol cuando el auth esté estabilizado
  const features = pilotFeatures

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
            if ('collaborative' in feature && feature.collaborative) {
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

            // Card especial para Flight (offline ready)
            if ('offlineReady' in feature && feature.offlineReady) {
              return (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="group block relative overflow-hidden rounded-xl border border-[#0066CC]/30 bg-gradient-to-br from-[#141414] to-[#0a1a2a] p-5 transition-all duration-300 hover:border-[#0066CC]/50 hover:bg-[#1a1a1a] active:scale-[0.98]"
                >
                  {/* Badge Offline Ready */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/30">
                    <WifiOff className="w-3 h-3 text-[#00ff88]" />
                    <span className="text-[10px] font-medium text-[#00ff88]">Offline Ready</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl group-hover:shadow-[#0066CC]/20 transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pr-20">
                      <h3 className="font-semibold text-[#fafafa] text-lg group-hover:text-white transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#0088FF] mt-1 font-medium">
                        {feature.description}
                      </p>
                      <p className="text-xs text-[#71717a] mt-2 group-hover:text-[#a1a1aa] transition-colors">
                        {feature.subdescription}
                      </p>
                      {/* Características clave */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#71717a]">
                          <Clock className="w-3 h-3" />
                          Tiempo ZULU
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#71717a]">
                          <Plane className="w-3 h-3" />
                          FLT / BLK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#0066CC]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#0066CC]/20 transition-colors" />
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
