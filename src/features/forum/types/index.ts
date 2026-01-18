export interface ForumAuthor {
  id: string
  nombre: string
  posicion: string
}

// Tipos de lounges disponibles
export type LoungeType = 'CREW' | 'OPS' | 'TRAFICO' | 'MANTTO'

export const LOUNGE_INFO: Record<LoungeType, { name: string; allowedPositions: string[] }> = {
  CREW: { name: 'Crew Lounge', allowedPositions: ['PILOT', 'FA'] },
  OPS: { name: 'Ops Lounge', allowedPositions: ['OPS'] },
  TRAFICO: { name: 'Traffic Lounge', allowedPositions: ['TRAFICO'] },
  MANTTO: { name: 'Mantto Lounge', allowedPositions: ['MANTTO'] },
}

export interface ForumPost {
  id: string
  author_id: string
  content: string
  is_anonymous: boolean
  likes_count: number
  comments_count: number
  lounge_type: LoungeType
  created_at: string
  updated_at: string
  // Joined data
  author?: ForumAuthor
  user_has_liked?: boolean
}

export interface ForumComment {
  id: string
  post_id: string
  author_id: string
  content: string
  is_anonymous: boolean
  likes_count: number
  created_at: string
  updated_at: string
  // Joined data
  author?: ForumAuthor
  user_has_liked?: boolean
}

export interface CreatePostData {
  content: string
  is_anonymous: boolean
  lounge_type: LoungeType
}

export interface CreateCommentData {
  post_id: string
  content: string
  is_anonymous: boolean
}
