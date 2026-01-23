'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { NewsItem } from '../types'

interface NewsCardProps {
  news: NewsItem
  compact?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  world: 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30',
  aviation: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30',
  mexico: 'bg-[#E91E8C]/20 text-[#E91E8C] border-[#E91E8C]/30',
  business: 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30',
}

const CATEGORY_LABELS: Record<string, string> = {
  world: 'Mundial',
  aviation: 'Aviación',
  mexico: 'México',
  business: 'Negocios',
}

export function NewsCard({ news, compact = false }: NewsCardProps) {
  const timeAgo = news.pubDate
    ? formatDistanceToNow(new Date(news.pubDate), { addSuffix: true, locale: es })
    : null

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[#141414] border border-[#27272a] transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#fafafa] line-clamp-2">
            {news.title}
          </p>
          {timeAgo && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-[#52525b]">{timeAgo}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="block rounded-xl bg-[#141414] border border-[#27272a] overflow-hidden transition-colors"
    >
      {/* Image placeholder */}
      {news.imageUrl && (
        <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
          <img
            src={news.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Category badge */}
        {news.category && (
          <span className={cn(
            "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border mb-2",
            CATEGORY_COLORS[news.category] || CATEGORY_COLORS.world
          )}>
            {CATEGORY_LABELS[news.category] || news.category}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-[#fafafa] text-base line-clamp-2">
          {news.title}
        </h3>

        {/* Description */}
        {news.description && (
          <p className="text-sm text-[#a1a1aa] line-clamp-2 mt-2">
            {news.description}
          </p>
        )}

        {/* Footer - Solo tiempo */}
        <div className="flex items-center mt-3 pt-3 border-t border-[#1f1f1f]">
          {timeAgo && (
            <span className="flex items-center gap-1 text-[10px] text-[#52525b]">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
