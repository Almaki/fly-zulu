'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useAuth } from '@/features/auth/hooks'
import {
  PostCard,
  CommentCard,
  CreateCommentForm,
} from '@/features/forum/components'
import { getPost } from '@/features/forum/services'
import type { ForumPost, ForumComment, LoungeType } from '@/features/forum/types'
import { LOUNGE_INFO } from '@/features/forum/types'

interface PostDetailPageProps {
  loungeType: LoungeType
  loungeUrl: string
}

export function PostDetailPage({ loungeType, loungeUrl }: PostDetailPageProps) {
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string
  const { user, isLoading: authLoading } = useAuth()

  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loungeInfo = LOUNGE_INFO[loungeType]

  const fetchPost = useCallback(async () => {
    setIsLoading(true)
    const result = await getPost(postId)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      router.push(loungeUrl)
    } else {
      setPost(result.data)
      setComments(result.comments || [])
    }
  }, [postId, router, loungeUrl])

  useEffect(() => {
    if (!authLoading && postId) {
      fetchPost()
    }
  }, [authLoading, postId, fetchPost])

  // Check access
  const userPosicion = user?.posicion || ''
  const userRole = user?.role || ''
  const hasAccess = userRole === 'SUPERADMIN' || loungeInfo.allowedPositions.includes(userPosicion)

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 bg-zinc-800 rounded" />
          <Skeleton className="h-6 w-32 bg-zinc-800" />
        </div>
        <Skeleton className="h-48 w-full bg-zinc-800" />
        <Skeleton className="h-24 w-full bg-zinc-800" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-[#fafafa] mb-2">
          {loungeInfo.name} - Acceso Restringido
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Este espacio está reservado para el equipo de {loungeInfo.name.replace(' Lounge', '')}.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
        <h2 className="text-xl font-semibold text-[#fafafa] mb-2">
          Publicación no encontrada
        </h2>
        <Button variant="outline" onClick={() => router.push(loungeUrl)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al {loungeInfo.name}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(loungeUrl)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-[#fafafa]">Publicación</h1>
      </div>

      {/* Post */}
      <PostCard
        post={post}
        showFullContent
        onDeleted={() => router.push(loungeUrl)}
        onLikeToggled={fetchPost}
      />

      {/* Comments section */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Comentarios ({comments.length})
          </h3>

          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="space-y-0">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onDeleted={fetchPost}
                  onLikeToggled={fetchPost}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 py-4 text-center">
              Sé el primero en comentar
            </p>
          )}

          {/* Create comment form */}
          <CreateCommentForm
            postId={post.id}
            onCreated={fetchPost}
          />
        </CardContent>
      </Card>
    </div>
  )
}
