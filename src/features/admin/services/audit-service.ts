'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/shared/lib/supabase/server'
import type { AuditLogEntry, AuditLogFilters, UserAuditMetrics } from '../types'

/**
 * Verificar si el usuario actual es SUPERADMIN
 */
async function checkSuperAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { authorized: false, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role
  if (userRole !== 'SUPERADMIN') {
    return { authorized: false, error: 'No autorizado - Solo SUPERADMIN' }
  }

  return { authorized: true, error: null, userId: user.id }
}

/**
 * Obtener logs de auditoría con filtros opcionales
 * Solo accesible por SUPERADMIN
 */
export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<{ data: AuditLogEntry[] | null; error: string | null; total?: number }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // Usar la vista amigable que incluye nombres de usuario
  let query = supabase
    .from('audit_log_view')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Aplicar filtros
  if (filters.table_name) {
    query = query.eq('table_name', filters.table_name)
  }

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  if (filters.operation) {
    query = query.eq('operation', filters.operation)
  }

  if (filters.record_id) {
    query = query.eq('record_id', filters.record_id)
  }

  if (filters.from_date) {
    query = query.gte('created_at', filters.from_date)
  }

  if (filters.to_date) {
    query = query.lte('created_at', filters.to_date)
  }

  // Paginación
  const limit = filters.limit || 50
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching audit logs:', error)
    return { data: null, error: error.message }
  }

  return {
    data: data as AuditLogEntry[],
    error: null,
    total: count || 0
  }
}

/**
 * Obtener historial de cambios de un registro específico
 * Útil para ver la evolución de un vuelo, usuario, etc.
 */
export async function getRecordHistory(
  tableName: string,
  recordId: string
): Promise<{ data: AuditLogEntry[] | null; error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('audit_log_view')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching record history:', error)
    return { data: null, error: error.message }
  }

  return { data: data as AuditLogEntry[], error: null }
}

/**
 * Obtener métricas de actividad por usuario
 * Muestra cuántas acciones ha realizado cada usuario
 */
export async function getUserAuditMetrics(): Promise<{
  data: UserAuditMetrics[] | null
  error: string | null
}> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('user_audit_metrics')
    .select('*')
    .order('total_actions', { ascending: false })

  if (error) {
    console.error('Error fetching user audit metrics:', error)
    return { data: null, error: error.message }
  }

  return { data: data as UserAuditMetrics[], error: null }
}

/**
 * Obtener logs de auditoría del usuario actual
 * Cualquier usuario puede ver sus propias acciones
 */
export async function getMyAuditLogs(
  limit: number = 50
): Promise<{ data: AuditLogEntry[] | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching my audit logs:', error)
    return { data: null, error: error.message }
  }

  return { data: data as AuditLogEntry[], error: null }
}

/**
 * Obtener resumen de actividad reciente
 * Para dashboard de SUPERADMIN
 */
export async function getRecentActivitySummary(): Promise<{
  data: {
    last24h: number
    last7d: number
    byOperation: Record<string, number>
    byTable: Record<string, number>
    recentLogs: AuditLogEntry[]
  } | null
  error: string | null
}> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { data: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  // Obtener conteos de las últimas 24 horas
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [count24h, count7d, recentLogs] = await Promise.all([
    supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h),
    supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7d),
    supabase
      .from('audit_log_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  // Obtener distribución por operación y tabla (últimos 7 días)
  const { data: distributionData } = await supabase
    .from('audit_log')
    .select('operation, table_name')
    .gte('created_at', last7d)

  const byOperation: Record<string, number> = {}
  const byTable: Record<string, number> = {}

  if (distributionData) {
    distributionData.forEach((row: { operation: string; table_name: string }) => {
      byOperation[row.operation] = (byOperation[row.operation] || 0) + 1
      byTable[row.table_name] = (byTable[row.table_name] || 0) + 1
    })
  }

  return {
    data: {
      last24h: count24h.count || 0,
      last7d: count7d.count || 0,
      byOperation,
      byTable,
      recentLogs: (recentLogs.data as AuditLogEntry[]) || []
    },
    error: null
  }
}

/**
 * Limpiar logs de auditoría antiguos
 * Solo ejecutable por SUPERADMIN
 */
export async function cleanupOldAuditLogs(
  daysToKeep: number = 90
): Promise<{ deletedCount: number | null; error: string | null }> {
  const auth = await checkSuperAdmin()
  if (!auth.authorized) return { deletedCount: null, error: auth.error }

  const supabase = await createServiceRoleClient()

  const { data, error } = await (supabase as any).rpc("cleanup_old_audit_logs", {
    days_to_keep: daysToKeep
  })

  if (error) {
    console.error('Error cleaning up audit logs:', error)
    return { deletedCount: null, error: error.message }
  }

  return { deletedCount: data as number, error: null }
}
