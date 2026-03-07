'use client'

import { useAuthStore } from '@/features/auth/store'

export function HomeButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  // Mientras hidrata, no renderizar para evitar flash
  if (!hasHydrated) return null

  const href = isAuthenticated ? '/home' : '/'

  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      ← Ir al Home
    </a>
  )
}
