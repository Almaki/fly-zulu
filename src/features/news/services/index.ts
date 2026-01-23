'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { NewsItem, NewsComment, NewsSource, ZuluNewsItem } from '../types'

// Inline types to avoid Turbopack resolution issues
type NewsCommentInsert = {
  id?: string
  news_id: string
  news_title: string
  news_source: string
  content: string
  user_id: string
  created_at?: string
  updated_at?: string
}

type ZuluNewsInsert = {
  id?: string
  title: string
  description: string
  content?: string | null
  image_url?: string | null
  category?: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
  is_breaking?: boolean
  is_published?: boolean
  author_id?: string | null
  created_at?: string
  updated_at?: string
  published_at?: string
}

type ZuluNewsUpdate = {
  id?: string
  title?: string
  description?: string
  content?: string | null
  image_url?: string | null
  category?: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
  is_breaking?: boolean
  is_published?: boolean
  author_id?: string | null
  created_at?: string
  updated_at?: string
  published_at?: string
}

// Generate stable ID from URL
function generateNewsId(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Decode HTML entities and clean text
function cleanText(text: string): string {
  return text
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove encoded HTML tags (double-encoded)
    .replace(/&amp;lt;[^&]*&amp;gt;/g, '')
    .replace(/&lt;[^&]*&gt;/g, '')
    // Clean up multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .trim()
}

// Parse RSS XML to NewsItem array
function parseRSS(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = []

  // Simple regex-based XML parsing (works for most RSS feeds)
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []

  for (const itemXml of itemMatches.slice(0, 5)) { // Max 5 per source
    const getTag = (tag: string): string => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
      return (match?.[1] || match?.[2] || '').trim()
    }

    const rawTitle = getTag('title')
    const link = getTag('link')
    const rawDescription = getTag('description')
    const pubDate = getTag('pubDate')

    // Clean title and description
    const title = cleanText(rawTitle)
    const description = cleanText(rawDescription).substring(0, 300)

    // Try to find image
    const imageMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"|<enclosure[^>]*url="([^"]+)"|<image[^>]*>[\s\S]*?<url>([^<]+)/i)
    const imageUrl = imageMatch?.[1] || imageMatch?.[2] || imageMatch?.[3]

    // Skip items with malformed or empty titles
    if (title && link && title.length > 5 && !title.includes('&')) {
      items.push({
        id: generateNewsId(link),
        title,
        description,
        link,
        pubDate,
        source: source.name,
        sourceUrl: source.url,
        imageUrl,
        category: source.category,
      })
    }
  }

  return items
}

// Fetch news from RSS feeds
export async function fetchNews(
  category?: 'world' | 'aviation' | 'mexico' | 'business'
): Promise<{ data: NewsItem[] | null; error: string | null }> {
  try {
    const { NEWS_SOURCES } = await import('../types')

    const sources = category
      ? NEWS_SOURCES.filter(s => s.category === category)
      : NEWS_SOURCES

    const allNews: NewsItem[] = []

    // Fetch from multiple sources in parallel
    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const response = await fetch(source.url, {
            next: { revalidate: 300 }, // Cache for 5 minutes
            headers: {
              'User-Agent': 'FlyZulu/1.0',
            },
          })

          if (!response.ok) return []

          const xml = await response.text()
          return parseRSS(xml, source)
        } catch {
          console.error(`Failed to fetch ${source.name}`)
          return []
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value)
      }
    }

    // Sort by date (newest first)
    allNews.sort((a, b) => {
      const dateA = new Date(a.pubDate || 0).getTime()
      const dateB = new Date(b.pubDate || 0).getTime()
      return dateB - dateA
    })

    return { data: allNews.slice(0, 20), error: null }
  } catch (error) {
    console.error('Error fetching news:', error)
    return { data: null, error: 'Error al cargar noticias' }
  }
}

// Get single news item by ID
export async function getNewsById(
  id: string
): Promise<{ data: NewsItem | null; error: string | null }> {
  const { data: allNews } = await fetchNews()

  if (!allNews) {
    return { data: null, error: 'No se pudo cargar la noticia' }
  }

  const news = allNews.find(n => n.id === id)
  return { data: news || null, error: news ? null : 'Noticia no encontrada' }
}

// Get comments for a news item
export async function getNewsComments(
  newsId: string
): Promise<{ data: NewsComment[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('news_comments')
    .select(`
      *,
      user:users!news_comments_user_id_fkey(nombre, posicion)
    `)
    .eq('news_id', newsId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as NewsComment[], error: null }
}

// Add comment to a news item
export async function addNewsComment(
  newsId: string,
  newsTitle: string,
  newsSource: string,
  content: string
): Promise<{ data: NewsComment | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'No autenticado' }
  }

  const insertData: NewsCommentInsert = {
    news_id: newsId,
    news_title: newsTitle,
    news_source: newsSource,
    content,
    user_id: user.id,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('news_comments')
    .insert(insertData)
    .select(`
      *,
      user:users!news_comments_user_id_fkey(nombre, posicion)
    `)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as NewsComment, error: null }
}

// Delete comment
export async function deleteNewsComment(
  commentId: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('news_comments')
    .delete()
    .eq('id', commentId)

  return { error: error?.message || null }
}

// Get latest headline for breaking news banner
export async function getLatestHeadline(): Promise<{ data: NewsItem | null; error: string | null }> {
  // Primero buscar si hay una noticia breaking de Zulu News
  const { data: zuluBreaking } = await getZuluNewsBreaking()
  if (zuluBreaking) {
    return { data: zuluBreaking, error: null }
  }

  // Si no, usar la última noticia RSS
  const { data } = await fetchNews()

  if (!data || data.length === 0) {
    return { data: null, error: 'No hay noticias' }
  }

  return { data: data[0], error: null }
}

// ============================================
// ZULU NEWS - Noticias manuales
// ============================================

// Obtener todas las noticias de Zulu News
export async function getZuluNews(): Promise<{ data: ZuluNewsItem[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ZuluNewsItem[], error: null }
}

// Obtener noticia breaking de Zulu News (para el banner)
export async function getZuluNewsBreaking(): Promise<{ data: NewsItem | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .eq('is_published', true)
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return { data: null, error: null } // No breaking news, no es error
  }

  // Convertir a NewsItem format
  const newsItem: NewsItem = {
    id: data.id,
    title: data.title,
    description: data.description,
    link: `/news/zulu/${data.id}`,
    pubDate: data.published_at,
    source: 'Zulu News',
    sourceUrl: '/news',
    imageUrl: data.image_url,
    category: data.category,
    isZuluNews: true,
    isBreaking: true,
    content: data.content,
  }

  return { data: newsItem, error: null }
}

// Obtener una noticia de Zulu News por ID
export async function getZuluNewsById(
  id: string
): Promise<{ data: ZuluNewsItem | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ZuluNewsItem, error: null }
}

// Mapeo de categorías Zulu News -> categorías UI
// Zulu News usa: aviacion, operaciones, seguridad, anuncios, general
// UI usa: aviation, world, mexico, business
const ZULU_TO_UI_CATEGORY: Record<string, string> = {
  'aviacion': 'aviation',
  'operaciones': 'aviation', // Operaciones es parte de aviación
  'seguridad': 'aviation',   // Seguridad aérea es parte de aviación
  'anuncios': 'aviation',    // Anuncios de la app son de aviación
  'general': 'world',        // General va a mundial
}

// Combinar noticias RSS + Zulu News
export async function fetchAllNews(
  category?: string
): Promise<{ data: NewsItem[] | null; error: string | null }> {
  try {
    // Obtener ambas fuentes en paralelo
    const [rssResult, zuluResult] = await Promise.all([
      fetchNews(category as 'world' | 'aviation' | 'mexico' | 'business' | undefined),
      getZuluNews(),
    ])

    const allNews: NewsItem[] = []

    // Agregar noticias de Zulu News (convertidas a NewsItem)
    if (zuluResult.data) {
      for (const zulu of zuluResult.data) {
        // Mapear categoría de Zulu News a categoría UI
        const mappedCategory = ZULU_TO_UI_CATEGORY[zulu.category || 'general'] || 'world'

        // Filtrar por categoría si se especifica
        if (category && mappedCategory !== category) continue

        allNews.push({
          id: zulu.id,
          title: zulu.title,
          description: zulu.description,
          link: `/news/zulu/${zulu.id}`,
          pubDate: zulu.published_at,
          source: 'Zulu News',
          sourceUrl: '/news',
          imageUrl: zulu.image_url,
          category: mappedCategory, // Usar categoría mapeada para consistencia
          isZuluNews: true,
          isBreaking: zulu.is_breaking,
          content: zulu.content,
        })
      }
    }

    // Agregar noticias RSS
    if (rssResult.data) {
      allNews.push(...rssResult.data)
    }

    // Ordenar por fecha (más recientes primero)
    // Noticias breaking de Zulu News siempre primero
    allNews.sort((a, b) => {
      // Breaking news first
      if (a.isBreaking && !b.isBreaking) return -1
      if (!a.isBreaking && b.isBreaking) return 1

      // Then by date
      const dateA = new Date(a.pubDate || 0).getTime()
      const dateB = new Date(b.pubDate || 0).getTime()
      return dateB - dateA
    })

    return { data: allNews.slice(0, 30), error: null }
  } catch (error) {
    console.error('Error fetching all news:', error)
    return { data: null, error: 'Error al cargar noticias' }
  }
}

// ============================================
// ADMIN: CRUD Zulu News
// ============================================

// Crear noticia de Zulu News (solo SUPERADMIN)
export async function createZuluNews(
  newsData: {
    title: string
    description: string
    content?: string
    image_url?: string
    category: string
    is_breaking?: boolean
  }
): Promise<{ data: ZuluNewsItem | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'No autenticado' }
  }

  const insertData: ZuluNewsInsert = {
    title: newsData.title,
    description: newsData.description,
    content: newsData.content,
    image_url: newsData.image_url,
    category: newsData.category as 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general',
    is_breaking: newsData.is_breaking,
    author_id: user.id,
    is_published: true,
    published_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .insert(insertData)
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ZuluNewsItem, error: null }
}

// Actualizar noticia de Zulu News (solo SUPERADMIN)
export async function updateZuluNews(
  id: string,
  newsData: {
    title?: string
    description?: string
    content?: string
    image_url?: string
    category?: string
    is_breaking?: boolean
    is_published?: boolean
  }
): Promise<{ data: ZuluNewsItem | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const updateData: ZuluNewsUpdate = {
    title: newsData.title,
    description: newsData.description,
    content: newsData.content,
    image_url: newsData.image_url,
    category: newsData.category as 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general' | undefined,
    is_breaking: newsData.is_breaking,
    is_published: newsData.is_published,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ZuluNewsItem, error: null }
}

// Eliminar noticia de Zulu News (solo SUPERADMIN)
export async function deleteZuluNews(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('zulu_news')
    .delete()
    .eq('id', id)

  return { error: error?.message || null }
}

// Obtener todas las noticias de Zulu News (para admin, incluye no publicadas)
export async function getZuluNewsAdmin(): Promise<{ data: ZuluNewsItem[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('zulu_news')
    .select(`
      *,
      author:users!zulu_news_author_id_fkey(nombre, posicion)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as ZuluNewsItem[], error: null }
}
