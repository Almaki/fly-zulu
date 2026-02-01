'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Clock, Trash2, MapPin, Calendar, Dog, PawPrint, Truck, Wifi, Droplets, Zap, Wrench, Flame, Package, Ban, Home, Building2, Car, User, Globe, Pin } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAuth } from '@/features/auth/hooks'
import { deleteAviso } from '../services'
import { LocationMap } from './location-map'
import type { Aviso, ServicioIncluido } from '../types'
import { AVISO_CATEGORIAS, categoriaNecesitaDireccion, categoriaEsRoomie, categoriaEsInmueble, categoriaEsTaxi, categoriaPermiteMascotas } from '../types'

interface AvisoCardProps {
  aviso: Aviso
  onDeleted?: () => void
}

const SERVICIO_ICONS: Record<ServicioIncluido, { icon: typeof Wifi; label: string }> = {
  internet: { icon: Wifi, label: 'Internet' },
  agua: { icon: Droplets, label: 'Agua' },
  luz: { icon: Zap, label: 'Luz' },
  mantenimiento: { icon: Wrench, label: 'Mant.' },
  gas: { icon: Flame, label: 'Gas' },
  otro: { icon: Package, label: 'Otro' },
}

export function AvisoCard({ aviso, onDeleted }: AvisoCardProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const isOwner = user?.id === aviso.created_by
  const userRole = (user as { role?: string })?.role
  const isSuperAdmin = userRole === 'SUPERADMIN'
  const canDelete = isOwner || isSuperAdmin
  const categoria = AVISO_CATEGORIAS.find(c => c.id === aviso.categoria)
  const needsDireccion = categoriaNecesitaDireccion(aviso.categoria)
  const isRoomie = categoriaEsRoomie(aviso.categoria)
  const isInmueble = categoriaEsInmueble(aviso.categoria)
  const isTaxi = categoriaEsTaxi(aviso.categoria)
  const permiteMascotas = categoriaPermiteMascotas(aviso.categoria)
  const hasLocation = aviso.direccion_lat && aviso.direccion_lng

  const formatPrice = (precio: number | null, moneda: string) => {
    if (!precio) return 'A convenir'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(precio)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const handleWhatsApp = () => {
    if (!aviso.whatsapp) return
    const phone = aviso.whatsapp.replace(/\D/g, '')
    const message = encodeURIComponent('Hola soy de Volaris, ¿Me puede ayudar?')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const handleCall = () => {
    if (!aviso.telefono) return
    window.open(`tel:${aviso.telefono}`, '_self')
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este aviso?')) return

    setIsDeleting(true)
    const { error } = await deleteAviso(aviso.id)
    setIsDeleting(false)

    if (error) {
      alert('Error al eliminar: ' + error)
      return
    }

    onDeleted?.()
  }

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#141414] overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{categoria?.emoji}</span>
              <span className="text-xs text-[#71717a]">{categoria?.label}</span>
            </div>
            {/* Para taxi, mostrar nombre del conductor como título principal */}
            {isTaxi && aviso.nombre_conductor ? (
              <>
                <h3 className="font-semibold text-[#fafafa] text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-[#22c55e]" />
                  {aviso.nombre_conductor}
                </h3>
                <p className="text-sm text-[#a1a1aa] mt-1">{aviso.titulo}</p>
              </>
            ) : (
              <h3 className="font-semibold text-[#fafafa] text-base line-clamp-2">
                {aviso.titulo}
              </h3>
            )}
          </div>
          {!isTaxi && (
            <div className="flex-shrink-0">
              <span className={cn(
                'px-2 py-1 rounded-lg text-sm font-bold',
                aviso.precio ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#71717a]/20 text-[#a1a1aa]'
              )}>
                {formatPrice(aviso.precio, aviso.moneda)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Taxi Info */}
      {isTaxi && aviso.tipo_auto_taxi && (
        <div className="px-4 pb-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
            "bg-[#22c55e]/10 text-[#22c55e]"
          )}>
            {aviso.tipo_auto_taxi === 'compacto' ? '🚗' : '🚙'}
            {aviso.tipo_auto_taxi === 'compacto' ? 'Compacto' : 'Camioneta'}
          </span>
        </div>
      )}

      {/* Inmueble Info */}
      {isInmueble && (aviso.tipo_inmueble || aviso.tiene_cochera !== null) && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {aviso.tipo_inmueble && (
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
              "bg-[#E91E8C]/10 text-[#E91E8C]"
            )}>
              {aviso.tipo_inmueble === 'casa' ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
              {aviso.tipo_inmueble === 'casa' ? 'Casa' : 'Departamento'}
            </span>
          )}
          {aviso.tiene_cochera === true && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-[#22c55e]/10 text-[#22c55e]">
              <Car className="w-3 h-3" />
              Con cochera
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-[#a1a1aa] line-clamp-3">
          {aviso.descripcion}
        </p>
      </div>

      {/* Website link */}
      {aviso.pagina_web && (
        <div className="px-4 pb-2">
          <a
            href={aviso.pagina_web.startsWith('http') ? aviso.pagina_web : `https://${aviso.pagina_web}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span className="underline truncate max-w-[250px]">
              {aviso.pagina_web.replace(/^https?:\/\//, '')}
            </span>
          </a>
        </div>
      )}

      {/* Permanent badge */}
      {aviso.solicita_permanente && (
        <div className="px-4 pb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#f59e0b]/10 text-[#f59e0b] font-medium">
            <Pin className="w-2.5 h-2.5" />
            Solicita permanente
          </span>
        </div>
      )}

      {/* Additional Info for Inmuebles/Roomie */}
      {(needsDireccion || isRoomie || aviso.servicio_domicilio) && (
        <div className="px-4 pb-3 space-y-2">
          {/* Dirección */}
          {aviso.direccion && (
            <button
              onClick={() => hasLocation && setShowMap(!showMap)}
              className={cn(
                "flex items-center gap-2 text-xs text-[#a1a1aa] w-full text-left",
                hasLocation && "hover:text-[#22c55e] cursor-pointer"
              )}
            >
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{aviso.direccion}</span>
              {hasLocation && (
                <span className="text-[#22c55e] text-[10px]">
                  {showMap ? '▲' : '▼'}
                </span>
              )}
            </button>
          )}

          {/* Fecha disponibilidad */}
          {aviso.fecha_disponibilidad && (
            <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
              <Calendar className="w-3 h-3" />
              <span>
                Disponible desde {new Date(aviso.fecha_disponibilidad).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* Mascotas (roomie e inmuebles renta) */}
          {permiteMascotas && aviso.acepta_mascotas !== null && (
            <div className={cn(
              "flex items-center gap-2 text-xs",
              aviso.acepta_mascotas ? "text-[#22c55e]" : "text-[#ef4444]"
            )}>
              {aviso.acepta_mascotas ? (
                <>
                  <Dog className="w-3 h-3" />
                  <span>Acepta mascotas</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <PawPrint className="w-3 h-3" />
                    <Ban className="w-3 h-3 absolute -top-0.5 -right-0.5 text-[#ef4444]" />
                  </div>
                  <span>No acepta mascotas</span>
                </>
              )}
            </div>
          )}

          {/* Servicios incluidos */}
          {isRoomie && aviso.servicios_incluidos && aviso.servicios_incluidos.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {aviso.servicios_incluidos.map(servicio => {
                const info = SERVICIO_ICONS[servicio]
                const Icon = info.icon
                return (
                  <span
                    key={servicio}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] text-[10px]"
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {info.label}
                  </span>
                )
              })}
              {aviso.precio_todo_incluido && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E91E8C]/10 text-[#E91E8C] text-[10px] font-medium">
                  Todo incluido
                </span>
              )}
            </div>
          )}

          {/* Servicio a domicilio */}
          {aviso.servicio_domicilio && (
            <div className="flex items-center gap-2 text-xs text-[#22c55e]">
              <Truck className="w-3 h-3" />
              <span>Servicio/entrega a domicilio</span>
            </div>
          )}
        </div>
      )}

      {/* Map (collapsible) */}
      {showMap && hasLocation && (
        <div className="px-4 pb-3">
          <LocationMap
            lat={aviso.direccion_lat!}
            lng={aviso.direccion_lng!}
            address={aviso.direccion || undefined}
            height={150}
          />
        </div>
      )}

      {/* Publicado por - Responsable */}
      {aviso.created_by_user?.nombre && (
        <div className="px-4 pb-2 pt-1 border-t border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <User className="w-3 h-3 text-[#22c55e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#fafafa] font-medium truncate">
                {aviso.created_by_user.nombre}
              </p>
              <p className="text-[10px] text-[#71717a]">
                {aviso.created_by_user.role}
                {aviso.created_by_user.empresa && ` • ${aviso.created_by_user.empresa}`}
              </p>
            </div>
            <div className="text-[10px] text-[#52525b]">
              {formatDate(aviso.created_at)}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Acciones */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#52525b]">
          <Clock className="w-3 h-3" />
          <span>Expira en {Math.max(0, Math.ceil((new Date(aviso.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días</span>
          {aviso.solicita_permanente && (
            <span className="text-[#f59e0b]">• Pendiente aprobación</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
              title={isSuperAdmin && !isOwner ? 'Eliminar (Admin)' : 'Eliminar'}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {aviso.telefono && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCall}
              className="h-8 px-3 text-xs border-[#27272a] hover:border-[#3f3f46]"
            >
              <Phone className="w-3 h-3 mr-1" />
              Llamar
            </Button>
          )}
          {aviso.whatsapp && (
            <Button
              size="sm"
              onClick={handleWhatsApp}
              className="h-8 px-3 text-xs bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
