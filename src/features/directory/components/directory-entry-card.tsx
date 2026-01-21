'use client'

import { useState } from 'react'
import { Phone, MapPin, Star, CheckCircle, MessageCircle, Clock, User, Edit2, Trash2, MoreVertical, Users, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { DIRECTORY_CATEGORIES, COLORS } from '@/shared/constants'
import { useAuth } from '@/features/auth/hooks'
import { rateDirectoryEntry } from '../services'
import { deleteDirectoryEntry } from '@/features/admin/services'
import type { DirectoryEntry } from '../types'

interface DirectoryEntryCardProps {
  entry: DirectoryEntry
  onEdit?: (entry: DirectoryEntry) => void
  onDeleted?: () => void
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoverValue || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function DirectoryEntryCard({ entry, onEdit, onDeleted }: DirectoryEntryCardProps) {
  const { user } = useAuth()
  const category = DIRECTORY_CATEGORIES.find((c) => c.id === entry.category)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Solo SUPERADMIN puede eliminar
  const isAdmin = user?.role === 'SUPERADMIN'
  // Todos los usuarios autenticados pueden editar
  const canEdit = !!user

  const handleWhatsAppClick = () => {
    const phone = entry.whatsapp || entry.phone
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      "Hola! Soy tripulación, ¿Habrá oportunidad de apoyo para una comanda? Llegamos en el vuelo..."
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    if (!entry.phone) return
    window.open(`tel:${entry.phone}`, '_self')
  }

  const handleSubmitRating = async () => {
    if (newRating === 0) {
      toast.error('Selecciona una calificación')
      return
    }

    setIsSubmitting(true)
    const result = await rateDirectoryEntry(entry.id, newRating)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Gracias por tu review!')
      setIsRatingOpen(false)
      setNewRating(0)
      onDeleted?.() // Refresh the list
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${entry.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const result = await deleteDirectoryEntry(entry.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Servicio eliminado')
      // Small delay to ensure DB is updated before refetching
      setTimeout(() => {
        onDeleted?.()
      }, 100)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/directory/${entry.id}`
    const shareData = {
      title: `${entry.name} - FLY-ZULU`,
      text: `${category?.emoji} ${entry.name} en ${entry.airport_code}. App colaborativa para tripulaciones.`,
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copiado al portapapeles')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copiado al portapapeles')
      }
    }
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category?.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{entry.name}</h3>
                  {entry.is_verified && (
                    <CheckCircle className="h-4 w-4 text-[#00ff88]" />
                  )}
                </div>
                <p className="text-xs text-zinc-500">{category?.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entry.airport_code}
              </Badge>

              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </DropdownMenuItem>
                    {canEdit && onEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(entry)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-[#FF3B30] focus:text-[#FF3B30]"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {entry.description && (
            <p className="text-sm text-zinc-400 mb-3">{entry.description}</p>
          )}

          {entry.address && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{entry.address}</span>
            </div>
          )}

          {/* Rating - clickable to add review */}
          <button
            onClick={() => setIsRatingOpen(true)}
            className="flex items-center gap-2 mb-4 p-2 -m-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 transition-colors ${
                    i < Math.round(entry.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-zinc-700 group-hover:text-zinc-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-400">
              {entry.rating.toFixed(1)} ({entry.rating_count})
            </span>
            <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
              · Agregar review
            </span>
          </button>

          {/* Actions */}
          <div className="flex gap-2">
            {entry.phone && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handlePhoneClick}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            )}

            {(entry.whatsapp || entry.phone) && (
              <Button
                size="sm"
                className="flex-1"
                style={{ backgroundColor: COLORS.whatsapp }}
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
          </div>

          {/* Last update info */}
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {entry.updated_at !== entry.created_at ? 'Actualizado' : 'Agregado'}{' '}
                  {formatDistanceToNow(new Date(entry.updated_at || entry.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Colaborativo badge */}
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30">
                  <Users className="h-2.5 w-2.5 text-[#4ade80]" />
                  <span className="text-[9px] font-medium text-[#4ade80]">Colaborativo</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>
                    {entry.updated_by_user?.nombre || entry.created_by_user?.nombre || 'Usuario'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-center">Califica {entry.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <StarRating value={newRating} onChange={setNewRating} />
            <p className="text-sm text-zinc-500 text-center">
              Tu calificación ayuda a otros tripulantes a encontrar los mejores servicios
            </p>
            <Button
              onClick={handleSubmitRating}
              disabled={newRating === 0 || isSubmitting}
              className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-black"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
