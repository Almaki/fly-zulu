'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { ForumPost, ForumComment, CreatePostData, CreateCommentData, LoungeType } from '../types'
import { LOUNGE_INFO } from '../types'

// Check if user has access to a specific lounge
function hasLoungeAccess(posicion: string, role: string, loungeType: LoungeType): boolean {
  if (role === 'SUPERADMIN') return true
  return LOUNGE_INFO[loungeType].allowedPositions.includes(posicion)
}

// Get all posts with author info (respecting anonymity)
export async function getPosts(loungeType: LoungeType = 'CREW', search?: string): Promise<{ data: ForumPost[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // Check user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, posicion')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role || ''
  const userPosicion = (profile as { posicion: string } | null)?.posicion || ''
  const isSuperAdmin = userRole === 'SUPERADMIN'

  // Check lounge access
  if (!hasLoungeAccess(userPosicion, userRole, loungeType)) {
    return { data: null, error: `No tienes acceso a ${LOUNGE_INFO[loungeType].name}` }
  }

  let query = supabase
    .from('forum_posts')
    .select(`
      *,
      author:users!author_id(id, nombre, posicion)
    `)
    .eq('lounge_type', loungeType)
    .order('created_at', { ascending: false })

  // Apply search filter
  if (search && search.trim()) {
    query = query.textSearch('content', search.trim(), { type: 'websearch', config: 'spanish' })
  }

  const { data: posts, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  // Get user's likes
  const { data: userLikes } = await supabase
    .from('forum_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .not('post_id', 'is', null)

  const likedPostIds = new Set((userLikes || []).map((l: { post_id: string }) => l.post_id))

  // Process posts to handle anonymity
  const processedPosts = (posts || []).map(post => {
    const typedPost = post as ForumPost & { author: { id: string; nombre: string; posicion: string } | null }

    // If anonymous and not superadmin, hide author info
    if (typedPost.is_anonymous && !isSuperAdmin) {
      return {
        ...typedPost,
        author: undefined,
        user_has_liked: likedPostIds.has(typedPost.id),
      }
    }

    return {
      ...typedPost,
      user_has_liked: likedPostIds.has(typedPost.id),
    }
  })

  return { data: processedPosts as ForumPost[], error: null }
}

// Get single post with comments
export async function getPost(postId: string): Promise<{ data: ForumPost | null; comments: ForumComment[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, comments: null, error: 'No autenticado' }

  // Check user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, posicion')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role || ''
  const userPosicion = (profile as { posicion: string } | null)?.posicion || ''
  const isSuperAdmin = userRole === 'SUPERADMIN'

  // First get the post to check lounge_type
  const { data: postCheck } = await supabase
    .from('forum_posts')
    .select('lounge_type')
    .eq('id', postId)
    .single()

  if (postCheck) {
    const loungeType = (postCheck as { lounge_type: LoungeType }).lounge_type || 'CREW'
    if (!hasLoungeAccess(userPosicion, userRole, loungeType)) {
      return { data: null, comments: null, error: `No tienes acceso a ${LOUNGE_INFO[loungeType].name}` }
    }
  }

  // Get post
  const { data: post, error: postError } = await supabase
    .from('forum_posts')
    .select(`
      *,
      author:users!author_id(id, nombre, posicion)
    `)
    .eq('id', postId)
    .single()

  if (postError) {
    return { data: null, comments: null, error: postError.message }
  }

  // Get comments
  const { data: comments, error: commentsError } = await supabase
    .from('forum_comments')
    .select(`
      *,
      author:users!author_id(id, nombre, posicion)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (commentsError) {
    return { data: null, comments: null, error: commentsError.message }
  }

  // Get user's likes for post and comments
  const { data: userLikes } = await supabase
    .from('forum_likes')
    .select('post_id, comment_id')
    .eq('user_id', user.id)

  type LikeRow = { post_id: string | null; comment_id: string | null }
  const likesArray = (userLikes || []) as LikeRow[]
  const likedPostIds = new Set(likesArray.filter(l => l.post_id).map(l => l.post_id as string))
  const likedCommentIds = new Set(likesArray.filter(l => l.comment_id).map(l => l.comment_id as string))

  // Process post
  const typedPost = post as ForumPost & { author: { id: string; nombre: string; posicion: string } | null }
  const processedPost: ForumPost = {
    ...typedPost,
    author: (typedPost.is_anonymous && !isSuperAdmin) ? undefined : typedPost.author || undefined,
    user_has_liked: likedPostIds.has(typedPost.id),
  }

  // Process comments
  const processedComments = (comments || []).map(comment => {
    const typedComment = comment as ForumComment & { author: { id: string; nombre: string; posicion: string } | null }

    if (typedComment.is_anonymous && !isSuperAdmin) {
      return {
        ...typedComment,
        author: undefined,
        user_has_liked: likedCommentIds.has(typedComment.id),
      }
    }

    return {
      ...typedComment,
      user_has_liked: likedCommentIds.has(typedComment.id),
    }
  })

  return { data: processedPost, comments: processedComments as ForumComment[], error: null }
}

// Create a new post
export async function createPost(data: CreatePostData): Promise<{ data: ForumPost | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // Check user has access to this lounge
  const { data: profile } = await supabase
    .from('users')
    .select('role, posicion')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role || ''
  const userPosicion = (profile as { posicion: string } | null)?.posicion || ''

  if (!hasLoungeAccess(userPosicion, userRole, data.lounge_type)) {
    return { data: null, error: `No tienes acceso a ${LOUNGE_INFO[data.lounge_type].name}` }
  }

  // Validate content
  if (!data.content.trim()) {
    return { data: null, error: 'El contenido no puede estar vacío' }
  }

  if (data.content.length > 2000) {
    return { data: null, error: 'El contenido no puede exceder 2000 caracteres' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post, error } = await (supabase.from('forum_posts') as any)
    .insert({
      author_id: user.id,
      content: data.content.trim(),
      is_anonymous: data.is_anonymous,
      lounge_type: data.lounge_type,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: post as ForumPost, error: null }
}

// Create a comment
export async function createComment(data: CreateCommentData): Promise<{ data: ForumComment | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // Validate content
  if (!data.content.trim()) {
    return { data: null, error: 'El comentario no puede estar vacío' }
  }

  if (data.content.length > 1000) {
    return { data: null, error: 'El comentario no puede exceder 1000 caracteres' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comment, error } = await (supabase.from('forum_comments') as any)
    .insert({
      post_id: data.post_id,
      author_id: user.id,
      content: data.content.trim(),
      is_anonymous: data.is_anonymous,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: comment as ForumComment, error: null }
}

// Toggle like on post
export async function togglePostLike(postId: string): Promise<{ liked: boolean; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { liked: false, error: 'No autenticado' }

  // Check if already liked
  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  const existingLike = existing as { id: string } | null

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('forum_likes') as any)
      .delete()
      .eq('id', existingLike.id)

    if (error) return { liked: false, error: error.message }
    return { liked: false, error: null }
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('forum_likes') as any)
      .insert({
        user_id: user.id,
        post_id: postId,
      })

    if (error) return { liked: false, error: error.message }
    return { liked: true, error: null }
  }
}

// Toggle like on comment
export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean; error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { liked: false, error: 'No autenticado' }

  // Check if already liked
  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  const existingLike = existing as { id: string } | null

  if (existingLike) {
    // Unlike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('forum_likes') as any)
      .delete()
      .eq('id', existingLike.id)

    if (error) return { liked: false, error: error.message }
    return { liked: false, error: null }
  } else {
    // Like
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('forum_likes') as any)
      .insert({
        user_id: user.id,
        comment_id: commentId,
      })

    if (error) return { liked: false, error: error.message }
    return { liked: true, error: null }
  }
}

// Delete post (author or SUPERADMIN)
export async function deletePost(postId: string): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('forum_posts') as any)
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Delete comment (author or SUPERADMIN)
export async function deleteComment(commentId: string): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('forum_comments') as any)
    .delete()
    .eq('id', commentId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
