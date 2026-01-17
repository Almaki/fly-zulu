export interface ForumAuthor {
  id: string
  nombre: string
  posicion: string
}

export interface ForumPost {
  id: string
  author_id: string
  content: string
  is_anonymous: boolean
  likes_count: number
  comments_count: number
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
}

export interface CreateCommentData {
  post_id: string
  content: string
  is_anonymous: boolean
}
