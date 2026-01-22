'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Share2, Clock, Radio } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewsComments } from '@/features/news/components'
import { getNewsById } from '@/features/news/services'
import type { NewsItem } from '@/features/news/types'

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

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const newsId = params.id as string

  const [news, setNews] = useState<NewsItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await getNewsById(newsId)
      if (error) {
        setError(error)
      } else {
        setNews(data)
      }
      setIsLoading(false)
    }

    loadNews()
  }, [newsId])

  const handleShare = async () => {
    if (!news) return

    const shareData = {
      title: news.title,
      text: `${news.title} - ${news.source}`,
      url: news.link,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${news.title}\n${news.link}`)
        alert('Link copiado al portapapeles')
      }
    } catch {
      // User cancelled share
    }
  }

  const handleOpenOriginal = () => {
    if (news?.link) {
      window.open(news.link, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-10 w-full bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800 rounded-xl" />
          <Skeleton className="h-24 w-full bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-10 h-10 text-[#52525b] mx-auto mb-3" />
          <p className="text-[#ef4444] mb-4">{error || 'Noticia no encontrada'}</p>
          <Button onClick={() => router.push('/news')} variant="outline">
            Volver a noticias
          </Button>
        </div>
      </div>
    )
  }

  const timeAgo = news.pubDate
    ? formatDistanceToNow(new Date(news.pubDate), { addSuffix: true, locale: es })
    : null

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/news')}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#a1a1aa]" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-[#71717a]">{news.source}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenOriginal}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* News Content */}
        <div className="rounded-xl bg-[#141414] border border-[#27272a] overflow-hidden mb-4">
          {/* Image */}
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
            {/* Category */}
            {news.category && (
              <span className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border mb-3",
                CATEGORY_COLORS[news.category] || CATEGORY_COLORS.world
              )}>
                {CATEGORY_LABELS[news.category] || news.category}
              </span>
            )}

            {/* Title */}
            <h1 className="font-bold text-xl text-[#fafafa] mb-3">
              {news.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-[#71717a] mb-4">
              <span className="font-medium">{news.source}</span>
              {timeAgo && (
                <span className="flex items-center gap-1 text-[#52525b]">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
              )}
            </div>

            {/* Description */}
            {news.description && (
              <p className="text-[#a1a1aa] text-sm leading-relaxed">
                {news.description}
              </p>
            )}

            {/* Read More Button */}
            <Button
              onClick={handleOpenOriginal}
              className="w-full mt-4 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Leer artículo completo
            </Button>
          </div>
        </div>

        {/* Share Section */}
        <div className="rounded-xl bg-[#141414] border border-[#27272a] p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#71717a]">¿Te parece interesante?</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-[#E91E8C] text-[#E91E8C] hover:bg-[#E91E8C]/10"
            >
              <Share2 className="w-3.5 h-3.5 mr-1" />
              Compartir
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-xl bg-[#141414] border border-[#27272a] p-4">
          <NewsComments news={news} />
        </div>
      </div>
    </div>
  )
}
