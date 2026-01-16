-- 011_audit_functions.sql
-- Sistema de Auditoría - Funciones auxiliares

-- Función para calcular diferencias entre JSON
CREATE OR REPLACE FUNCTION jsonb_diff(old_data JSONB, new_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  key TEXT;
BEGIN
  -- Si old_data es null, retornar new_data completo
  IF old_data IS NULL THEN
    RETURN new_data;
  END IF;

  -- Si new_data es null, retornar vacío
  IF new_data IS NULL THEN
    RETURN '{}';
  END IF;

  -- Iterar sobre las claves del nuevo registro
  FOR key IN SELECT jsonb_object_keys(new_data)
  LOOP
    -- Ignorar campos de metadata que siempre cambian
    IF key NOT IN ('updated_at', 'created_at') THEN
      -- Si el valor cambió, agregarlo al diff
      IF old_data->key IS DISTINCT FROM new_data->key THEN
        result := result || jsonb_build_object(
          key,
          jsonb_build_object(
            'old', old_data->key,
            'new', new_data->key
          )
        );
      END IF;
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION jsonb_diff IS 'Calcula las diferencias entre dos objetos JSONB, retornando solo los campos modificados';
