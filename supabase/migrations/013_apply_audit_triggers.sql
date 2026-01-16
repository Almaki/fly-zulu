-- 013_apply_audit_triggers.sql
-- Sistema de Auditoría - Aplicar triggers a tablas críticas

-- =====================================================
-- TABLAS QUE REQUIEREN AUDITORÍA
-- =====================================================

-- 1. Users (cambios de perfil, strikes, roles)
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 2. Flights (FIDS - cambios de status, gate, delay)
DROP TRIGGER IF EXISTS audit_flights ON flights;
CREATE TRIGGER audit_flights
  AFTER INSERT OR UPDATE OR DELETE ON flights
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 3. Directory Entries (servicios del directorio)
DROP TRIGGER IF EXISTS audit_directory_entries ON directory_entries;
CREATE TRIGGER audit_directory_entries
  AFTER INSERT OR UPDATE OR DELETE ON directory_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 4. Pilot Logs (registros de vuelo)
DROP TRIGGER IF EXISTS audit_pilot_logs ON pilot_logs;
CREATE TRIGGER audit_pilot_logs
  AFTER INSERT OR UPDATE OR DELETE ON pilot_logs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 5. FA Logs (registros de sobrecargo)
DROP TRIGGER IF EXISTS audit_fa_logs ON fa_logs;
CREATE TRIGGER audit_fa_logs
  AFTER INSERT OR UPDATE OR DELETE ON fa_logs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 6. Incidents (reportes de incidentes)
DROP TRIGGER IF EXISTS audit_incidents ON incidents;
CREATE TRIGGER audit_incidents
  AFTER INSERT OR UPDATE OR DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- TABLAS QUE NO NECESITAN AUDITORÍA COMPLETA
-- (para evitar overhead innecesario)
-- =====================================================
-- - duty_sessions (muchos registros temporales)
-- - fids_favorites (preferencias de usuario)
-- - exchange_rates (datos externos)

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TRIGGER audit_users ON users IS 'Auditoría de cambios en usuarios';
COMMENT ON TRIGGER audit_flights ON flights IS 'Auditoría de cambios en vuelos FIDS';
COMMENT ON TRIGGER audit_directory_entries ON directory_entries IS 'Auditoría de cambios en directorio';
COMMENT ON TRIGGER audit_pilot_logs ON pilot_logs IS 'Auditoría de registros de pilotos';
COMMENT ON TRIGGER audit_fa_logs ON fa_logs IS 'Auditoría de registros de sobrecargos';
COMMENT ON TRIGGER audit_incidents ON incidents IS 'Auditoría de incidentes';
