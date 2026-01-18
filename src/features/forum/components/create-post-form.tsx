'use client'

import { useState } from 'react'
import { Send, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Card, CardContent } from '@/shared/components/ui/card'
import { createPost } from '../services'
import type { LoungeType } from '../types'
import { LOUNGE_INFO } from '../types'

interface CreatePostFormProps {
  loungeType: LoungeType
  onCreated?: () => void
}

export function CreatePostForm({ loungeType, onCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loungeName = LOUNGE_INFO[loungeType].name

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Escribe algo para publicar')
      return
    }

    setIsSubmitting(true)
    const result = await createPost({
      content: content.trim(),
      is_anonymous: isAnonymous,
      lounge_type: loungeType,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Publicación creada')
      setContent('')
      setIsAnonymous(false)
      onCreated?.()
    }
  }

  const remainingChars = 2000 - content.length
  const isOverLimit = remainingChars < 0

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="p-4">
        <Textarea
          placeholder={`¿Qué quieres compartir en ${loungeName}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] bg-transparent border-0 resize-none focus-visible:ring-0 text-[#fafafa] placeholder:text-zinc-500 p-0"
        />

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-3">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <label
                htmlFor="anonymous"
                className="text-sm text-zinc-400 flex items-center gap-1.5 cursor-pointer"
              >
                {isAnonymous ? (
                  <>
                    <EyeOff className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400">Anónimo</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Público</span>
                  </>
                )}
              </label>
            </div>

            {/* Character count */}
            <span className={`text-xs ${isOverLimit ? 'text-[#FF3B30]' : 'text-zinc-600'}`}>
              {remainingChars}
            </span>
          </div>

          {/* Submit button */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || isOverLimit}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
