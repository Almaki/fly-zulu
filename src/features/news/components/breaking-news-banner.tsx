'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Radio, ChevronRight, X, Zap, Newspaper } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getLatestHeadline } from '../services'
import type { NewsItem } from '../types'

interface BreakingNewsBannerProps {
  className?: string
}

export function BreakingNewsBanner({ className }: BreakingNewsBannerProps) {
  const [headline, setHeadline] = useState<NewsItem | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHeadline = async () => {
      const { data } = await getLatestHeadline()
      setHeadline(data)
      setIsLoading(false)
    }

    fetchHeadline()

    // Refresh every 5 minutes
    const interval = setInterval(fetchHeadline, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible || isLoading || !headline) return null

  // Determine if it's Zulu News (priority) or regular RSS
  const isZuluNews = headline.isZuluNews
  const isBreaking = headline.isBreaking

  // Different styling for Zulu News breaking vs regular RSS
  const gradientClass = isZuluNews
    ? "from-[#E91E8C]/15 via-[#E91E8C]/5 to-transparent"
    : "from-[#ef4444]/10 via-[#ef4444]/5 to-transparent"

  const borderClass = isZuluNews
    ? "border-[#E91E8C]/30"
    : "border-[#ef4444]/20"

  const accentColor = isZuluNews ? "#E91E8C" : "#ef4444"

  // Link destination
  const href = isZuluNews ? `/news/zulu/${headline.id}` : `/news/${headline.id}`

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r",
        gradientClass,
        "border-b",
        borderClass,
        className
      )}
    >
      <Link
        href={href}
        className="flex items-center gap-2 px-3 py-1.5 group"
      >
        {/* Breaking News Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isZuluNews ? (
            <>
              <Zap className="w-3 h-3 fill-current" style={{ color: accentColor }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {isBreaking ? 'Breaking' : 'Zulu'}
              </span>
            </>
          ) : (
            <>
              <Radio className="w-3 h-3 animate-pulse" style={{ color: accentColor }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                Breaking
              </span>
            </>
          )}
        </div>

        {/* Separator */}
        <div
          className="w-px h-3 flex-shrink-0"
          style={{ backgroundColor: `${accentColor}30` }}
        />

        {/* Source badge for Zulu News */}
        {isZuluNews && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Newspaper className="w-2.5 h-2.5 text-[#E91E8C]" />
            <span className="text-[9px] font-medium text-[#E91E8C]">
              Zulu News
            </span>
          </div>
        )}

        {/* Headline with marquee effect on small screens */}
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-[#fafafa]/90 truncate group-hover:text-[#fafafa] transition-colors">
            {headline.title}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          className="w-3.5 h-3.5 text-[#71717a] group-hover:translate-x-0.5 transition-all flex-shrink-0"
          style={{ '--tw-hover-color': accentColor } as React.CSSProperties}
        />
      </Link>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsVisible(false)
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
        style={{
          ['--hover-bg' as string]: `${accentColor}10`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${accentColor}15`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <X className="w-3 h-3 text-[#71717a] hover:text-[#ef4444]" />
      </button>
    </div>
  )
}
