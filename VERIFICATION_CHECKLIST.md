# Checklist de Verificación: Sistema de Autenticación

## Pre-Deploy Verification

### Base de Datos

- [ ] Migración `001_initial_schema.sql` ejecutada
- [ ] Tabla `users` existe con columna `role`
- [ ] Trigger `set_user_role` está activo
- [ ] RLS policies habilitadas en todas las tablas
- [ ] Enums creados correctamente

**Verificación SQL:**
```sql
-- Verificar tabla users
\d users

-- Verificar trigger
SELECT tgname FROM pg_trigger WHERE tgrelid = 'users'::regclass;

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### Variables de Entorno

- [ ] `.env.local` existe
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado

**Verificación:**
```bash
# En terminal
cat .env.local | grep SUPABASE
```

### Archivos Modificados

- [ ] `src/shared/utils/auth-routes.ts` (CREADO)
- [ ] `src/shared/utils/index.ts` (MODIFICADO - exporta helpers)
- [ ] `src/features/auth/components/login-form.tsx` (MODIFICADO - usa getDashboardRoute)
- [ ] `src/features/auth/components/register-form.tsx` (MODIFICADO - usa getDashboardRoute)
- [ ] `src/features/auth/services/index.ts` (MODIFICADO - login automático)
- [ ] `src/shared/lib/supabase/middleware.ts` (MODIFICADO - usa helpers)

### Build

- [ ] `npm run build` ejecutado sin errores
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos

**Comando:**
```bash
npm run build
```

## Functional Testing

### Registro

- [ ] Test 1: Registro como PILOT → redirige a `/pilot/mcdu`
- [ ] Test 2: Registro como FA → redirige a `/fa/vuelo`
- [ ] Test 3: Registro como OPS → redirige a `/ops/control`
- [ ] Test 4: Registro como TRAFICO → redirige a `/trafico/tiempos`
- [ ] Test 5: Registro como MANTTO → redirige a `/mantto/transit`
- [ ] Test 6: Email duplicado → muestra error
- [ ] Test 7: WhatsApp duplicado → muestra error

### Login

- [ ] Test 8: Login como PILOT → redirige a `/pilot/mcdu`
- [ ] Test 9: Login como FA → redirige a `/fa/vuelo`
- [ ] Test 10: Login como OPS → redirige a `/ops/control`
- [ ] Test 11: Credenciales incorrectas → muestra error
- [ ] Test 12: Usuario baneado → muestra error y no autentica

### Middleware

- [ ] Test 13: Usuario no autenticado en `/pilot/mcdu` → redirige a `/login`
- [ ] Test 14: Usuario autenticado en `/login` → redirige a dashboard
- [ ] Test 15: Usuario autenticado en `/register` → redirige a dashboard
- [ ] Test 16: Rutas públicas accesibles sin auth

### Validación

- [ ] Test 17: Formulario de login valida campos
- [ ] Test 18: Formulario de registro valida todos los pasos
- [ ] Test 19: Password mínimo 8 caracteres
- [ ] Test 20: Email formato válido
- [ ] Test 21: WhatsApp formato válido

## Security Verification

### Cookies

- [ ] Cookies de Supabase < 6KB
- [ ] Middleware detecta cookies grandes y limpia
- [ ] No se almacena data sensible en user_metadata

**Verificación:**
```javascript
// En DevTools Console
document.cookie.length
```

### RLS Policies

- [ ] Usuario solo puede ver su propio perfil
- [ ] Usuario solo puede editar su propio perfil
- [ ] SUPERADMIN puede ver todos los perfiles
- [ ] Pilot logs protegidos por RLS
- [ ] FA logs protegidos por RLS

**Verificación SQL:**
```sql
-- Como usuario normal, no debe ver otros usuarios
SELECT * FROM users WHERE id != auth.uid();  -- Debe retornar vacío
```

### Server Actions

- [ ] Validación con Zod en todos los inputs
- [ ] Errores manejados sin exponer stack traces
- [ ] No se loggean datos sensibles (passwords, etc.)

## UI/UX Verification

### Register Form

- [ ] 4 pasos visibles con indicador de progreso
- [ ] Botón "Siguiente" habilitado solo con campos válidos
- [ ] Botón "Anterior" funciona correctamente
- [ ] Datos se mantienen al navegar entre pasos
- [ ] Toast success después de registro
- [ ] Toast error en caso de fallo

### Login Form

- [ ] Email autocomplete funciona
- [ ] Password es type="password"
- [ ] Botón disabled durante loading
- [ ] Spinner durante loading
- [ ] Toast success después de login
- [ ] Toast error en caso de fallo

### Redirects

- [ ] Redirección instantánea (no flickering)
- [ ] `router.refresh()` actualiza sesión
- [ ] URL en browser actualizada correctamente

## Performance Verification

### Lighthouse Audit

- [ ] Performance score > 80
- [ ] No hay memory leaks en redirects
- [ ] Time to Interactive < 3s

### Network

- [ ] Requests a Supabase Auth minimizados
- [ ] Middleware no hace queries innecesarias
- [ ] No hay waterfall de requests

**Verificación:**
```
1. Abrir DevTools → Network
2. Hacer login
3. Verificar solo 2-3 requests a Supabase
```

## Edge Cases

- [ ] Usuario cierra tab durante registro → puede reintentar
- [ ] Usuario pierde internet durante login → error manejado
- [ ] Sesión expira → middleware redirige a login
- [ ] Cookies bloqueadas → error descriptivo
- [ ] JavaScript deshabilitado → fallback message

## Data Integrity

### Después de registro

- [ ] Usuario existe en `auth.users`
- [ ] Usuario existe en tabla `users`
- [ ] `role` coincide con `posicion`
- [ ] `last_ip` está registrado
- [ ] `created_at` y `updated_at` poblados

**Verificación SQL:**
```sql
SELECT
  u.id,
  u.email,
  u.posicion,
  u.role,
  u.last_ip,
  u.created_at
FROM users u
WHERE u.email = 'test@example.com';
```

### Después de login

- [ ] `last_ip` actualizado
- [ ] Session establecida en Supabase
- [ ] Cookies set correctamente

## Monitoring & Logging

### Logs a revisar

- [ ] No hay errores en server console
- [ ] No hay errores en browser console
- [ ] No hay warnings de React hydration
- [ ] No hay warnings de middleware loops

### Supabase Dashboard

- [ ] Auth logs muestran logins exitosos
- [ ] Usuarios creados aparecen en tabla
- [ ] RLS policies no bloquean operaciones válidas

## Rollback Plan

### Si falla en producción

1. [ ] Revertir commits con `git revert`
2. [ ] Verificar que DB no requiere rollback (migraciones)
3. [ ] Notificar a usuarios de mantenimiento

### Archivos críticos

```bash
# Backup de archivos modificados
git diff HEAD~6 HEAD > auth-changes.patch

# Revertir si es necesario
git revert HEAD~6..HEAD
```

## Documentation

- [ ] `AUTH_FIX_SUMMARY.md` creado
- [ ] `TESTING_AUTH.md` creado
- [ ] `.claude/docs/auth-architecture.md` creado
- [ ] Este checklist completado

## Approval Checklist

**Antes de merge a main:**

- [ ] Todos los tests funcionales pasan
- [ ] Build exitoso sin errores
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Security review completado
- [ ] Performance acceptable

**Firmas:**

- [ ] Developer: _________________
- [ ] Reviewer: _________________
- [ ] QA: _________________

---

## Quick Test Commands

```bash
# Build verification
npm run build

# Start dev server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# All checks
npm run build && npm run lint && npm run typecheck
```

---

**Última actualización:** 2026-01-15
**Status:** ✅ READY FOR TESTING
