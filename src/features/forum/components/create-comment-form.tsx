'use client'

import { useState } from 'react'
import { Send, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { createComment } from '../services'

interface CreateCommentFormProps {
  postId: string
  onCreated?: () => void
}

export function CreateCommentForm({ postId, onCreated }: CreateCommentFormProps) {
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    const result = await createComment({
      post_id: postId,
      content: content.trim(),
      is_anonymous: isAnonymous,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setContent('')
      setIsAnonymous(false)
      onCreated?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
      {/* Anonymous toggle */}
      <button
        type="button"
        onClick={() => setIsAnonymous(!isAnonymous)}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-zinc-800"
        title={isAnonymous ? 'Publicar anónimo' : 'Publicar con nombre'}
      >
        {isAnonymous ? (
          <EyeOff className="h-4 w-4 text-purple-400" />
        ) : (
          <Eye className="h-4 w-4 text-zinc-500" />
        )}
      </button>

      {/* Input */}
      <Input
        placeholder="Escribe un comentario..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-zinc-800/50 border-zinc-700"
        maxLength={1000}
      />

      {/* Submit */}
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={isSubmitting || !content.trim()}
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
