'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks'

// Map routes to titles
const ROUTE_TITLES: Record<string, string> = {
  '/board': 'FIDS',
  '/directory': 'Directorio Crew',
  '/profile': 'Mi Perfil',
  // PILOT
  '/pilot/mcdu': 'MCDU',
  '/pilot/duty': 'Jornada',
  '/pilot/academy': 'Academy',
  '/pilot/copilot': 'CoPilot 24/7',
  '/pilot/crewmind': 'CrewMind',
  // FA
  '/fa/vuelo': 'Registro de Vuelo',
  '/fa/seguridad': 'Seguridad',
  '/fa/pax': 'PAX Especiales',
  '/fa/catering': 'Catering',
  '/fa/incidentes': 'Incidentes',
  // OPS
  '/ops/control': 'Hoja de Control',
  '/ops/walkaround': 'Walk Around',
  '/ops/gpu': 'GPU Report',
  '/ops/responsabilidad': 'Responsabilidad',
  // TRAFICO
  '/trafico/tiempos': 'Control de Tiempos',
  '/trafico/especiales': 'Procedimientos Especiales',
  '/trafico/seatmap': 'Seatmap',
  // MANTTO
  '/mantto/transit': 'Transit Check R24',
  '/mantto/certificacion': 'Certificación',
  // ADMIN
  '/admin/users': 'Usuarios',
  '/admin/metrics': 'Métricas',
  '/admin/fids': 'Histórico FIDS',
  '/admin/activity': 'Actividad',
  '/admin/invites': 'Invitaciones',
  '/admin/zulu-news': 'Zulu News',
}

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()

  const title = ROUTE_TITLES[pathname] || 'FLY-ZULU'

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 safe-area-top">
      <div className="max-w-[500px] mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold truncate">{title}</h1>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{user.posicion}</span>
            {user.subscription_tier === 'PREMIUM' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#00ff88]/20 text-[#00ff88] rounded-full">
                PRO
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
