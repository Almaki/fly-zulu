'use server'

import { createClient } from '@/shared/lib/supabase/server'
import type {
  SupportTicket,
  TicketMessage,
  UserNotification,
  CreateTicketData,
  TicketCategory,
  TicketStatus,
} from '../types'

// =====================================================
// TICKET SERVICES
// =====================================================

export async function createTicket(
  userId: string,
  data: CreateTicketData
): Promise<{ data: SupportTicket | null; error: string | null }> {
  const supabase = await createClient()

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      categories: data.categories,
      subject: data.subject || null,
    })
    .select()
    .single()

  if (ticketError) {
    return { data: null, error: ticketError.message }
  }

  // Add first message
  const { error: messageError } = await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: userId,
    content: data.message,
    is_admin_message: false,
  })

  if (messageError) {
    return { data: null, error: messageError.message }
  }

  return { data: ticket as SupportTicket, error: null }
}

export async function getUserTickets(
  userId: string
): Promise<{ data: SupportTicket[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as SupportTicket[], error: null }
}

export async function getTicketMessages(
  ticketId: string
): Promise<{ data: TicketMessage[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ticket_messages')
    .select(`
      *,
      sender:users!sender_id(nombre)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  const messages = data.map((m) => ({
    ...m,
    sender_name: (m.sender as { nombre: string } | null)?.nombre || 'Usuario',
  }))

  return { data: messages as TicketMessage[], error: null }
}

export async function sendTicketMessage(
  ticketId: string,
  senderId: string,
  content: string,
  isAdmin: boolean = false
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: senderId,
    content,
    is_admin_message: isAdmin,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function markMessagesAsRead(
  ticketId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ticket_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('ticket_id', ticketId)
    .neq('sender_id', userId)
    .is('read_at', null)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// NOTIFICATION SERVICES
// =====================================================

export async function getUserNotifications(
  userId: string
): Promise<{ data: UserNotification[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as UserNotification[], error: null }
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: count || 0, error: null }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function updateNotificationSettings(
  userId: string,
  muted: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('users') as any)
    .update({ notifications_muted: muted })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// ADMIN TICKET SERVICES
// =====================================================

export async function getAllTickets(): Promise<{
  data: SupportTicket[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      user:users!user_id(nombre, email)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  const tickets = data.map((t) => ({
    ...t,
    user_name: (t.user as { nombre: string; email: string } | null)?.nombre,
    user_email: (t.user as { nombre: string; email: string } | null)?.email,
  }))

  return { data: tickets as SupportTicket[], error: null }
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'RESOLVED' || status === 'CLOSED') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
