'use client'

import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageCircle, Plus, Loader2, Bug, Lightbulb, HelpCircle } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { getUserTickets } from '../services'
import { CreateTicketDialog } from './create-ticket-dialog'
import { TicketChat } from './ticket-chat'
import type { SupportTicket, TicketCategory } from '../types'

interface TicketListProps {
  userId: string
}

const CATEGORY_ICONS: Record<TicketCategory, typeof Bug> = {
  BUG: Bug,
  SUGGESTION: Lightbulb,
  OTHER: HelpCircle,
}

export function TicketList({ userId }: TicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  const fetchTickets = async () => {
    const { data } = await getUserTickets(userId)
    if (data) {
      setTickets(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [userId])

  const handleTicketCreated = () => {
    setShowCreateDialog(false)
    fetchTickets()
  }

  if (selectedTicket) {
    return (
      <TicketChat
        ticket={selectedTicket}
        userId={userId}
        onBack={() => {
          setSelectedTicket(null)
          fetchTickets()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-[#fafafa]">Soporte</h2>
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          className="bg-[#E91E8C] hover:bg-[#E91E8C]/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo
        </Button>
      </div>

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-[#fafafa] font-medium mb-2">
              Sin conversaciones
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Contacta al equipo de soporte si tienes alguna duda o problema
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#E91E8C] hover:bg-[#E91E8C]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {tickets.map((ticket) => {
              const statusColors: Record<string, string> = {
                OPEN: 'bg-[#22c55e]',
                IN_PROGRESS: 'bg-[#f59e0b]',
                RESOLVED: 'bg-zinc-500',
                CLOSED: 'bg-zinc-600',
              }
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full p-4 hover:bg-zinc-900/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Category icons */}
                    <div className="flex -space-x-1">
                      {ticket.categories.slice(0, 2).map((cat, i) => {
                        const Icon = CATEGORY_ICONS[cat]
                        return (
                          <div
                            key={cat}
                            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-[#0a0a0a]"
                            style={{ zIndex: 2 - i }}
                          >
                            <Icon className="w-4 h-4 text-zinc-400" />
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${statusColors[ticket.status]}`}
                        />
                        <p className="text-sm font-medium text-[#fafafa] truncate">
                          {ticket.categories
                            .map((c) =>
                              c === 'BUG'
                                ? 'Bug'
                                : c === 'SUGGESTION'
                                ? 'Sugerencia'
                                : 'Otro'
                            )
                            .join(', ')}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(ticket.updated_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <CreateTicketDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) fetchTickets()
        }}
        userId={userId}
      />
    </div>
  )
}
