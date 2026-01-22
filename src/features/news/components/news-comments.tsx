'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Trash2, MessageCircle, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/features/auth/hooks'
import { getNewsComments, addNewsComment, deleteNewsComment } from '../services'
import type { NewsComment, NewsItem } from '../types'

interface NewsCommentsProps {
  news: NewsItem
}

export function NewsComments({ news }: NewsCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<NewsComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userRole = (user as { role?: string })?.role
  const isSuperAdmin = userRole === 'SUPERADMIN'

  const fetchComments = useCallback(async () => {
    const { data } = await getNewsComments(news.id)
    setComments(data || [])
    setIsLoading(false)
  }, [news.id])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const { data, error } = await addNewsComment(
      news.id,
      news.title,
      news.source,
      newComment.trim()
    )
    setIsSubmitting(false)

    if (error) {
      alert('Error al publicar: ' + error)
      return
    }

    if (data) {
      setComments([data, ...comments])
      setNewComment('')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return

    const { error } = await deleteNewsComment(commentId)
    if (error) {
      alert('Error al eliminar: ' + error)
      return
    }

    setComments(comments.filter(c => c.id !== commentId))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#E91E8C]" />
        <h3 className="font-semibold text-[#fafafa] text-sm">
          Opiniones ({comments.length})
        </h3>
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="¿Qué opinas de esta noticia?"
          maxLength={500}
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm resize-none",
            "bg-[#0a0a0a] border border-[#27272a]",
            "focus:border-[#E91E8C] focus:outline-none focus:ring-1 focus:ring-[#E91E8C]/50",
            "placeholder:text-[#52525b] text-[#fafafa]"
          )}
          rows={2}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#52525b]">
            {newComment.length}/500
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white h-8 px-3 text-xs"
          >
            <Send className="w-3 h-3 mr-1" />
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-5 h-5 border-2 border-[#E91E8C] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-[#52525b] text-sm">
            Sé el primero en opinar
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]"
            >
              {/* Comment header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E91E8C]/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-[#E91E8C]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#fafafa]">
                      {comment.user?.nombre || 'Usuario'}
                    </p>
                    <p className="text-[9px] text-[#52525b]">
                      {comment.user?.posicion} • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>

                {/* Delete button (owner or admin) */}
                {(user?.id === comment.user_id || isSuperAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 rounded hover:bg-[#ef4444]/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#52525b] hover:text-[#ef4444]" />
                  </button>
                )}
              </div>

              {/* Comment content */}
              <p className="text-sm text-[#a1a1aa]">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
