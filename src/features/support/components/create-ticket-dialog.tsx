'use client'

import { useState } from 'react'
import { Bug, Lightbulb, HelpCircle, Send, X, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { createTicket } from '../services'
import type { TicketCategory } from '../types'
import { TICKET_CATEGORIES } from '../types'

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

const CATEGORY_ICONS = {
  bug: Bug,
  lightbulb: Lightbulb,
  'help-circle': HelpCircle,
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  userId,
}: CreateTicketDialogProps) {
  const [selectedCategories, setSelectedCategories] = useState<TicketCategory[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const toggleCategory = (category: TicketCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Selecciona al menos una categoría')
      return
    }
    if (!message.trim()) {
      toast.error('Escribe tu mensaje')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await createTicket(userId, {
        categories: selectedCategories,
        message: message.trim(),
      })

      if (error) throw new Error(error)

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedCategories([])
        setMessage('')
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      toast.error('Error al enviar mensaje')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      setSelectedCategories([])
      setMessage('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0a0a] border-zinc-800 max-w-md mx-4">
        {showSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h3 className="text-lg font-bold text-[#fafafa]">Mensaje Enviado</h3>
            <p className="text-sm text-zinc-400 px-4">
              El Admin se pondrá en contacto contigo por medio de la app en la sección de notificaciones de tu perfil.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#fafafa] flex items-center justify-between">
                Contactar Soporte
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Category selection */}
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">
                  Selecciona el tipo de mensaje (puedes elegir varios):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TICKET_CATEGORIES.map((category) => {
                    const Icon = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS]
                    const isSelected = selectedCategories.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-[#E91E8C] bg-[#E91E8C]/10'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-[#E91E8C]/20' : 'bg-zinc-800'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected ? 'text-[#E91E8C]' : 'text-zinc-400'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium text-center ${
                            isSelected ? 'text-[#E91E8C]' : 'text-zinc-400'
                          }`}
                        >
                          {category.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message input */}
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Tu mensaje:</p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe tu problema, sugerencia o consulta..."
                  className="min-h-[120px] bg-[#141414] border-zinc-800 text-[#fafafa] placeholder:text-zinc-600 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-zinc-600 text-right">
                  {message.length}/1000
                </p>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedCategories.length === 0 || !message.trim()}
                className="w-full h-12 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
