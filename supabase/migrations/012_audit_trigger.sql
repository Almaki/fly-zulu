-- 012_audit_trigger.sql
-- Sistema de Auditoría - Función del trigger principal

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  diff_data JSONB;
  user_identifier TEXT;
  user_uuid UUID;
  operation_type TEXT;
  target_record_id UUID;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Obtener información del usuario desde JWT
  BEGIN
    user_identifier := COALESCE(
      auth.jwt() ->> 'email',
      current_user
    );
    user_uuid := (auth.jwt() ->> 'sub')::UUID;
  EXCEPTION WHEN OTHERS THEN
    user_identifier := current_user;
    user_uuid := NULL;
  END;

  -- Determinar tipo de operación y datos
  IF TG_OP = 'INSERT' THEN
    operation_type := 'INSERT';
    target_record_id := NEW.id;
    old_data := NULL;
    new_data := to_jsonb(NEW);
    diff_data := new_data;

  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE';
    target_record_id := NEW.id;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    diff_data := jsonb_diff(old_data, new_data);

    -- Solo registrar si hubo cambios reales (ignorando updated_at)
    IF diff_data = '{}' OR diff_data IS NULL THEN
      RETURN NEW;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE';
    target_record_id := OLD.id;
    old_data := to_jsonb(OLD);
    new_data := NULL;
    diff_data := old_data;
  END IF;

  -- Insertar registro de auditoría
  INSERT INTO audit_log (
    table_name,
    record_id,
    operation,
    user_id,
    user_email,
    before_data,
    after_data,
    diff,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    target_record_id,
    operation_type,
    user_uuid,
    user_identifier,
    old_data,
    new_data,
    diff_data,
    NOW()
  );

  -- Retornar el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Si hay error en auditoría, no bloquear la operación principal
  RAISE WARNING 'Error en audit_trigger: %', SQLERRM;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_function IS 'Trigger function que registra todas las operaciones en audit_log';
