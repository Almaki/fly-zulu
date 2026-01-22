'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Zap, Newspaper, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/shared/lib/supabase/client'
import {
  getZuluNewsAdmin,
  createZuluNews,
  updateZuluNews,
  deleteZuluNews
} from '@/features/news/services'
import { ZULU_NEWS_CATEGORIES, type ZuluNewsItem } from '@/features/news/types'

export default function ZuluNewsAdminPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [news, setNews] = useState<ZuluNewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<ZuluNewsItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [category, setCategory] = useState<string>('general')
  const [isBreaking, setIsBreaking] = useState(false)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    setIsLoading(true)
    const { data, error } = await getZuluNewsAdmin()
    if (!error && data) {
      setNews(data)
    }
    setIsLoading(false)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setContent('')
    setImageUrl('')
    setImagePreview('')
    setCategory('general')
    setIsBreaking(false)
    setEditingNews(null)
    setShowForm(false)
  }

  const handleEdit = (item: ZuluNewsItem) => {
    setEditingNews(item)
    setTitle(item.title)
    setDescription(item.description)
    setContent(item.content || '')
    setImageUrl(item.image_url || '')
    setImagePreview(item.image_url || '')
    setCategory(item.category)
    setIsBreaking(item.is_breaking)
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB')
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `news/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('zulu-news')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        alert('Error al subir imagen: ' + error.message)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('zulu-news')
        .getPublicUrl(filePath)

      setImageUrl(urlData.publicUrl)
      setImagePreview(urlData.publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error al subir imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)

    const newsData = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      category,
      is_breaking: isBreaking,
    }

    if (editingNews) {
      const { error } = await updateZuluNews(editingNews.id, newsData)
      if (!error) {
        await loadNews()
        resetForm()
      }
    } else {
      const { error } = await createZuluNews(newsData)
      if (!error) {
        await loadNews()
        resetForm()
      }
    }

    setIsSubmitting(false)
  }

  const handleTogglePublish = async (item: ZuluNewsItem) => {
    await updateZuluNews(item.id, { is_published: !item.is_published })
    await loadNews()
  }

  const handleToggleBreaking = async (item: ZuluNewsItem) => {
    await updateZuluNews(item.id, { is_breaking: !item.is_breaking })
    await loadNews()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await deleteZuluNews(id)
    await loadNews()
  }

  const getCategoryStyle = (cat: string) => {
    const found = ZULU_NEWS_CATEGORIES.find(c => c.value === cat)
    return found?.color || 'bg-zinc-800 text-zinc-400'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#E91E8C]" />
                Zulu News
              </h1>
              <p className="text-xs text-zinc-500">Publicar noticias</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#E91E8C] hover:bg-[#E91E8C]/90"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Form */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold text-white">
              {editingNews ? 'Editar Noticia' : 'Nueva Noticia'}
            </h2>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Título *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la noticia"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Descripción *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resumen breve de la noticia"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Contenido completo (opcional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenido detallado de la noticia..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Imagen</label>

              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative mb-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-zinc-700"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer transition-colors mb-3",
                    "hover:border-[#E91E8C]/50 hover:bg-zinc-800/50",
                    isUploading && "pointer-events-none opacity-50"
                  )}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin mb-2" />
                      <p className="text-sm text-zinc-400">Subiendo imagen...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-zinc-600 mb-2" />
                      <p className="text-sm text-zinc-400">Click para subir imagen</p>
                      <p className="text-xs text-zinc-600 mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* URL Manual Option */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">o pega una URL</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <Input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImagePreview(e.target.value)
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="bg-zinc-800 border-zinc-700 mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {ZULU_NEWS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      category === cat.value
                        ? cat.color
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBreaking(!isBreaking)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                  isBreaking
                    ? "bg-[#ef4444]/20 border-[#ef4444]/50 text-[#f87171]"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400"
                )}
              >
                <Zap className={cn("w-4 h-4", isBreaking && "fill-current")} />
                <span className="text-sm">Breaking News</span>
              </button>
              <span className="text-xs text-zinc-500">
                Aparecerá en el banner superior
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || isSubmitting || isUploading}
                className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90"
              >
                {isSubmitting ? 'Guardando...' : (editingNews ? 'Actualizar' : 'Publicar')}
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-zinc-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* News List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No hay noticias publicadas</p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 border-[#E91E8C] text-[#E91E8C]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear primera noticia
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-zinc-900 border rounded-xl p-4",
                  item.is_published ? "border-zinc-800" : "border-zinc-700/50 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  {item.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        getCategoryStyle(item.category)
                      )}>
                        {ZULU_NEWS_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                      {item.is_breaking && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30">
                          <Zap className="w-3 h-3 fill-current" />
                          Breaking
                        </span>
                      )}
                      {!item.is_published && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                          Borrador
                        </span>
                      )}
                    </div>

                    <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                      {item.author && ` • ${item.author.nombre}`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                      item.is_published
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    {item.is_published ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Publicada
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Oculta
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleBreaking(item)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                      item.is_breaking
                        ? "bg-[#ef4444]/20 text-[#f87171] hover:bg-[#ef4444]/30"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    <Zap className={cn("w-3 h-3", item.is_breaking && "fill-current")} />
                    Breaking
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
