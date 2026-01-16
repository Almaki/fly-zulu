-- 014_audit_views_rls.sql
-- Sistema de Auditoría - Vistas y políticas de seguridad

-- =====================================================
-- VISTA PARA SUPERADMIN
-- =====================================================

CREATE OR REPLACE VIEW audit_log_view AS
SELECT
  al.id,
  al.table_name,
  al.record_id,
  al.operation,
  al.user_id,
  al.user_email,
  u.nombre as user_name,
  u.posicion as user_position,
  al.before_data,
  al.after_data,
  al.diff,
  al.created_at,
  al.ip_address,
  -- Resumen legible
  CASE
    WHEN al.operation = 'INSERT' THEN 'Creó registro'
    WHEN al.operation = 'UPDATE' THEN 'Editó registro'
    WHEN al.operation = 'DELETE' THEN 'Eliminó registro'
  END as action_summary,
  -- Nombre de tabla legible
  CASE al.table_name
    WHEN 'users' THEN 'Usuarios'
    WHEN 'flights' THEN 'Vuelos FIDS'
    WHEN 'directory_entries' THEN 'Directorio'
    WHEN 'pilot_logs' THEN 'Bitácora Piloto'
    WHEN 'fa_logs' THEN 'Bitácora Sobrecargo'
    WHEN 'incidents' THEN 'Incidentes'
    ELSE al.table_name
  END as table_name_es
FROM audit_log al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

COMMENT ON VIEW audit_log_view IS 'Vista amigable de audit_log con nombres de usuarios y traducciones';

-- =====================================================
-- RLS PARA AUDIT_LOG
-- =====================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Solo SUPERADMIN puede ver todos los logs
DROP POLICY IF EXISTS "SuperAdmin can view all audit_log" ON audit_log;
CREATE POLICY "SuperAdmin can view all audit_log" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Usuarios pueden ver logs de sus propias acciones
DROP POLICY IF EXISTS "Users can view own audit_log" ON audit_log;
CREATE POLICY "Users can view own audit_log" ON audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Solo el sistema puede insertar (via trigger)
DROP POLICY IF EXISTS "System can insert audit_log" ON audit_log;
CREATE POLICY "System can insert audit_log" ON audit_log
  FOR INSERT WITH CHECK (true);

-- Nadie puede actualizar o eliminar logs (inmutables)
-- No se crean políticas de UPDATE/DELETE

-- =====================================================
-- FUNCIÓN DE LIMPIEZA AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_log
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % audit log records older than % days', deleted_count, days_to_keep;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Elimina logs de auditoría más antiguos que X días (default 90)';

-- =====================================================
-- VISTA DE MÉTRICAS DE ACTIVIDAD POR USUARIO
-- =====================================================

CREATE OR REPLACE VIEW user_audit_metrics AS
SELECT
  u.id as user_id,
  u.nombre,
  u.email,
  u.posicion,
  COUNT(al.id) as total_actions,
  COUNT(al.id) FILTER (WHERE al.operation = 'INSERT') as creates,
  COUNT(al.id) FILTER (WHERE al.operation = 'UPDATE') as updates,
  COUNT(al.id) FILTER (WHERE al.operation = 'DELETE') as deletes,
  COUNT(al.id) FILTER (WHERE al.table_name = 'flights') as flight_changes,
  COUNT(al.id) FILTER (WHERE al.created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(al.id) FILTER (WHERE al.created_at >= NOW() - INTERVAL '7 days') as last_7d,
  MAX(al.created_at) as last_activity
FROM users u
LEFT JOIN audit_log al ON al.user_id = u.id
GROUP BY u.id, u.nombre, u.email, u.posicion
ORDER BY total_actions DESC;

COMMENT ON VIEW user_audit_metrics IS 'Métricas de actividad por usuario basadas en audit_log';
