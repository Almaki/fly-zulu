-- ============================================
-- AVISOS DE OCASIÓN - Permitir que SUPERADMIN elimine/actualice cualquier aviso
-- ============================================

-- Eliminar políticas existentes (ambas posibles)
DROP POLICY IF EXISTS "avisos_delete_owner_or_admin" ON avisos_ocasion;
DROP POLICY IF EXISTS "avisos_update_owner" ON avisos_ocasion;
DROP POLICY IF EXISTS "avisos_update_owner_or_admin" ON avisos_ocasion;

-- Política de eliminación: creador o SUPERADMIN
CREATE POLICY "avisos_delete_owner_or_admin" ON avisos_ocasion
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Política de actualización: creador o SUPERADMIN
CREATE POLICY "avisos_update_owner_or_admin" ON avisos_ocasion
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );
