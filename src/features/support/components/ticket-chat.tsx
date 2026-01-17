'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Send, Loader2, ArrowLeft, Check, CheckCheck } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getTicketMessages, sendTicketMessage, markMessagesAsRead } from '../services'
import type { SupportTicket, TicketMessage } from '../types'

interface TicketChatProps {
  ticket: SupportTicket
  userId: string
  isAdmin?: boolean
  onBack: () => void
}

export function TicketChat({ ticket, userId, isAdmin = false, onBack }: TicketChatProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await getTicketMessages(ticket.id)
      if (data) {
        setMessages(data)
        // Mark messages as read
        await markMessagesAsRead(ticket.id, userId)
      }
      setIsLoading(false)
    }
    fetchMessages()
  }, [ticket.id, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic update
    const optimisticMessage: TicketMessage = {
      id: `temp-${Date.now()}`,
      ticket_id: ticket.id,
      sender_id: userId,
      content: messageText,
      is_admin_message: isAdmin,
      read_at: null,
      created_at: new Date().toISOString(),
      sender_name: isAdmin ? 'Soporte' : 'Tú',
    }
    setMessages((prev) => [...prev, optimisticMessage])

    const { error } = await sendTicketMessage(ticket.id, userId, messageText, isAdmin)

    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      setNewMessage(messageText)
    }

    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getCategoryLabels = () => {
    const labels: Record<string, string> = {
      BUG: 'Bug',
      SUGGESTION: 'Sugerencia',
      OTHER: 'Otro',
    }
    return ticket.categories.map((c) => labels[c] || c).join(', ')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#fafafa] truncate">
            {getCategoryLabels()}
          </h3>
          <p className="text-xs text-zinc-500">
            {format(new Date(ticket.created_at), "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            ticket.status === 'OPEN'
              ? 'bg-[#22c55e]/20 text-[#22c55e]'
              : ticket.status === 'IN_PROGRESS'
              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
              : 'bg-zinc-700 text-zinc-400'
          }`}
        >
          {ticket.status === 'OPEN'
            ? 'Abierto'
            : ticket.status === 'IN_PROGRESS'
            ? 'En Progreso'
            : ticket.status === 'RESOLVED'
            ? 'Resuelto'
            : 'Cerrado'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm">
            No hay mensajes aún
          </p>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-[#E91E8C] text-white rounded-br-md'
                      : 'bg-zinc-800 text-[#fafafa] rounded-bl-md'
                  }`}
                >
                  {/* Show sender name */}
                  {!isOwnMessage && (
                    <p className={`text-xs font-medium mb-1 ${
                      msg.is_admin_message ? 'text-[#00ff88]' : 'text-[#0088FF]'
                    }`}>
                      {msg.is_admin_message
                        ? 'Soporte FLY-ZULU'
                        : (msg.sender_name || ticket.user_name || 'Usuario')}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span
                      className={`text-[10px] ${
                        isOwnMessage ? 'text-white/70' : 'text-zinc-500'
                      }`}
                    >
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                    {isOwnMessage && (
                      msg.read_at ? (
                        <CheckCheck className="w-3 h-3 text-white/70" />
                      ) : (
                        <Check className="w-3 h-3 text-white/70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-[#fafafa]"
              maxLength={1000}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="bg-[#E91E8C] hover:bg-[#E91E8C]/90"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
