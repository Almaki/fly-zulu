'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, User, MessageCircle } from 'lucide-react'

const navItems = [
  {
    id: 'home',
    label: 'Inicio',
    href: '/pilot',
    icon: Home,
  },
  {
    id: 'messages',
    label: 'Mensajes',
    href: '/pilot/mensajes',
    icon: MessageCircle,
  },
  {
    id: 'profile',
    label: 'Perfil',
    href: '/pilot/perfil',
    icon: User,
  },
]

export default function PilotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#27272a] bg-background/95 backdrop-blur-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/pilot' && pathname.startsWith(item.href))
            const isHome = item.href === '/pilot' && pathname === '/pilot'

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive || isHome
                    ? 'text-[#0066CC]'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive || isHome ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
