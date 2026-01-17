'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Heart, MessageCircle, Trash2, User, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useAuth } from '@/features/auth/hooks'
import { togglePostLike, deletePost } from '../services'
import type { ForumPost } from '../types'

interface PostCardProps {
  post: ForumPost
  onDeleted?: () => void
  onLikeToggled?: () => void
  onClick?: () => void
  showFullContent?: boolean
}

export function PostCard({ post, onDeleted, onLikeToggled, onClick, showFullContent = false }: PostCardProps) {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localLiked, setLocalLiked] = useState(post.user_has_liked)
  const [localLikes, setLocalLikes] = useState(post.likes_count)

  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const isAuthor = user?.id === post.author_id
  const canDelete = isAuthor || isSuperAdmin

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiking) return

    setIsLiking(true)
    // Optimistic update
    setLocalLiked(!localLiked)
    setLocalLikes(prev => localLiked ? prev - 1 : prev + 1)

    const result = await togglePostLike(post.id)
    setIsLiking(false)

    if (result.error) {
      // Revert on error
      setLocalLiked(localLiked)
      setLocalLikes(post.likes_count)
      toast.error(result.error)
    } else {
      onLikeToggled?.()
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return

    setIsDeleting(true)
    const result = await deletePost(post.id)
    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Publicación eliminada')
      onDeleted?.()
    }
  }

  // Truncate content if not showing full
  const displayContent = showFullContent || post.content.length <= 280
    ? post.content
    : post.content.substring(0, 280) + '...'

  return (
    <Card
      className={cn(
        'border-zinc-800 bg-zinc-900/50 transition-all',
        onClick && 'cursor-pointer hover:border-zinc-700'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              post.is_anonymous
                ? 'bg-zinc-700'
                : 'bg-gradient-to-br from-[#0066CC] to-[#0088FF]'
            )}>
              {post.is_anonymous ? (
                <EyeOff className="h-5 w-5 text-zinc-400" />
              ) : post.author ? (
                <span className="text-sm font-bold text-white">
                  {post.author.nombre.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>

            {/* Author info */}
            <div>
              <div className="flex items-center gap-2">
                {post.is_anonymous ? (
                  <span className="font-medium text-zinc-400">Anónimo</span>
                ) : post.author ? (
                  <span className="font-medium text-[#fafafa]">{post.author.nombre}</span>
                ) : (
                  <span className="font-medium text-zinc-400">Usuario</span>
                )}

                {/* Show real author to SUPERADMIN if anonymous */}
                {post.is_anonymous && isSuperAdmin && post.author && (
                  <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400">
                    <Eye className="h-2.5 w-2.5 mr-1" />
                    {post.author.nombre}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {!post.is_anonymous && post.author && (
                  <span>{post.author.posicion}</span>
                )}
                <span>·</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Delete button */}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className={cn('h-4 w-4', isDeleting && 'animate-pulse')} />
            </Button>
          )}
        </div>

        {/* Content */}
        <p className="text-[#fafafa] whitespace-pre-wrap mb-4">{displayContent}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 gap-2',
              localLiked ? 'text-[#FF3B30]' : 'text-zinc-500'
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn('h-4 w-4', localLiked && 'fill-current')} />
            <span>{localLikes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 text-zinc-500"
            onClick={onClick}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
