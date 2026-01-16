export type TicketCategory = 'BUG' | 'SUGGESTION' | 'OTHER'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SupportTicket {
  id: string
  user_id: string
  categories: TicketCategory[]
  subject: string | null
  status: TicketStatus
  created_at: string
  updated_at: string
  resolved_at: string | null
  // Joined fields
  user_name?: string
  user_email?: string
  last_message?: string
  unread_count?: number
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  is_admin_message: boolean
  read_at: string | null
  created_at: string
  // Joined fields
  sender_name?: string
}

export interface UserNotification {
  id: string
  user_id: string
  type: 'ticket_reply' | 'system' | 'announcement'
  title: string
  message: string | null
  reference_id: string | null
  read_at: string | null
  created_at: string
}

export interface CreateTicketData {
  categories: TicketCategory[]
  subject?: string
  message: string
}

export interface TicketCategoryOption {
  id: TicketCategory
  label: string
  icon: string
  description: string
}

export const TICKET_CATEGORIES: TicketCategoryOption[] = [
  {
    id: 'BUG',
    label: 'Reportar Bug',
    icon: 'bug',
    description: 'Algo no funciona correctamente',
  },
  {
    id: 'SUGGESTION',
    label: 'Sugerencia',
    icon: 'lightbulb',
    description: 'Ideas para mejorar la app',
  },
  {
    id: 'OTHER',
    label: 'Otro',
    icon: 'help-circle',
    description: 'Cualquier otra consulta',
  },
]
