'use client'

import Link from 'next/link'
import {
  Clock,
  Plane,
  ChevronRight,
  Construction,
  ClipboardList,
  Timer,
  Wrench,
  Pencil,
  BookOpen,
  MessageSquare,
  Users,
  BarChart3,
  Megaphone,
  MapPin,
  Radio,
  Newspaper,
  Pin,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks'

// Card component reutilizable - versión compacta
interface FeatureCardProps {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  badge?: string
  badgeColor?: string
  showEditIcon?: boolean
}

function FeatureCard({ title, href, icon: Icon, color, badge, badgeColor, showEditIcon }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block relative overflow-hidden rounded-xl border border-[#27272a] bg-[#141414] p-4 transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#1a1a1a] active:scale-[0.98]"
    >
      {badge && (
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-medium ${badgeColor || 'bg-[#f59e0b]/20 text-[#fbbf24]'}`}>
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-[#fafafa] text-base flex-1">
          {title}
        </h3>
        {showEditIcon ? (
          <Pencil className="w-4 h-4 text-[#71717a] group-hover:text-[#a1a1aa]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#3f3f46] group-hover:text-[#71717a] group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </Link>
  )
}

// Card transparente "En Construcción"
function UnderConstructionCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-[#3f3f46] bg-transparent p-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-[#27272a]">
          <Construction className="w-5 h-5 text-[#71717a]" />
        </div>
        <div>
          <h3 className="font-medium text-[#71717a] text-sm">En Construcción</h3>
          <p className="text-[10px] text-[#52525b]">Próximamente más funciones</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const userPosition = (user as { posicion?: string })?.posicion
  const userRole = (user as { role?: string })?.role
  const isSuperAdmin = userRole === 'SUPERADMIN'

  // Determinar nombre para saludo
  const firstName = (user as { nombre?: string })?.nombre?.split(' ')[0] || 'Crew'

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <h1 className="text-2xl font-bold text-[#fafafa]">
            Hola, {firstName}!
          </h1>
          <p className="text-[#71717a] text-sm mt-1">
            {userPosition === 'PILOT' && 'Crew!'}
            {userPosition === 'FA' && 'Crew!'}
            {userPosition === 'OPS' && '¿Qué necesitas hoy?'}
            {userPosition === 'TRAFICO' && '¿Qué necesitas hoy?'}
            {userPosition === 'MANTTO' && '¿Qué necesitas hoy?'}
            {!userPosition && '¿Qué necesitas hoy?'}
          </p>
        </div>

        {/* Feature Cards por Rol */}
        <div className="space-y-3">
          {/* === PILOT === */}
          {userPosition === 'PILOT' && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <FeatureCard
                title="Flight"
                href="/pilot/flight"
                icon={Plane}
                color="from-[#0066CC] to-[#0088FF]"
                badge="Offline"
                badgeColor="bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30"
              />
              <FeatureCard
                title="Directorio"
                href="/directory"
                icon={BookOpen}
                color="from-[#22c55e] to-[#4ade80]"
                badge="Crew"
                badgeColor="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
              />
              <FeatureCard
                title="Aviso de Ocasión"
                href="/aviso-ocasion"
                icon={Megaphone}
                color="from-[#E91E8C] to-[#ff6eb4]"
                badge="Crew"
                badgeColor="bg-[#E91E8C]/20 text-[#E91E8C] border border-[#E91E8C]/30"
              />
              <FeatureCard
                title="Noticias"
                href="/news"
                icon={Radio}
                color="from-[#ef4444] to-[#f87171]"
                badge="Live"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
            </>
          )}

          {/* === FA === */}
          {userPosition === 'FA' && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <FeatureCard
                title="Directorio"
                href="/directory"
                icon={BookOpen}
                color="from-[#22c55e] to-[#4ade80]"
                badge="Crew"
                badgeColor="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
              />
              <FeatureCard
                title="Aviso de Ocasión"
                href="/aviso-ocasion"
                icon={Megaphone}
                color="from-[#E91E8C] to-[#ff6eb4]"
                badge="Crew"
                badgeColor="bg-[#E91E8C]/20 text-[#E91E8C] border border-[#E91E8C]/30"
              />
              <FeatureCard
                title="Noticias"
                href="/news"
                icon={Radio}
                color="from-[#ef4444] to-[#f87171]"
                badge="Live"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
            </>
          )}

          {/* === OPS === */}
          {userPosition === 'OPS' && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <FeatureCard
                title="Control"
                href="/ops/control"
                icon={ClipboardList}
                color="from-[#8b5cf6] to-[#a78bfa]"
              />
              <FeatureCard
                title="Ops Lounge"
                href="/ops/lounge"
                icon={MessageSquare}
                color="from-[#8b5cf6] to-[#a78bfa]"
                badge="OPS"
                badgeColor="bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30"
              />
            </>
          )}

          {/* === TRAFICO === */}
          {userPosition === 'TRAFICO' && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <FeatureCard
                title="Control Tiempos"
                href="/trafico/tiempos"
                icon={Timer}
                color="from-[#06b6d4] to-[#22d3ee]"
                showEditIcon
              />
              <FeatureCard
                title="Traffic Lounge"
                href="/trafico/lounge"
                icon={MessageSquare}
                color="from-[#06b6d4] to-[#22d3ee]"
                badge="Tráfico"
                badgeColor="bg-[#06b6d4]/20 text-[#22d3ee] border border-[#06b6d4]/30"
              />
            </>
          )}

          {/* === MANTTO === */}
          {userPosition === 'MANTTO' && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <FeatureCard
                title="Transit Check"
                href="/mantto/transit"
                icon={Wrench}
                color="from-[#ef4444] to-[#f87171]"
              />
              <FeatureCard
                title="Mantto Lounge"
                href="/mantto/lounge"
                icon={MessageSquare}
                color="from-[#ef4444] to-[#f87171]"
                badge="Mantto"
                badgeColor="bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30"
              />
            </>
          )}

          {/* === ADMIN / SUPERADMIN === */}
          {isSuperAdmin && (
            <>
              <FeatureCard
                title="Usuarios"
                href="/admin/users"
                icon={Users}
                color="from-[#ef4444] to-[#f87171]"
                badge="Admin"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
              <FeatureCard
                title="Mapa Usuarios"
                href="/admin/mapa"
                icon={MapPin}
                color="from-[#22c55e] to-[#4ade80]"
                badge="Admin"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
              <FeatureCard
                title="Métricas"
                href="/admin/metrics"
                icon={BarChart3}
                color="from-[#8b5cf6] to-[#a78bfa]"
                badge="Admin"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
              <FeatureCard
                title="Zulu News"
                href="/admin/zulu-news"
                icon={Newspaper}
                color="from-[#E91E8C] to-[#ff6eb4]"
                badge="Admin"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
              <FeatureCard
                title="Avisos Perm."
                href="/admin/avisos"
                icon={Pin}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Admin"
                badgeColor="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
              />
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
              />
              <FeatureCard
                title="Directorio"
                href="/directory"
                icon={BookOpen}
                color="from-[#22c55e] to-[#4ade80]"
              />
              <FeatureCard
                title="Flight"
                href="/pilot/flight"
                icon={Plane}
                color="from-[#0066CC] to-[#0088FF]"
              />
              <FeatureCard
                title="Lounges"
                href="/admin/lounges"
                icon={MessageSquare}
                color="from-[#E91E8C] to-[#ff6eb4]"
              />
            </>
          )}

          {/* === FALLBACK (sin rol definido) === */}
          {!userPosition && !isSuperAdmin && (
            <>
              <FeatureCard
                title="Salidas"
                href="/board"
                icon={Clock}
                color="from-[#f59e0b] to-[#fbbf24]"
                badge="Colaborativo"
                badgeColor="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30"
              />
              <UnderConstructionCard />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
