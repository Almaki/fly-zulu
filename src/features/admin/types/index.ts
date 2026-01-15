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
