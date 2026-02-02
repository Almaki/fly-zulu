'use client'

import { useState, useEffect } from 'react'
import { Pin, Check, X, RefreshCw, User, MapPin, Globe, Mail, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  getPendingPermanentAvisos,
  approvePermanentAviso,
  rejectPermanentAviso,
} from '@/features/admin/services'
import type { PendingAviso } from '@/features/admin/services'

export default function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<PendingAviso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadAvisos = async () => {
    setLoading(true)
    const { data, error: fetchError } = await getPendingPermanentAvisos()
    setLoading(false)

    if (fetchError) {
      setError(fetchError)
      return
    }

    setAvisos(data || [])
  }

  useEffect(() => {
    loadAvisos()
  }, [])

  const handleApprove = async (avisoId: string) => {
    setActionLoading(avisoId)
    const { error: approveError } = await approvePermanentAviso(avisoId)
    setActionLoading(null)

    if (approveError) {
      alert('Error: ' + approveError)
      return
    }

    // Remove from list
    setAvisos(prev => prev.filter(a => a.id !== avisoId))
  }

  const handleReject = async (avisoId: string) => {
    if (!confirm('Rechazar solicitud permanente?')) return

    setActionLoading(avisoId)
    const { error: rejectError } = await rejectPermanentAviso(avisoId)
    setActionLoading(null)

    if (rejectError) {
      alert('Error: ' + rejectError)
      return
    }

    // Remove from list
    setAvisos(prev => prev.filter(a => a.id !== avisoId))
  }

  const formatPrice = (precio: number | null, moneda: string) => {
    if (!precio) return 'A convenir'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const daysLeft = (expiresAt: string) => {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#ef4444] text-sm">{error}</p>
        <Button onClick={loadAvisos} variant="outline" className="mt-4 border-[#27272a]">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
            <Pin className="w-5 h-5 text-[#f59e0b]" />
            Avisos Permanentes
          </h1>
          <p className="text-xs text-[#71717a] mt-1">
            Solicitudes pendientes de aprobacion
          </p>
        </div>
        <Button
          onClick={loadAvisos}
          variant="ghost"
          size="sm"
          disabled={loading}
          className="text-[#71717a]"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-[#f59e0b] mx-auto" />
          <p className="text-sm text-[#71717a] mt-2">Cargando...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && avisos.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[#27272a] rounded-xl">
          <Pin className="w-8 h-8 text-[#52525b] mx-auto" />
          <p className="text-sm text-[#71717a] mt-2">No hay solicitudes pendientes</p>
        </div>
      )}

      {/* Avisos List */}
      {avisos.map((aviso) => (
        <div
          key={aviso.id}
          className="rounded-xl border border-[#f59e0b]/30 bg-[#141414] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-[#f59e0b] font-medium">
                  {aviso.categoria} - {aviso.ciudad_code}
                </span>
                <h3 className="font-semibold text-[#fafafa] text-sm mt-0.5">
                  {aviso.titulo}
                </h3>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0',
                aviso.precio ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#71717a]/20 text-[#a1a1aa]'
              )}>
                {formatPrice(aviso.precio, aviso.moneda)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 pb-2">
            <p className="text-xs text-[#a1a1aa] line-clamp-2">{aviso.descripcion}</p>
          </div>

          {/* Contact Info */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {aviso.whatsapp && (
              <span className="text-[10px] text-[#25D366] flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> {aviso.whatsapp}
              </span>
            )}
            {aviso.telefono && (
              <span className="text-[10px] text-[#a1a1aa] flex items-center gap-1">
                <Phone className="w-3 h-3" /> {aviso.telefono}
              </span>
            )}
            {aviso.email && (
              <span className="text-[10px] text-[#3b82f6] flex items-center gap-1">
                <Mail className="w-3 h-3" /> {aviso.email}
              </span>
            )}
            {aviso.pagina_web && (
              <span className="text-[10px] text-[#3b82f6] flex items-center gap-1">
                <Globe className="w-3 h-3" /> {aviso.pagina_web}
              </span>
            )}
          </div>

          {/* User Info */}
          {aviso.created_by_user && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-[#71717a]">
                <User className="w-3 h-3" />
                <span>{aviso.created_by_user.nombre}</span>
                <span>-</span>
                <span>{aviso.created_by_user.role}</span>
                {aviso.created_by_user.empresa && (
                  <span>({aviso.created_by_user.empresa})</span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 bg-[#0a0a0a] flex items-center justify-between border-t border-[#27272a]">
            <div className="text-[10px] text-[#52525b]">
              Expira en {daysLeft(aviso.expires_at)} dias
              <span className="mx-1">-</span>
              {new Date(aviso.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReject(aviso.id)}
                disabled={actionLoading === aviso.id}
                className="h-7 px-2 text-xs text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
              >
                <X className="w-3 h-3 mr-1" />
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(aviso.id)}
                disabled={actionLoading === aviso.id}
                className="h-7 px-3 text-xs bg-[#22c55e] hover:bg-[#22c55e]/90 text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                Aprobar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
