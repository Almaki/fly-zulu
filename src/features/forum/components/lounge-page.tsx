'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks'
import {
  PostCard,
  CreatePostForm,
  ForumRules,
} from '@/features/forum/components'
import { getPosts } from '@/features/forum/services'
import type { ForumPost, LoungeType } from '@/features/forum/types'
import { LOUNGE_INFO } from '@/features/forum/types'

interface LoungeContentProps {
  loungeType: LoungeType
  backUrl: string
}

function LoungeContent({ loungeType, backUrl }: LoungeContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isSearching, setIsSearching] = useState(false)

  const loungeInfo = LOUNGE_INFO[loungeType]

  const fetchPosts = useCallback(async (search?: string) => {
    setIsLoading(true)
    const result = await getPosts(loungeType, search)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      setPosts(result.data)
    }
  }, [loungeType])

  useEffect(() => {
    if (!authLoading) {
      fetchPosts(searchParams.get('q') || undefined)
    }
  }, [authLoading, fetchPosts, searchParams])

  const handleSearch = () => {
    setIsSearching(true)
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    router.push(`${backUrl}/lounge${params.toString() ? '?' + params.toString() : ''}`)
    fetchPosts(searchQuery.trim() || undefined).finally(() => setIsSearching(false))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePostClick = (postId: string) => {
    router.push(`${backUrl}/lounge/${postId}`)
  }

  // Check access
  const userPosicion = user?.posicion || ''
  const userRole = user?.role || ''
  const hasAccess = userRole === 'SUPERADMIN' || loungeInfo.allowedPositions.includes(userPosicion)

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <Skeleton className="h-32 w-full bg-zinc-800" />
        <Skeleton className="h-48 w-full bg-zinc-800" />
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(backUrl)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#fafafa]">{loungeInfo.name}</h1>
          <p className="text-xs text-zinc-500">Foro interno del equipo</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar publicaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button
          size="icon"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Rules */}
      <ForumRules />

      {/* Create post */}
      <CreatePostForm
        loungeType={loungeType}
        onCreated={() => fetchPosts(searchQuery || undefined)}
      />

      {/* Posts list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-zinc-800" />
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-400">
              {searchQuery
                ? 'No se encontraron publicaciones'
                : 'Sé el primero en publicar algo'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post.id)}
              onDeleted={() => fetchPosts(searchQuery || undefined)}
              onLikeToggled={() => fetchPosts(searchQuery || undefined)}
            />
          ))
        )}
      </div>

      {/* Post count */}
      {posts.length > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {posts.length} publicación{posts.length !== 1 ? 'es' : ''}
        </p>
      )}
    </div>
  )
}

function LoungeLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full bg-zinc-800" />
      <Skeleton className="h-32 w-full bg-zinc-800" />
      <Skeleton className="h-48 w-full bg-zinc-800" />
    </div>
  )
}

interface LoungePageProps {
  loungeType: LoungeType
  backUrl: string
}

export function LoungePage({ loungeType, backUrl }: LoungePageProps) {
  return (
    <Suspense fallback={<LoungeLoading />}>
      <LoungeContent loungeType={loungeType} backUrl={backUrl} />
    </Suspense>
  )
}
