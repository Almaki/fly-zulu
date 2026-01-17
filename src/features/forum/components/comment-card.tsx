'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Heart, Trash2, User, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useAuth } from '@/features/auth/hooks'
import { toggleCommentLike, deleteComment } from '../services'
import type { ForumComment } from '../types'

interface CommentCardProps {
  comment: ForumComment
  onDeleted?: () => void
  onLikeToggled?: () => void
}

export function CommentCard({ comment, onDeleted, onLikeToggled }: CommentCardProps) {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localLiked, setLocalLiked] = useState(comment.user_has_liked)
  const [localLikes, setLocalLikes] = useState(comment.likes_count)

  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const isAuthor = user?.id === comment.author_id
  const canDelete = isAuthor || isSuperAdmin

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    setLocalLiked(!localLiked)
    setLocalLikes(prev => localLiked ? prev - 1 : prev + 1)

    const result = await toggleCommentLike(comment.id)
    setIsLiking(false)

    if (result.error) {
      setLocalLiked(localLiked)
      setLocalLikes(comment.likes_count)
      toast.error(result.error)
    } else {
      onLikeToggled?.()
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este comentario?')) return

    setIsDeleting(true)
    const result = await deleteComment(comment.id)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Comentario eliminado')
      onDeleted?.()
    }
  }

  return (
    <div className="flex gap-3 py-3 border-b border-zinc-800 last:border-0">
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        comment.is_anonymous
          ? 'bg-zinc-700'
          : 'bg-gradient-to-br from-[#22c55e] to-[#4ade80]'
      )}>
        {comment.is_anonymous ? (
          <EyeOff className="h-4 w-4 text-zinc-400" />
        ) : comment.author ? (
          <span className="text-xs font-bold text-white">
            {comment.author.nombre.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {comment.is_anonymous ? (
            <span className="text-sm font-medium text-zinc-400">Anónimo</span>
          ) : comment.author ? (
            <span className="text-sm font-medium text-[#fafafa]">{comment.author.nombre}</span>
          ) : (
            <span className="text-sm font-medium text-zinc-400">Usuario</span>
          )}

          {/* Show real author to SUPERADMIN if anonymous */}
          {comment.is_anonymous && isSuperAdmin && comment.author && (
            <Badge variant="outline" className="text-[9px] border-purple-500/50 text-purple-400 py-0">
              <Eye className="h-2 w-2 mr-0.5" />
              {comment.author.nombre}
            </Badge>
          )}

          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-600">{timeAgo}</span>
        </div>

        <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 px-2 gap-1 text-xs',
              localLiked ? 'text-[#FF3B30]' : 'text-zinc-500'
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn('h-3 w-3', localLiked && 'fill-current')} />
            <span>{localLikes}</span>
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-zinc-500 hover:text-[#FF3B30]"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className={cn('h-3 w-3', isDeleting && 'animate-pulse')} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
