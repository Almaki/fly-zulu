export interface AppEvent {
  id: string
  user_id: string | null
  event_type: string
  event_category: EventCategory
  event_data: Record<string, unknown>
  page_path: string | null
  session_id: string | null
  device_type: string | null
  created_at: string
}

export interface AdminNotification {
  id: string
  event_type: AdminEventType
  title: string
  message: string | null
  user_id: string | null
  user_name: string | null
  user_position: string | null
  metadata: Record<string, unknown>
  read_by: string[]
  created_at: string
}

export type EventCategory =
  | 'navigation'
  | 'interaction'
  | 'feature_usage'
  | 'error'
  | 'performance'
  | 'engagement'

export type AdminEventType =
  | 'user_registered'
  | 'user_deleted'
  | 'user_banned'
  | 'user_unbanned'
  | 'subscription_changed'
  | 'directory_created'
  | 'directory_updated'
  | 'directory_deleted'
  | 'flight_created'
  | 'ticket_created'

export interface AnalyticsData {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsByType: Record<string, number>
  topPages: { page: string; count: number }[]
  activeUsers24h: number
  peakHours: { hour: number; count: number }[]
}
