'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Loader2,
  Bug,
  Lightbulb,
  HelpCircle,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { getAllTickets, updateTicketStatus } from '../services'
import { TicketChat } from './ticket-chat'
import type { SupportTicket, TicketCategory, TicketStatus } from '../types'

interface AdminTicketListProps {
  adminId: string
}

const CATEGORY_ICONS: Record<TicketCategory, typeof Bug> = {
  BUG: Bug,
  SUGGESTION: Lightbulb,
  OTHER: HelpCircle,
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  OPEN: {
    label: 'Abierto',
    color: 'bg-[#22c55e]/20 text-[#22c55e]',
    icon: MessageCircle,
  },
  IN_PROGRESS: {
    label: 'En Progreso',
    color: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    icon: Clock,
  },
  RESOLVED: {
    label: 'Resuelto',
    color: 'bg-[#3b82f6]/20 text-[#3b82f6]',
    icon: CheckCircle,
  },
  CLOSED: {
    label: 'Cerrado',
    color: 'bg-zinc-700/50 text-zinc-400',
    icon: XCircle,
  },
}

export function AdminTicketList({ adminId }: AdminTicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [filter, setFilter] = useState<TicketStatus | 'ALL'>('ALL')

  const fetchTickets = async () => {
    setIsLoading(true)
    const { data } = await getAllTickets()
    if (data) {
      setTickets(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await updateTicketStatus(ticketId, status)
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    )
  }

  const filteredTickets =
    filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)

  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length

  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold truncate">
            Ticket de {selectedTicket.user_name || 'Usuario'}
          </h2>
          <select
            value={selectedTicket.status}
            onChange={(e) =>
              handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="OPEN">Abierto</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="RESOLVED">Resuelto</option>
            <option value="CLOSED">Cerrado</option>
          </select>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50 h-[calc(100vh-200px)] min-h-[400px] max-h-[600px] overflow-hidden">
          <TicketChat
            ticket={selectedTicket}
            userId={adminId}
            isAdmin
            onBack={() => {
              setSelectedTicket(null)
              fetchTickets()
            }}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Tickets de Soporte</h2>
          <p className="text-sm text-zinc-500">
            {openCount} abiertos, {inProgressCount} en progreso
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchTickets}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-[#E91E8C] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {status === 'ALL'
                ? `Todos (${tickets.length})`
                : `${STATUS_CONFIG[status].label} (${
                    tickets.filter((t) => t.status === status).length
                  })`}
            </button>
          )
        )}
      </div>

      {/* Ticket list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-500">No hay tickets</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => {
            const StatusIcon = STATUS_CONFIG[ticket.status].icon
            return (
              <Card
                key={ticket.id}
                className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Mobile layout - stacked */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Category icons */}
                        <div className="flex -space-x-1">
                          {ticket.categories.slice(0, 2).map((cat, i) => {
                            const Icon = CATEGORY_ICONS[cat]
                            return (
                              <div
                                key={cat}
                                className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-[#0a0a0a]"
                                style={{ zIndex: 2 - i }}
                              >
                                <Icon className="w-3.5 h-3.5 text-zinc-400" />
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-sm font-medium text-[#fafafa] truncate max-w-[150px]">
                          {ticket.user_name || 'Usuario'}
                        </p>
                      </div>
                      <Badge
                        className={`text-[10px] shrink-0 ${STATUS_CONFIG[ticket.status].color}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {STATUS_CONFIG[ticket.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-zinc-500 truncate max-w-[180px]">
                        {ticket.user_email}
                      </p>
                      <p className="text-zinc-600 shrink-0">
                        {formatDistanceToNow(new Date(ticket.updated_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Desktop layout - horizontal */}
                  <div className="hidden sm:flex items-start gap-3">
                    {/* Category icons */}
                    <div className="flex -space-x-1 shrink-0">
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-[#fafafa] truncate">
                          {ticket.user_name || 'Usuario'}
                        </p>
                        <Badge
                          className={`text-[10px] shrink-0 ${STATUS_CONFIG[ticket.status].color}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[ticket.status].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {ticket.user_email}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {formatDistanceToNow(new Date(ticket.updated_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>

                    <div className="text-xs text-zinc-500 shrink-0 text-right">
                      {ticket.categories
                        .map((c) =>
                          c === 'BUG'
                            ? 'Bug'
                            : c === 'SUGGESTION'
                            ? 'Sugerencia'
                            : 'Otro'
                        )
                        .join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
