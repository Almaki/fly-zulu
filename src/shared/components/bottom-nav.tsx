'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Plane,
  Clock,
  User,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/features/auth/hooks'

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Inicio',
    icon: Home,
    roles: ['PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO', 'SUPERADMIN'],
  },
  {
    href: '/work',
    label: 'Work',
    icon: Plane,
    roles: ['PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO', 'SUPERADMIN'],
    // Dynamic route based on role
  },
  {
    href: '/board',
    label: 'Salidas',
    icon: Clock,
    roles: ['PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO', 'SUPERADMIN'],
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: User,
    roles: ['PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO', 'SUPERADMIN'],
  },
]

// Map role to work page
const WORK_ROUTES: Record<string, string> = {
  PILOT: '/pilot/mcdu',
  FA: '/fa/vuelo',
  OPS: '/ops/control',
  TRAFICO: '/trafico/tiempos',
  MANTTO: '/mantto/transit',
  SUPERADMIN: '/admin/metrics',
}

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const userRole = user.role

  // Filter items based on user role
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 safe-area-bottom">
      <div className="max-w-[500px] mx-auto flex items-center justify-around h-16">
        {visibleItems.map((item) => {
          // Dynamic work route based on role
          const href = item.href === '/work'
            ? WORK_ROUTES[userRole] || '/board'
            : item.href

          const isActive = pathname === href ||
            (item.href === '/work' && pathname.startsWith(`/${userRole.toLowerCase()}`))

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive
                  ? 'text-[#00ff88]'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5',
                isActive && 'drop-shadow-[0_0_8px_#00ff88]'
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
