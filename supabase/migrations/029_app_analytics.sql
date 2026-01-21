-- 029_app_analytics.sql
-- Sistema de Analytics para tracking de uso de la app

-- Tabla de eventos de analytics
CREATE TABLE IF NOT EXISTS app_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para queries rapidos
CREATE INDEX IF NOT EXISTS idx_app_events_type ON app_events(event_type);
CREATE INDEX IF NOT EXISTS idx_app_events_category ON app_events(event_category);
CREATE INDEX IF NOT EXISTS idx_app_events_user ON app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_created ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_page ON app_events(page_path);

-- Tabla de notificaciones para admin
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_position TEXT,
  metadata JSONB DEFAULT '{}',
  read_by JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para notificaciones recientes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- RLS para app_events
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden insertar sus propios eventos
CREATE POLICY "Users can insert own events" ON app_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Solo SUPERADMIN puede ver todos los eventos
CREATE POLICY "Superadmin can view all events" ON app_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'
    )
  );

-- RLS para admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Solo SUPERADMIN puede ver notificaciones
CREATE POLICY "Superadmin can view notifications" ON admin_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'
    )
  );

-- SUPERADMIN puede actualizar (marcar como leido)
CREATE POLICY "Superadmin can update notifications" ON admin_notifications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'
    )
  );

-- Sistema puede insertar notificaciones
CREATE POLICY "System can insert notifications" ON admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Funcion para crear notificacion de admin automaticamente
CREATE OR REPLACE FUNCTION notify_admin_on_user_change()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_title TEXT;
  v_message TEXT;
  v_user_name TEXT;
  v_user_position TEXT;
BEGIN
  -- Obtener nombre y posicion
  IF TG_OP = 'DELETE' THEN
    v_user_name := OLD.nombre;
    v_user_position := OLD.posicion;
  ELSE
    v_user_name := NEW.nombre;
    v_user_position := NEW.posicion;
  END IF;

  -- Determinar tipo de evento
  CASE TG_OP
    WHEN 'INSERT' THEN
      v_event_type := 'user_registered';
      v_title := 'Nuevo Registro';
      v_message := v_user_name || ' (' || COALESCE(v_user_position, 'Sin posicion') || ') se ha registrado';
    WHEN 'UPDATE' THEN
      -- Solo notificar cambios importantes
      IF OLD.subscription_tier != NEW.subscription_tier THEN
        v_event_type := 'subscription_changed';
        v_title := 'Cambio de Suscripcion';
        v_message := v_user_name || ' cambio a ' || NEW.subscription_tier;
      ELSIF OLD.is_banned != NEW.is_banned THEN
        IF NEW.is_banned THEN
          v_event_type := 'user_banned';
          v_title := 'Usuario Baneado';
          v_message := v_user_name || ' ha sido baneado';
        ELSE
          v_event_type := 'user_unbanned';
          v_title := 'Usuario Desbaneado';
          v_message := v_user_name || ' ha sido desbaneado';
        END IF;
      ELSE
        -- No notificar otros updates
        RETURN NEW;
      END IF;
    WHEN 'DELETE' THEN
      v_event_type := 'user_deleted';
      v_title := 'Usuario Eliminado';
      v_message := v_user_name || ' ha sido eliminado';
  END CASE;

  -- Insertar notificacion
  INSERT INTO admin_notifications (
    event_type,
    title,
    message,
    user_id,
    user_name,
    user_position,
    metadata
  ) VALUES (
    v_event_type,
    v_title,
    v_message,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_user_name,
    v_user_position,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME
    )
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones en tabla users
DROP TRIGGER IF EXISTS trigger_admin_notify_users ON users;
CREATE TRIGGER trigger_admin_notify_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_user_change();

-- Funcion para notificar cambios en directory_entries
CREATE OR REPLACE FUNCTION notify_admin_on_directory_change()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_title TEXT;
  v_message TEXT;
  v_user_name TEXT;
BEGIN
  -- Obtener nombre del usuario que hizo el cambio
  SELECT nombre INTO v_user_name
  FROM users
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.created_by
    ELSE COALESCE(NEW.updated_by, NEW.created_by)
  END;

  CASE TG_OP
    WHEN 'INSERT' THEN
      v_event_type := 'directory_created';
      v_title := 'Nuevo en Directorio';
      v_message := COALESCE(v_user_name, 'Alguien') || ' agrego: ' || NEW.name || ' (' || NEW.airport_code || ')';
    WHEN 'UPDATE' THEN
      v_event_type := 'directory_updated';
      v_title := 'Directorio Actualizado';
      v_message := COALESCE(v_user_name, 'Alguien') || ' actualizo: ' || NEW.name;
    WHEN 'DELETE' THEN
      v_event_type := 'directory_deleted';
      v_title := 'Eliminado de Directorio';
      v_message := COALESCE(v_user_name, 'Alguien') || ' elimino: ' || OLD.name;
  END CASE;

  INSERT INTO admin_notifications (
    event_type,
    title,
    message,
    user_name,
    metadata
  ) VALUES (
    v_event_type,
    v_title,
    v_message,
    v_user_name,
    jsonb_build_object(
      'operation', TG_OP,
      'table', 'directory_entries',
      'entry_name', CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END,
      'airport', CASE WHEN TG_OP = 'DELETE' THEN OLD.airport_code ELSE NEW.airport_code END
    )
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para directory_entries
DROP TRIGGER IF EXISTS trigger_admin_notify_directory ON directory_entries;
CREATE TRIGGER trigger_admin_notify_directory
  AFTER INSERT OR UPDATE OR DELETE ON directory_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_directory_change();

-- Habilitar Realtime para admin_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- Comentarios
COMMENT ON TABLE app_events IS 'Eventos de analytics para tracking de uso de la app';
COMMENT ON TABLE admin_notifications IS 'Notificaciones en tiempo real para administradores';
