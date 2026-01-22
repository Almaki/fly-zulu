'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Share2, Clock, Newspaper, Zap, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewsComments } from '@/features/news/components'
import { getZuluNewsById } from '@/features/news/services'
import { ZULU_NEWS_CATEGORIES, type ZuluNewsItem, type NewsItem } from '@/features/news/types'

export default function ZuluNewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const newsId = params.id as string

  const [news, setNews] = useState<ZuluNewsItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await getZuluNewsById(newsId)
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
      text: `${news.title} - Zulu News`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${news.title}\n${window.location.href}`)
        alert('Link copiado al portapapeles')
      }
    } catch {
      // User cancelled share
    }
  }

  const getCategoryStyle = (cat: string) => {
    const found = ZULU_NEWS_CATEGORIES.find(c => c.value === cat)
    return found?.color || 'bg-zinc-800 text-zinc-400'
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
          <Newspaper className="w-10 h-10 text-[#52525b] mx-auto mb-3" />
          <p className="text-[#ef4444] mb-4">{error || 'Noticia no encontrada'}</p>
          <Button onClick={() => router.push('/news')} variant="outline">
            Volver a noticias
          </Button>
        </div>
      </div>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(news.published_at), { addSuffix: true, locale: es })

  // Convert to NewsItem for comments component
  const newsItem: NewsItem = {
    id: news.id,
    title: news.title,
    description: news.description,
    link: `/news/zulu/${news.id}`,
    pubDate: news.published_at,
    source: 'Zulu News',
    sourceUrl: '/news',
    imageUrl: news.image_url,
    category: news.category,
    isZuluNews: true,
    isBreaking: news.is_breaking,
    content: news.content,
  }

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
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#E91E8C]" />
              <span className="text-xs font-bold">
                <span className="text-[#E91E8C]">Zulu</span>
                <span className="text-white"> News</span>
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="h-8 w-8 p-0"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* News Content */}
        <div className="rounded-xl bg-[#141414] border border-[#27272a] overflow-hidden mb-4">
          {/* Image */}
          {news.image_url && (
            <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
              <img
                src={news.image_url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              {/* Zulu News Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#E91E8C] text-white text-xs font-bold">
                <Zap className="w-3 h-3 fill-current" />
                ZULU NEWS
              </div>
            </div>
          )}

          <div className="p-4">
            {/* Category & Breaking */}
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border",
                getCategoryStyle(news.category)
              )}>
                {ZULU_NEWS_CATEGORIES.find(c => c.value === news.category)?.label || news.category}
              </span>
              {news.is_breaking && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30">
                  <Zap className="w-3 h-3 fill-current" />
                  Breaking
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-bold text-xl text-[#fafafa] mb-3">
              {news.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-[#71717a] mb-4">
              <span className="flex items-center gap-1 font-medium text-[#E91E8C]">
                <Newspaper className="w-3 h-3" />
                Zulu News
              </span>
              <span className="flex items-center gap-1 text-[#52525b]">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
              {news.author && (
                <span className="flex items-center gap-1 text-[#52525b]">
                  <User className="w-3 h-3" />
                  {news.author.nombre}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
              {news.description}
            </p>

            {/* Full Content */}
            {news.content && (
              <div className="pt-4 border-t border-[#27272a]">
                <p className="text-[#d4d4d8] text-sm leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="rounded-xl bg-[#141414] border border-[#27272a] p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#71717a]">Comparte esta noticia</p>
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
          <NewsComments news={newsItem} />
        </div>
      </div>
    </div>
  )
}
