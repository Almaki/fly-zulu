'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { createClient } from '@/shared/lib/supabase/client'
import { useAuthStore } from '@/features/auth/store'

type MessageType = 'solicitud' | 'bug' | 'felicitacion' | 'otro'

interface Message {
  id: string
  content: string
  type: MessageType
  is_from_admin: boolean
  created_at: string
  read: boolean
}

const messageTypeLabels: Record<MessageType, { label: string; emoji: string }> = {
  solicitud: { label: 'Solicitud', emoji: '📝' },
  bug: { label: 'Reporte de Bug', emoji: '🐛' },
  felicitacion: { label: 'Felicitación', emoji: '🎉' },
  otro: { label: 'Otro', emoji: '💬' },
}

export default function MensajesPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedType, setSelectedType] = useState<MessageType>('otro')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadMessages()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('admin_messages') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        // Table might not exist yet
        console.log('Messages table not ready:', error.message)
        setMessages([])
      } else {
        setMessages(data || [])
      }
    } catch {
      console.log('Error loading messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    setIsSending(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('admin_messages') as any)
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          type: selectedType,
          is_from_admin: false,
          read: false,
        })
        .select()
        .single()

      if (error) {
        toast.error('Error al enviar mensaje')
        return
      }

      setMessages([...messages, data])
      setNewMessage('')
      toast.success('Mensaje enviado')
    } catch {
      toast.error('Error al enviar mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    }
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[#27272a] bg-background/95 backdrop-blur-lg p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-[#fafafa]">Mensajes al Admin</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Envía solicitudes, reporta bugs o comparte tu feedback
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-lg mx-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066CC]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#27272a] flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-[#71717a]" />
              </div>
              <h3 className="text-[#fafafa] font-medium mb-2">Sin mensajes</h3>
              <p className="text-sm text-[#71717a]">
                Envía tu primer mensaje al equipo de FLY-ZULU
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const showDate = index === 0 ||
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-[#141414] text-[#71717a] text-xs">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${message.is_from_admin ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.is_from_admin
                            ? 'bg-[#141414] border border-[#27272a] rounded-bl-sm'
                            : 'bg-[#0066CC] rounded-br-sm'
                        }`}
                      >
                        {!message.is_from_admin && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs opacity-80">
                              {messageTypeLabels[message.type].emoji}
                            </span>
                            <span className="text-[10px] text-white/70">
                              {messageTypeLabels[message.type].label}
                            </span>
                          </div>
                        )}
                        {message.is_from_admin && (
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="w-3 h-3 text-[#0066CC]" />
                            <span className="text-[10px] text-[#0066CC]">Admin</span>
                          </div>
                        )}
                        <p className={`text-sm ${message.is_from_admin ? 'text-[#fafafa]' : 'text-white'}`}>
                          {message.content}
                        </p>
                        <p className={`text-[10px] mt-1 text-right ${
                          message.is_from_admin ? 'text-[#71717a]' : 'text-white/70'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-[#27272a] bg-background p-4">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(Object.keys(messageTypeLabels) as MessageType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-[#141414] text-[#71717a] border border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <span>{messageTypeLabels[type].emoji}</span>
                <span>{messageTypeLabels[type].label}</span>
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="px-4"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
