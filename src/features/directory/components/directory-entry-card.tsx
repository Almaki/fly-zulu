'use client'

import { Phone, MapPin, Star, CheckCircle, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { DIRECTORY_CATEGORIES, COLORS } from '@/shared/constants'
import type { DirectoryEntry } from '../types'

interface DirectoryEntryCardProps {
  entry: DirectoryEntry
}

export function DirectoryEntryCard({ entry }: DirectoryEntryCardProps) {
  const category = DIRECTORY_CATEGORIES.find((c) => c.id === entry.category)

  const handleWhatsAppClick = () => {
    const phone = entry.whatsapp || entry.phone
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      "Hola! Soy tripulación, ¿Habrá oportunidad de apoyo para una comanda? Llegamos en el vuelo..."
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    window.open(`tel:${entry.phone}`, '_self')
  }

  return (
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

          <Badge variant="outline" className="text-xs">
            {entry.airport_code}
          </Badge>
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

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(entry.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-zinc-400">
            {entry.rating.toFixed(1)} ({entry.rating_count})
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePhoneClick}
          >
            <Phone className="h-4 w-4 mr-2" />
            Llamar
          </Button>

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
      </CardContent>
    </Card>
  )
}
