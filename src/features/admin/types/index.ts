import type { User, FlightStatus } from '@/shared/types'

export interface AdminMetrics {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  freeUsers: number
  usersByRole: Record<string, number>
  flightsToday: number
  conversionRate: number
}

export interface UserWithActivity extends User {
  lastActive: string | null
  logsCount: number
}

export interface ActivityLog {
  id: string
  user_id: string
  user_name: string
  action: string
  details: string | null
  created_at: string
}

export interface AdminFilters {
  role?: string
  status?: 'active' | 'banned' | 'all'
  subscription?: 'FREE' | 'PREMIUM' | 'all'
  search?: string
}

// =====================================================
// AUDIT SYSTEM TYPES
// =====================================================

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE'

export type AuditTableName =
  | 'users'
  | 'flights'
  | 'directory_entries'
  | 'pilot_logs'
  | 'fa_logs'
  | 'incidents'

export interface AuditLogEntry {
  id: string
  table_name: AuditTableName
  record_id: string
  operation: AuditOperation
  user_id: string | null
  user_email: string | null
  user_name?: string | null
  user_position?: string | null
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  diff: Record<string, { old: unknown; new: unknown }> | null
  created_at: string
  ip_address?: string | null
  action_summary?: string
  table_name_es?: string
}

export interface AuditLogFilters {
  table_name?: AuditTableName
  user_id?: string
  operation?: AuditOperation
  record_id?: string
  from_date?: string
  to_date?: string
  limit?: number
  offset?: number
}

export interface UserAuditMetrics {
  user_id: string
  nombre: string
  email: string
  posicion: string
  total_actions: number
  creates: number
  updates: number
  deletes: number
  flight_changes: number
  last_24h: number
  last_7d: number
  last_activity: string | null
}
