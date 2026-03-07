'use client'

import { Eye, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useImpersonationStore } from '@/shared/stores/impersonation-store'
import { useAuthStore } from '@/features/auth/store'

export function ImpersonateBar() {
  const impersonating = useImpersonationStore((s) => s.impersonating)
  const clearImpersonating = useImpersonationStore((s) => s.clearImpersonating)
  const realUser = useAuthStore((s) => s.user)
  const router = useRouter()

  if (!impersonating || realUser?.role !== 'SUPERADMIN') return null

  return (
    <div className="sticky top-0 z-[100] bg-amber-500 text-zinc-900 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="h-4 w-4 shrink-0" />
        <p className="text-xs font-medium truncate">
          Visualizando como{' '}
          <strong className="font-bold">{impersonating.nombre}</strong>
          {' · '}{impersonating.posicion}
          {' · '}
          <span className="opacity-70">{impersonating.email}</span>
        </p>
      </div>
      <button
        onClick={() => {
          clearImpersonating()
          router.push('/admin/users')
        }}
        className="flex items-center gap-1.5 bg-zinc-900/20 hover:bg-zinc-900/30 active:bg-zinc-900/40 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
      >
        <X className="h-3 w-3" />
        Salir
      </button>
    </div>
  )
}
