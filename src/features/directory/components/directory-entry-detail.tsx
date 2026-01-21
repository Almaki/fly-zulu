'use client'

import { useRouter } from 'next/navigation'
import { Phone, MapPin, Star, CheckCircle, MessageCircle, ArrowLeft, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { DIRECTORY_CATEGORIES, COLORS } from '@/shared/constants'
import type { DirectoryEntry } from '../types'

interface DirectoryEntryDetailProps {
  entry: DirectoryEntry
}

export function DirectoryEntryDetail({ entry }: DirectoryEntryDetailProps) {
  const router = useRouter()
  const category = DIRECTORY_CATEGORIES.find((c) => c.id === entry.category)

  const handleWhatsAppClick = () => {
    const phone = entry.whatsapp || entry.phone
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      "Hola! Soy tripulacion, Habra oportunidad de apoyo para una comanda? Llegamos en el vuelo..."
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    if (!entry.phone) return
    window.open(`tel:${entry.phone}`, '_self')
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
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
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/directory')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Directorio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-6">
            {/* Category & Airport */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category?.emoji}</span>
                <div>
                  <p className="text-sm text-zinc-500">{category?.label}</p>
                  <Badge variant="outline" className="mt-1">
                    {entry.airport_code}
                  </Badge>
                </div>
              </div>
              {entry.is_verified && (
                <div className="flex items-center gap-1 text-[#00ff88]">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-xs">Verificado</span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold mb-2">{entry.name}</h1>

            {/* Description */}
            {entry.description && (
              <p className="text-zinc-400 mb-4">{entry.description}</p>
            )}

            {/* Address */}
            {entry.address && (
              <div className="flex items-start gap-2 text-zinc-500 mb-4 p-3 bg-zinc-800/50 rounded-lg">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{entry.address}</span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(entry.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{entry.rating.toFixed(1)}</span>
              <span className="text-zinc-500">({entry.rating_count} reviews)</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {entry.phone && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handlePhoneClick}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar
                </Button>
              )}

              {(entry.whatsapp || entry.phone) && (
                <Button
                  size="lg"
                  className="flex-1"
                  style={{ backgroundColor: COLORS.whatsapp }}
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#22c55e]/10 to-[#4ade80]/10 border border-[#22c55e]/30 rounded-lg text-center">
          <p className="text-sm text-zinc-400 mb-3">
            Comparte este servicio con otros tripulantes
          </p>
          <Button
            onClick={handleShare}
            className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-black"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir servicio
          </Button>
        </div>
      </div>
    </div>
  )
}
