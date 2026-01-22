'use client'

import Link from 'next/link'
import { Clock, ExternalLink, MessageCircle } from 'lucide-react'
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
      <Link
        href={`/news/${news.id}`}
        className="flex items-start gap-3 p-3 rounded-lg bg-[#141414] border border-[#27272a] hover:border-[#3f3f46] transition-colors group"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#fafafa] line-clamp-2 group-hover:text-[#E91E8C] transition-colors">
            {news.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#71717a]">{news.source}</span>
            {timeAgo && (
              <>
                <span className="text-[#3f3f46]">•</span>
                <span className="text-[10px] text-[#52525b]">{timeAgo}</span>
              </>
            )}
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#E91E8C] flex-shrink-0 mt-0.5" />
      </Link>
    )
  }

  return (
    <Link
      href={`/news/${news.id}`}
      className="block rounded-xl bg-[#141414] border border-[#27272a] hover:border-[#3f3f46] overflow-hidden transition-colors group"
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
        <h3 className="font-semibold text-[#fafafa] text-base line-clamp-2 group-hover:text-[#E91E8C] transition-colors">
          {news.title}
        </h3>

        {/* Description */}
        {news.description && (
          <p className="text-sm text-[#a1a1aa] line-clamp-2 mt-2">
            {news.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717a] font-medium">{news.source}</span>
            {timeAgo && (
              <span className="flex items-center gap-1 text-[10px] text-[#52525b]">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[#52525b]">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-[10px]">Opinar</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
