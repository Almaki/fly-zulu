# Guía de Testing: Flujo de Autenticación

## Pre-requisitos

1. ✅ Base de datos Supabase configurada con migración `001_initial_schema.sql`
2. ✅ Variables de entorno en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Schema Verification

### Verificar que el trigger de role funciona

```sql
-- En Supabase SQL Editor
SELECT * FROM users LIMIT 5;
```

**Verificar que:**
- La columna `role` existe
- El valor de `role` coincide con `posicion`

## Test Cases

### Test 1: Registro como PILOT

**Objetivo:** Verificar que el registro funciona y redirige correctamente.

**Pasos:**
1. Navegar a `http://localhost:3000/register`
2. Completar Paso 1 (Datos Personales):
   - Nombre: "Juan Pérez"
   - WhatsApp: "+525512345678"
3. Completar Paso 2 (Credenciales):
   - Email: "juan.pilot@test.com"
   - Password: "Test1234"
   - Confirmar Password: "Test1234"
4. Completar Paso 3 (Rol):
   - Categoría: "FLIGHT (Tripulación de vuelo)"
   - Posición: "Piloto"
5. Completar Paso 4 (Términos):
   - Marcar todos los checkboxes
6. Click en "Crear cuenta"

**Resultado Esperado:**
- ✅ Toast: "Cuenta creada exitosamente. Bienvenido a FLY-ZULU!"
- ✅ Redirección automática a `/pilot/mcdu`
- ✅ Usuario autenticado

**Verificación en Base de Datos:**
```sql
SELECT id, email, nombre, posicion, role FROM users WHERE email = 'juan.pilot@test.com';
-- Debe mostrar: posicion = 'PILOT', role = 'PILOT'
```

---

### Test 2: Registro como FA (Sobrecargo)

**Pasos:**
1. Navegar a `http://localhost:3000/register`
2. Datos Personales:
   - Nombre: "María González"
   - WhatsApp: "+525587654321"
3. Credenciales:
   - Email: "maria.fa@test.com"
   - Password: "Test1234"
4. Rol:
   - Categoría: "FLIGHT"
   - Posición: "Sobrecargo (FA)"
5. Aceptar términos
6. Crear cuenta

**Resultado Esperado:**
- ✅ Toast: "Cuenta creada exitosamente. Bienvenido a FLY-ZULU!"
- ✅ Redirección a `/fa/vuelo`

---

### Test 3: Registro como OPS (Personal de tierra)

**Pasos:**
1. Navegar a `http://localhost:3000/register`
2. Datos:
   - Nombre: "Carlos Ramírez"
   - WhatsApp: "+525511223344"
   - Email: "carlos.ops@test.com"
   - Password: "Test1234"
3. Rol:
   - Categoría: "GROUND (Personal de tierra)"
   - Posición: "Operaciones (OPS)"
4. Crear cuenta

**Resultado Esperado:**
- ✅ Redirección a `/ops/control`

---

### Test 4: Registro como TRAFICO

**Resultado Esperado:**
- ✅ Redirección a `/trafico/tiempos`

---

### Test 5: Registro como MANTTO

**Resultado Esperado:**
- ✅ Redirección a `/mantto/transit`

---

### Test 6: Login como PILOT existente

**Pre-requisito:** Tener usuario PILOT creado (Test 1)

**Pasos:**
1. Cerrar sesión
2. Navegar a `http://localhost:3000/login`
3. Email: "juan.pilot@test.com"
4. Password: "Test1234"
5. Click "Ingresar"

**Resultado Esperado:**
- ✅ Toast: "Bienvenido a FLY-ZULU"
- ✅ Redirección a `/pilot/mcdu`

---

### Test 7: Login como FA existente

**Resultado Esperado:**
- ✅ Redirección a `/fa/vuelo`

---

### Test 8: Usuario autenticado intenta acceder a /login

**Pasos:**
1. Login exitoso como PILOT
2. Manualmente navegar a `http://localhost:3000/login`

**Resultado Esperado:**
- ✅ Redirección automática a `/pilot/mcdu` (sin ver formulario de login)

---

### Test 9: Usuario autenticado intenta acceder a /register

**Pasos:**
1. Login exitoso como FA
2. Manualmente navegar a `http://localhost:3000/register`

**Resultado Esperado:**
- ✅ Redirección automática a `/fa/vuelo` (sin ver formulario de registro)

---

### Test 10: Usuario no autenticado intenta acceder a dashboard

**Pasos:**
1. Cerrar sesión
2. Manualmente navegar a `http://localhost:3000/pilot/mcdu`

**Resultado Esperado:**
- ✅ Redirección automática a `/login`

---

### Test 11: Email duplicado en registro

**Pasos:**
1. Intentar registrar con email ya usado: "juan.pilot@test.com"

**Resultado Esperado:**
- ✅ Toast de error: "Este email ya está registrado"
- ❌ No se crea cuenta nueva
- ❌ No hay redirección

---

### Test 12: WhatsApp duplicado en registro

**Pasos:**
1. Intentar registrar con WhatsApp ya usado: "+525512345678"

**Resultado Esperado:**
- ✅ Toast de error: "Este WhatsApp ya está registrado"

---

### Test 13: Credenciales incorrectas en login

**Pasos:**
1. Navegar a `/login`
2. Email: "juan.pilot@test.com"
3. Password: "PasswordIncorrecto"

**Resultado Esperado:**
- ✅ Toast de error con mensaje de Supabase
- ❌ No hay redirección

---

### Test 14: Usuario baneado intenta login

**Pre-requisito:** Banear usuario en base de datos

```sql
UPDATE users SET is_banned = true WHERE email = 'juan.pilot@test.com';
```

**Pasos:**
1. Intentar login con credenciales correctas

**Resultado Esperado:**
- ✅ Toast de error: "Tu cuenta ha sido suspendida"
- ❌ No se establece sesión
- ❌ No hay redirección

**Cleanup:**
```sql
UPDATE users SET is_banned = false WHERE email = 'juan.pilot@test.com';
```

---

### Test 15: Validación de formulario de registro

**Pasos en Paso 1:**
- Nombre con 1 carácter → ❌ Error "Mínimo 2 caracteres"
- WhatsApp inválido "123" → ❌ Error "WhatsApp inválido"
- ✅ Botón "Siguiente" deshabilitado hasta completar correctamente

**Pasos en Paso 2:**
- Email sin "@" → ❌ Error "Email inválido"
- Password de 7 caracteres → ❌ Error "Mínimo 8 caracteres"
- Contraseñas no coinciden → ❌ Error "Las contraseñas no coinciden"

**Pasos en Paso 3:**
- No seleccionar categoría → ❌ Botón "Siguiente" deshabilitado
- FLIGHT + OPS → ❌ Validation error al submit

**Pasos en Paso 4:**
- No aceptar términos → ❌ Botón "Crear cuenta" deshabilitado

---

### Test 16: Navegación entre pasos del registro

**Pasos:**
1. Completar Paso 1
2. Avanzar al Paso 2
3. Click en "Anterior"

**Resultado Esperado:**
- ✅ Vuelve al Paso 1
- ✅ Datos previamente ingresados se mantienen
- ✅ Indicador de progreso actualizado

---

### Test 17: Middleware protege rutas dinámicas

**Pasos:**
1. Cerrar sesión
2. Intentar acceder a:
   - `/pilot/duty`
   - `/fa/seguridad`
   - `/ops/walkaround`
   - `/trafico/tiempos`
   - `/mantto/transit`
   - `/admin/metrics`

**Resultado Esperado para cada ruta:**
- ✅ Redirección a `/login`

---

### Test 18: Rutas públicas accesibles sin autenticación

**Pasos:**
1. Cerrar sesión
2. Acceder a:
   - `/login`
   - `/register`

**Resultado Esperado:**
- ✅ Acceso permitido sin redirección

---

## Testing con DevTools

### Verificar Cookies de Supabase

1. Abrir DevTools (F12)
2. Application Tab → Cookies
3. Buscar cookies que empiezan con `sb-`

**Después de login exitoso:**
- ✅ Debe existir `sb-gvtuaobcrwuxdmjhxlac-auth-token`
- ✅ Cookie debe ser < 6KB (verificar en middleware)

### Verificar Zustand Store

1. Instalar React DevTools
2. Components Tab → Buscar componente con `useAuthStore`

**Después de login:**
- ✅ `user` debe tener todos los campos del perfil
- ✅ `isAuthenticated` debe ser `true`
- ✅ `isLoading` debe ser `false`

### Verificar Network Requests

**Durante registro:**
1. POST a Supabase Auth (`/auth/v1/signup`)
2. POST a tabla `users`
3. POST a Supabase Auth (`/auth/v1/token` - login automático)

**Durante login:**
1. POST a Supabase Auth (`/auth/v1/token`)
2. GET a tabla `users` (para obtener perfil)

---

## Troubleshooting

### Error: "Request Header Fields Too Large" (HTTP 431)

**Causa:** Cookies de Supabase exceden 6KB

**Solución:**
- El middleware detecta automáticamente y limpia cookies
- Verificar que no se almacena data pesada en `user_metadata`

### Error: "Usuario no redirige después de registro"

**Verificar:**
1. ✅ Login automático se ejecuta en `register()` service
2. ✅ Cookies de Supabase se establecieron
3. ✅ Middleware detecta sesión
4. ✅ Campo `role` existe en tabla `users`
5. ✅ Trigger `set_role_on_insert` está activo

### Error: "Redirección a /board en vez de dashboard específico"

**Verificar:**
1. ✅ Campo `role` está correctamente asignado en DB
2. ✅ `getDashboardRoute()` recibe el rol correcto
3. ✅ Rol existe en `ROLE_ROUTES` mapping

### Error: "CORS" en desarrollo

**Verificar:**
- Frontend corriendo en puerto 3000-3006
- Supabase URL correcta en `.env.local`
- No hay proxies bloqueando requests

---

## Checklist Final

Antes de considerar el flujo de auth como completado:

- [ ] Registro exitoso para cada rol (PILOT, FA, OPS, TRAFICO, MANTTO)
- [ ] Login exitoso para cada rol
- [ ] Redirecciones correctas según rol
- [ ] Middleware protege rutas correctamente
- [ ] Usuario autenticado no puede acceder a /login o /register
- [ ] Usuario no autenticado no puede acceder a dashboards
- [ ] Validaciones de formulario funcionan
- [ ] Errores se muestran correctamente
- [ ] Email y WhatsApp duplicados son detectados
- [ ] Usuario baneado no puede hacer login
- [ ] Login automático después de registro funciona
- [ ] Cookies no exceden 6KB
- [ ] Zustand store se actualiza correctamente
- [ ] Navegación entre pasos del registro funciona
- [ ] Datos se mantienen al navegar hacia atrás

---

**Nota:** Todos estos tests deben pasar antes de desplegar a producción.
