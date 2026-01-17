'use client'

import { useAuthStore } from '@/shared/stores/auth-store'

export function AdminGlow() {
  const { user } = useAuthStore()

  // Only show glow for SUPERADMIN users
  if (user?.role !== 'SUPERADMIN') {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Glow border effect */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 40px rgba(168, 85, 247, 0.2)',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderImage: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.6), rgba(168, 85, 247, 0.6)) 1',
        }}
      />
      {/* Corner indicators */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-500/70" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-500/70" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-pink-500/70" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-pink-500/70" />
      {/* Admin badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
        <span className="text-[9px] font-medium text-purple-400 tracking-wider uppercase">Admin Mode</span>
      </div>
    </div>
  )
}
