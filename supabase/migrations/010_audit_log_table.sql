-- 010_audit_log_table.sql
-- Sistema de Auditoría - Tabla principal

-- Extensión para UUIDs (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID,
  user_email TEXT,
  before_data JSONB,
  after_data JSONB,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);

-- Comentarios
COMMENT ON TABLE audit_log IS 'Registro de auditoría para todas las operaciones en tablas críticas';
COMMENT ON COLUMN audit_log.diff IS 'Diferencias entre before_data y after_data (solo campos modificados)';
