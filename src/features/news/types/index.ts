export interface NewsItem {
  id: string // Hash del URL o UUID para Zulu News
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceUrl: string
  imageUrl?: string
  category?: string
  isZuluNews?: boolean // Si es noticia propia de Zulu News
  isBreaking?: boolean // Si es noticia urgente
  content?: string // Contenido completo (solo Zulu News)
}

// Noticia de Zulu News (tabla en Supabase)
export interface ZuluNewsItem {
  id: string
  title: string
  description: string
  content?: string
  image_url?: string
  category: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
  is_breaking: boolean
  is_published: boolean
  author_id?: string
  created_at: string
  updated_at: string
  published_at: string
  author?: {
    nombre: string
    posicion: string
  }
}

// Categorías de Zulu News
export const ZULU_NEWS_CATEGORIES = [
  { value: 'aviacion', label: 'Aviación', color: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30' },
  { value: 'operaciones', label: 'Operaciones', color: 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30' },
  { value: 'seguridad', label: 'Seguridad', color: 'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30' },
  { value: 'anuncios', label: 'Anuncios', color: 'bg-[#E91E8C]/20 text-[#E91E8C] border-[#E91E8C]/30' },
  { value: 'general', label: 'General', color: 'bg-[#71717a]/20 text-[#a1a1aa] border-[#71717a]/30' },
] as const

export interface NewsComment {
  id: string
  news_id: string
  news_title: string
  news_source: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  user?: {
    nombre: string
    posicion: string
  }
}

export interface NewsSource {
  name: string
  url: string
  category: 'world' | 'aviation' | 'mexico' | 'business'
}

// Fuentes RSS confiables
export const NEWS_SOURCES: NewsSource[] = [
  // Noticias mundiales
  { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', category: 'world' },
  { name: 'CNN', url: 'https://rss.cnn.com/rss/edition_world.rss', category: 'world' },

  // Noticias México - Múltiples fuentes
  { name: 'Milenio', url: 'https://www.milenio.com/rss', category: 'mexico' },
  { name: 'El Universal', url: 'https://www.eluniversal.com.mx/rss.xml', category: 'mexico' },
  { name: 'Excélsior', url: 'https://www.excelsior.com.mx/rss.xml', category: 'mexico' },
  { name: 'El Financiero', url: 'https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/', category: 'mexico' },
  { name: 'Reforma', url: 'https://www.reforma.com/rss/portada.xml', category: 'mexico' },

  // Aviación - Múltiples fuentes para cobertura completa
  { name: 'Simple Flying', url: 'https://simpleflying.com/feed/', category: 'aviation' },
  { name: 'AeroTime', url: 'https://www.aerotime.aero/feed', category: 'aviation' },
  { name: 'Airways Magazine', url: 'https://airwaysmag.com/feed/', category: 'aviation' },
  { name: 'Aviation24', url: 'https://www.aviation24.be/feed/', category: 'aviation' },
  { name: 'FlightGlobal', url: 'https://www.flightglobal.com/rss', category: 'aviation' },

  // Negocios
  { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'business' },
  { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'business' },
]
