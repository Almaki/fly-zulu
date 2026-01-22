'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Radio, Newspaper, Zap, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { NewsCard } from '@/features/news/components'
import { fetchAllNews } from '@/features/news/services'
import { createClient } from '@/shared/lib/supabase/client'
import type { NewsItem } from '@/features/news/types'
import { ZULU_NEWS_CATEGORIES } from '@/features/news/types'

type Category = 'all' | 'world' | 'aviation' | 'mexico' | 'business' | 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'Todas', emoji: '🌐' },
  { id: 'aviacion', label: 'Aviación', emoji: '✈️' },
  { id: 'operaciones', label: 'Operaciones', emoji: '🛫' },
  { id: 'seguridad', label: 'Seguridad', emoji: '🛡️' },
  { id: 'anuncios', label: 'Anuncios', emoji: '📢' },
  { id: 'world', label: 'Mundial', emoji: '🌍' },
  { id: 'mexico', label: 'México', emoji: '🇲🇽' },
  { id: 'business', label: 'Negocios', emoji: '💼' },
]

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [hasNewContent, setHasNewContent] = useState(false)

  const loadNews = useCallback(async () => {
    setIsLoading(true)
    setHasNewContent(false)
    const category = selectedCategory === 'all' ? undefined : selectedCategory
    const { data } = await fetchAllNews(category)
    setNews(data || [])
    setIsLoading(false)
  }, [selectedCategory])

  // Initial load and category change
  useEffect(() => {
    loadNews()
  }, [loadNews])

  // Real-time subscription for zulu_news changes
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('zulu_news_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'zulu_news',
        },
        (payload) => {
          console.log('📰 Zulu News update:', payload.eventType)
          // Show refresh indicator instead of auto-refresh to avoid jarring UX
          setHasNewContent(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header - Zulu News Branding */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/home')}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#a1a1aa]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Newspaper className="w-5 h-5 text-[#E91E8C]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
              </div>
              <h1 className="text-lg font-bold">
                <span className="text-[#E91E8C]">Zulu</span>
                <span className="text-white"> News</span>
              </h1>
            </div>
            <p className="text-xs text-[#71717a]">Noticias de aviación en tiempo real</p>
          </div>
        </div>

        {/* New Content Banner */}
        {hasNewContent && (
          <button
            onClick={loadNews}
            className="w-full mb-3 py-2 px-4 bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-xl flex items-center justify-center gap-2 text-[#E91E8C] text-sm font-medium animate-pulse hover:bg-[#E91E8C]/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Nuevas noticias disponibles - Toca para actualizar
          </button>
        )}

        {/* Category Chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all text-xs",
                selectedCategory === cat.id
                  ? "bg-[#E91E8C] border-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/20"
                  : "bg-[#0a0a0a] border-[#27272a] text-zinc-400 active:scale-95"
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-zinc-800 rounded-xl" />
            ))
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="w-10 h-10 text-[#52525b] mx-auto mb-3" />
              <p className="text-[#71717a] text-sm">No hay noticias disponibles</p>
              <p className="text-[#52525b] text-xs mt-1">Intenta de nuevo más tarde</p>
            </div>
          ) : (
            news.map((item) => (
              <div key={item.id} className="relative">
                {/* Zulu News Badge */}
                {item.isZuluNews && (
                  <div className="absolute -top-1 -left-1 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E91E8C] text-white text-[9px] font-bold">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    ZULU
                  </div>
                )}
                <NewsCard news={item} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-[#1f1f1f] mt-6">
          <p className="text-[10px] text-[#52525b]">
            <span className="text-[#E91E8C]">Zulu News</span> + BBC, CNN, Milenio, Bloomberg
          </p>
        </div>
      </div>
    </div>
  )
}
