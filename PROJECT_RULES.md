# 📋 PROJECT_RULES.md - Reglas Obligatorias de FLY-ZULU

> Este archivo es la fuente de verdad para decisiones técnicas. Claude Code DEBE consultar y seguir estas reglas.

---

## 🎯 OBJETIVO DE ESCALABILIDAD

El sistema debe soportar **150+ usuarios concurrentes** sin degradación de rendimiento.

---

## 🚀 ESCALABILIDAD Y PERFORMANCE (150+ USUARIOS)

### 1. CONNECTION POOLING (CRÍTICO)

```typescript
// ❌ NUNCA usar conexión directa para queries normales
const supabase = createClient(url, key) // NO en producción

// ✅ SIEMPRE usar Transaction Pooler (puerto 6543)
// En .env.local:
// DATABASE_URL=postgresql://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

- Usar el connection string de "Transaction pooler" de Supabase
- Puerto 6543 (NO 5432)
- Parámetro `?pgbouncer=true`

---

### 2. CACHÉ Y DATA FETCHING

```typescript
// ✅ OBLIGATORIO: Usar React Query o SWR
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['flights', airportCode],
  queryFn: () => getFlights(airportCode),
  staleTime: 1000 * 60 * 5, // 5 minutos
  gcTime: 1000 * 60 * 30,   // 30 minutos en caché
})
```

**Reglas:**
- SIEMPRE usar React Query para fetching
- staleTime mínimo: 1 minuto para datos frecuentes
- staleTime recomendado: 5 minutos para datos semi-estáticos
- Implementar optimistic updates para mejor UX

---

### 3. REALTIME SELECTIVO

```typescript
// ✅ SOLO usar Realtime para:
// - Tablero FIDS (actualizaciones de vuelos)
// - Notificaciones push
// - Chat/mensajes (si aplica)

// ❌ NO usar Realtime para:
// - Perfil de usuario
// - Directorio de servicios
// - Historial de vuelos
// - Datos que cambian poco
```

**Reglas:**
- Máximo 3-4 suscripciones Realtime activas por usuario
- SIEMPRE hacer unsubscribe en cleanup del useEffect
- Usar filtros específicos en las suscripciones

```typescript
// ✅ Correcto: filtro específico
supabase
  .channel('fids')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'board_flights',
    filter: `airport_code=eq.${airportCode}` // FILTRAR
  }, handler)

// ❌ Incorrecto: sin filtro
supabase
  .channel('fids')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'board_flights' // SIN FILTRO = sobrecarga
  }, handler)
```

---

### 4. QUERIES OPTIMIZADAS

```typescript
// ❌ PROHIBIDO: Select all
const { data } = await supabase.from('users').select('*')

// ✅ OBLIGATORIO: Campos específicos
const { data } = await supabase
  .from('users')
  .select('id, nombre, posicion, avatar_url')
  .eq('id', userId)
  .single()
```

**Reglas:**
- NUNCA usar `select('*')`
- SIEMPRE especificar campos necesarios
- SIEMPRE paginar: `.range(0, 19)` o `.limit(20)`
- Usar `.single()` cuando esperas un solo registro

---

### 5. PAGINACIÓN OBLIGATORIA

```typescript
// ✅ Todas las listas DEBEN tener paginación
const PAGE_SIZE = 20

const { data, count } = await supabase
  .from('directory_services')
  .select('id, nombre, telefono, rating', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('rating', { ascending: false })
```

**Límites por tabla:**
- FIDS: 50 vuelos por página
- Directorio: 20 servicios por página
- Historial: 20 registros por página
- Academy flashcards: 10 por sesión

---

### 6. DEBOUNCE EN INPUTS

```typescript
// ✅ OBLIGATORIO en búsquedas y filtros
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback((value: string) => {
  setSearchTerm(value)
}, 300) // Mínimo 300ms
```

**Aplicar en:**
- Búsqueda de directorio
- Filtros de FIDS
- Búsqueda de aeropuertos
- Cualquier input que dispare queries

---

### 7. ÍNDICES DE BASE DE DATOS

```sql
-- Crear estos índices en Supabase
CREATE INDEX idx_board_flights_airport_date ON board_flights(airport_code, flight_date);
CREATE INDEX idx_board_flights_std ON board_flights(std);
CREATE INDEX idx_directory_ubicacion ON directory_services(ubicacion);
CREATE INDEX idx_pilot_duty_user_fecha ON pilot_duty_days(user_id, fecha);
CREATE INDEX idx_users_posicion ON users(posicion);
```

---

### 8. STATIC GENERATION

```typescript
// ✅ Páginas públicas: usar SSG
// src/app/page.tsx (landing)
export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hora

// ✅ Páginas semi-estáticas: usar ISR
// src/app/academy/[system]/page.tsx
export const revalidate = 86400 // 24 horas
```

---

### 9. ERROR BOUNDARIES

```typescript
// ✅ OBLIGATORIO: Cada feature debe tener error boundary
// src/features/fids/components/FidsErrorBoundary.tsx

'use client'
import { ErrorBoundary } from 'react-error-boundary'

function FidsFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 text-center">
      <p>Error cargando tablero</p>
      <button onClick={resetErrorBoundary}>Reintentar</button>
    </div>
  )
}
```

---

### 10. LOADING STATES

```typescript
// ✅ OBLIGATORIO: Skeletons, no spinners genéricos
// Cada componente que carga datos debe tener su skeleton

// src/features/fids/components/FlightCardSkeleton.tsx
export function FlightCardSkeleton() {
  return (
    <div className="animate-pulse bg-surface rounded-lg p-4">
      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2" />
      <div className="h-6 bg-gray-700 rounded w-1/2" />
    </div>
  )
}
```

---

### 11. BUNDLE SIZE

**Límites:**
- First Load JS: < 100KB
- Cada página: < 50KB adicional
- Imágenes: WebP, max 100KB cada una

```typescript
// ✅ Imports dinámicos para componentes pesados
const Academy = dynamic(() => import('@/features/pilot/components/Academy'), {
  loading: () => <AcademySkeleton />
})
```

---

### 12. PRIORIDAD OFFLINE POR MÓDULO

| Módulo | Prioridad | Nivel Offline |
|--------|-----------|---------------|
| PILOT (MCDU, Jornada) | CRÍTICO | 100% offline |
| FA (Registro vuelo) | CRÍTICO | 100% offline |
| OPS/TRAFICO/MANTTO | ALTA | 100% offline |
| FIDS | MEDIA | Lectura offline, escritura online |
| Directorio | MEDIA | Lectura offline |

---

## ✅ CHECKLIST ANTES DE CADA COMMIT

- [ ] No hay `select('*')` en ningún query
- [ ] Todas las listas tienen paginación
- [ ] Realtime solo donde es necesario
- [ ] Debounce en todos los inputs de búsqueda
- [ ] Error boundaries en cada feature
- [ ] Loading skeletons (no spinners)
- [ ] Offline support para PILOT y FA

---

## 🔴 MÁXIMA PRIORIDAD: OFFLINE-FIRST PARA PILOT

> El módulo PILOT debe funcionar 100% offline. El usuario NUNCA debe notar que perdió conexión. La app debe comportarse EXACTAMENTE igual con o sin internet.

---

### PRINCIPIO FUNDAMENTAL

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   GUARDAR LOCAL PRIMERO → SYNC EN BACKGROUND → NUNCA       │
│   BLOQUEAR UI ESPERANDO RESPUESTA DEL SERVIDOR             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 1. AUTH OFFLINE (LOGIN SIN INTERNET)

```typescript
// El login DEBE funcionar offline si el usuario ya inició sesión antes

// Flujo de Auth:
// 1. Primer login (requiere internet) → Guardar credenciales encriptadas en IndexedDB
// 2. Logins posteriores → Verificar contra IndexedDB si no hay internet
// 3. Cuando hay internet → Validar token con Supabase en background

// src/features/auth/services/offline-auth.ts
import { openDB } from 'idb'

interface CachedSession {
  user_id: string
  email: string
  posicion: string
  token_hash: string  // Hash del token, NO el token en claro
  cached_at: number
  expires_at: number
}

const AUTH_DB = 'fly-zulu-auth'
const SESSION_STORE = 'session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 días

export async function cacheSession(session: Session) {
  const db = await openDB(AUTH_DB, 1, {
    upgrade(db) {
      db.createObjectStore(SESSION_STORE)
    }
  })

  await db.put(SESSION_STORE, {
    user_id: session.user.id,
    email: session.user.email,
    posicion: session.user.user_metadata.posicion,
    token_hash: await hashToken(session.access_token),
    cached_at: Date.now(),
    expires_at: Date.now() + SESSION_MAX_AGE
  }, 'current')
}

export async function getOfflineSession(): Promise<CachedSession | null> {
  const db = await openDB(AUTH_DB, 1)
  const session = await db.get(SESSION_STORE, 'current')

  if (!session) return null
  if (Date.now() > session.expires_at) {
    await db.delete(SESSION_STORE, 'current')
    return null
  }

  return session
}

export async function canLoginOffline(): Promise<boolean> {
  const session = await getOfflineSession()
  return session !== null
}
```

---

### 2. BASE DE DATOS LOCAL (IndexedDB)

```typescript
// src/lib/offline-db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface FlyZuluDB extends DBSchema {
  // Pilot data
  'pilot-duty-days': {
    key: string // fecha ISO
    value: {
      id: string
      fecha: string
      inicio: string
      fin: string
      segments: FlightSegment[]
      syncStatus: 'synced' | 'pending' | 'error'
      localUpdatedAt: number
      serverUpdatedAt?: number
    }
    indexes: { 'by-sync-status': string }
  }

  'pilot-segments': {
    key: string
    value: {
      id: string
      dutyId: string
      tail: string
      type: string
      dep: string
      dest: string
      out: string
      off: string
      on: string
      in: string
      syncStatus: 'synced' | 'pending' | 'error'
      localUpdatedAt: number
    }
    indexes: { 'by-duty': string, 'by-sync-status': string }
  }

  // Reference data (airports, aircraft types)
  'reference-airports': {
    key: string // ICAO code
    value: {
      icao: string
      iata: string
      name: string
      timezone: string
    }
  }

  'reference-aircraft': {
    key: string
    value: {
      type: string
      name: string
    }
  }

  // Sync queue
  'sync-queue': {
    key: string
    value: {
      id: string
      table: string
      operation: 'insert' | 'update' | 'delete'
      data: any
      createdAt: number
      attempts: number
      lastError?: string
    }
  }
}

let dbInstance: IDBPDatabase<FlyZuluDB> | null = null

export async function getDB(): Promise<IDBPDatabase<FlyZuluDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<FlyZuluDB>('fly-zulu-pilot', 1, {
    upgrade(db) {
      // Pilot duty days
      const dutyStore = db.createObjectStore('pilot-duty-days', { keyPath: 'fecha' })
      dutyStore.createIndex('by-sync-status', 'syncStatus')

      // Pilot segments
      const segmentStore = db.createObjectStore('pilot-segments', { keyPath: 'id' })
      segmentStore.createIndex('by-duty', 'dutyId')
      segmentStore.createIndex('by-sync-status', 'syncStatus')

      // Reference data
      db.createObjectStore('reference-airports', { keyPath: 'icao' })
      db.createObjectStore('reference-aircraft', { keyPath: 'type' })

      // Sync queue
      db.createObjectStore('sync-queue', { keyPath: 'id' })
    }
  })

  return dbInstance
}
```

---

### 3. OPERACIONES CRUD OFFLINE-FIRST

```typescript
// src/features/pilot/services/duty-service.ts

// ✅ REGLA: SIEMPRE guardar local PRIMERO, sync después

export async function saveDutyDay(data: DutyDayInput): Promise<DutyDay> {
  const db = await getDB()
  const id = data.id || crypto.randomUUID()

  const dutyDay: DutyDay = {
    id,
    fecha: data.fecha,
    inicio: data.inicio,
    fin: data.fin,
    segments: data.segments || [],
    syncStatus: 'pending',
    localUpdatedAt: Date.now()
  }

  // 1. GUARDAR LOCAL INMEDIATAMENTE
  await db.put('pilot-duty-days', dutyDay)

  // 2. Agregar a cola de sync
  await addToSyncQueue({
    id: crypto.randomUUID(),
    table: 'pilot_duty_days',
    operation: data.id ? 'update' : 'insert',
    data: dutyDay,
    createdAt: Date.now(),
    attempts: 0
  })

  // 3. Intentar sync en background (NO BLOQUEA)
  syncInBackground()

  // 4. Retornar inmediatamente (usuario no espera)
  return dutyDay
}

export async function getDutyDay(fecha: string): Promise<DutyDay | null> {
  const db = await getDB()

  // SIEMPRE leer de local primero
  const local = await db.get('pilot-duty-days', fecha)

  if (local) return local

  // Si no existe local y hay conexión, intentar fetch
  if (navigator.onLine) {
    try {
      const remote = await fetchFromSupabase(fecha)
      if (remote) {
        await db.put('pilot-duty-days', { ...remote, syncStatus: 'synced' })
        return remote
      }
    } catch (e) {
      // Silenciosamente fallar, no hay datos
    }
  }

  return null
}

export async function getDutyDays(startDate: string, endDate: string): Promise<DutyDay[]> {
  const db = await getDB()

  // SIEMPRE leer de local
  const all = await db.getAll('pilot-duty-days')

  return all
    .filter(d => d.fecha >= startDate && d.fecha <= endDate)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}
```

---

### 4. SISTEMA DE SYNC EN BACKGROUND

```typescript
// src/lib/sync-manager.ts

let isSyncing = false

export async function syncInBackground() {
  // Evitar múltiples syncs simultáneos
  if (isSyncing || !navigator.onLine) return

  isSyncing = true

  try {
    const db = await getDB()
    const queue = await db.getAll('sync-queue')

    // Ordenar por fecha de creación
    queue.sort((a, b) => a.createdAt - b.createdAt)

    for (const item of queue) {
      try {
        await syncItem(item)
        await db.delete('sync-queue', item.id)

        // Actualizar syncStatus del registro original
        await updateSyncStatus(item.table, item.data.id, 'synced')

      } catch (error) {
        // Incrementar intentos
        item.attempts++
        item.lastError = error.message

        if (item.attempts >= 5) {
          // Marcar como error después de 5 intentos
          await updateSyncStatus(item.table, item.data.id, 'error')
          await db.delete('sync-queue', item.id)
        } else {
          await db.put('sync-queue', item)
        }
      }
    }
  } finally {
    isSyncing = false
  }
}

async function syncItem(item: SyncQueueItem) {
  const supabase = getSupabaseClient()

  switch (item.operation) {
    case 'insert':
      await supabase.from(item.table).insert(item.data)
      break
    case 'update':
      await supabase.from(item.table).update(item.data).eq('id', item.data.id)
      break
    case 'delete':
      await supabase.from(item.table).delete().eq('id', item.data.id)
      break
  }
}

// Escuchar cambios de conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🟢 Conexión restaurada, iniciando sync...')
    syncInBackground()
  })

  window.addEventListener('offline', () => {
    console.log('🔴 Sin conexión, modo offline activado')
  })
}
```

---

### 5. HOOKS PARA COMPONENTES

```typescript
// src/features/pilot/hooks/useDutyDay.ts

export function useDutyDay(fecha: string) {
  const [data, setData] = useState<DutyDay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')

  useEffect(() => {
    let mounted = true

    async function load() {
      const dutyDay = await getDutyDay(fecha)
      if (mounted) {
        setData(dutyDay)
        setSyncStatus(dutyDay?.syncStatus || 'synced')
        setIsLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [fecha])

  const save = useCallback(async (updates: Partial<DutyDayInput>) => {
    if (!data) return

    // Optimistic update
    const updated = { ...data, ...updates }
    setData(updated)
    setSyncStatus('pending')

    // Guardar (local first, sync background)
    await saveDutyDay(updated)
  }, [data])

  return { data, isLoading, syncStatus, save }
}
```

---

### 6. INDICADOR DE SYNC (UI)

```typescript
// src/shared/components/SyncIndicator.tsx
// Pequeño indicador en la UI que muestra estado de sync

'use client'
import { useEffect, useState } from 'react'
import { getDB } from '@/lib/offline-db'

export function SyncIndicator() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkPending = async () => {
      const db = await getDB()
      const queue = await db.getAll('sync-queue')
      setPendingCount(queue.length)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    checkPending()

    const interval = setInterval(checkPending, 5000)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Solo mostrar si hay algo relevante
  if (isOnline && pendingCount === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {!isOnline && (
        <div className="bg-amber-500/90 text-black text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
          Modo Offline
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-500/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Sincronizando {pendingCount}...
        </div>
      )}
    </div>
  )
}
```

---

### 7. PRECARGA DE DATOS DE REFERENCIA

```typescript
// src/features/pilot/services/preload-service.ts
// Precargar aeropuertos y tipos de avión cuando hay conexión

export async function preloadReferenceData() {
  if (!navigator.onLine) return

  const db = await getDB()
  const supabase = getSupabaseClient()

  // Aeropuertos de México
  const { data: airports } = await supabase
    .from('airports')
    .select('icao, iata, name, timezone')
    .in('country', ['MX'])

  if (airports) {
    const tx = db.transaction('reference-airports', 'readwrite')
    for (const airport of airports) {
      await tx.store.put(airport)
    }
    await tx.done
  }

  // Tipos de avión
  const { data: aircraft } = await supabase
    .from('aircraft_types')
    .select('type, name')

  if (aircraft) {
    const tx = db.transaction('reference-aircraft', 'readwrite')
    for (const ac of aircraft) {
      await tx.store.put(ac)
    }
    await tx.done
  }
}

// Llamar al iniciar la app si hay conexión
if (typeof window !== 'undefined' && navigator.onLine) {
  preloadReferenceData()
}
```

---

### 8. SERVICE WORKER PARA PWA

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }
      }
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
        }
      }
    }
  ]
})

module.exports = withPWA({
  // tu config de Next.js
})
```

---

### 9. PRUEBAS OFFLINE OBLIGATORIAS

```typescript
// Antes de considerar el módulo PILOT completo, verificar:

// ✅ Checklist de pruebas offline:
// [ ] Usuario puede hacer login offline (si ya hizo login antes)
// [ ] MCDU carga sin internet
// [ ] Usuario puede agregar segmentos sin internet
// [ ] Usuario puede editar segmentos sin internet
// [ ] Los datos persisten al cerrar y abrir la app
// [ ] Al recuperar conexión, los datos se sincronizan
// [ ] No hay errores visibles durante todo el flujo
// [ ] El indicador de sync muestra estado correcto
```

---

### RESUMEN: FLUJO COMPLETO OFFLINE

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO ABRE LA APP                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   ¿Hay sesión en IndexedDB?   │
              └───────────────────────────────┘
                    │                │
                   SÍ               NO
                    │                │
                    ▼                ▼
         ┌──────────────┐    ┌──────────────┐
         │ Usar sesión  │    │   Mostrar    │
         │   offline    │    │    login     │
         └──────────────┘    └──────────────┘
                    │                │
                    ▼                ▼
         ┌──────────────────────────────────┐
         │         CARGAR DATOS             │
         │   (SIEMPRE desde IndexedDB)      │
         └──────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────┐
         │      USUARIO HACE CAMBIOS        │
         │   1. Guardar en IndexedDB        │
         │   2. Agregar a sync queue        │
         │   3. Actualizar UI (instant)     │
         └──────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      ¿Hay conexión?           │
              └───────────────────────────────┘
                    │                │
                   SÍ               NO
                    │                │
                    ▼                ▼
         ┌──────────────┐    ┌──────────────┐
         │    Sync en   │    │   Mantener   │
         │  background  │    │   en queue   │
         └──────────────┘    └──────────────┘
                    │                │
                    └────────┬───────┘
                             ▼
         ┌──────────────────────────────────┐
         │   USUARIO CONTINÚA TRABAJANDO    │
         │     (sin interrupciones)         │
         └──────────────────────────────────┘
```

---

## 🔐 VERIFICACIÓN DE EMAIL OBLIGATORIA

> Ningún usuario puede acceder a la app sin verificar su email primero.

---

### FLUJO DE REGISTRO

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PASO 1: Formulario          PASO 2: Confirmar Email           │
│   ┌─────────────────────┐     ┌─────────────────────┐          │
│   │ Nombre: ________    │     │                     │          │
│   │ Email: _________    │ --> │  ¿Tu correo es      │          │
│   │ WhatsApp: ______    │     │   correcto?         │          │
│   │ Contraseña: ____    │     │                     │          │
│   │ Posición: ______    │     │  user@email.com     │          │
│   │                     │     │                     │          │
│   │ [Continuar]         │     │ [Corregir] [Sí ✓]   │          │
│   └─────────────────────┘     └─────────────────────┘          │
│                                         │                       │
│                                         ▼                       │
│                               ┌─────────────────────┐          │
│   PASO 3: Verificar Email     │                     │          │
│   ┌─────────────────────┐     │  📩 Revisa tu       │          │
│   │                     │     │     bandeja         │          │
│   │  ✅ Email           │ <-- │                     │          │
│   │     verificado!     │     │  [Reenviar correo]  │          │
│   │                     │     │                     │          │
│   │  [Iniciar sesión]   │     └─────────────────────┘          │
│   └─────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### IMPLEMENTACIÓN

#### 1. Configurar Supabase Auth

```sql
-- En Supabase Dashboard > Authentication > Settings:
-- ✅ Enable email confirmations = ON
-- ✅ Secure email change = ON

-- Redirect URL después de confirmar:
-- https://tu-dominio.com/auth/callback
```

#### 2. Componente de Confirmación de Email

```typescript
// src/features/auth/components/EmailConfirmationStep.tsx

'use client'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Mail, ArrowLeft, Check } from 'lucide-react'

interface EmailConfirmationStepProps {
  email: string
  onConfirm: () => void
  onGoBack: () => void
}

export function EmailConfirmationStep({
  email,
  onConfirm,
  onGoBack
}: EmailConfirmationStepProps) {
  return (
    <Card className="bg-surface border-none">
      <CardContent className="pt-6 space-y-6">

        {/* Icono */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent" />
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-white">
            ¿Tu correo es correcto?
          </h2>
          <p className="text-text-muted text-sm">
            Te enviaremos un correo de verificación.
            Asegúrate de que sea correcto.
          </p>
        </div>

        {/* Email destacado */}
        <div className="bg-surface-hover rounded-lg p-4 text-center">
          <p className="text-lg font-mono text-accent">
            {email}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onGoBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Corregir
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1 bg-accent text-black hover:bg-accent/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Sí, es correcto
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
```

#### 3. Componente de Espera de Verificación

```typescript
// src/features/auth/components/VerificationPendingScreen.tsx

'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { resendVerificationEmail } from '../services/auth-service'
import { toast } from 'sonner'

interface VerificationPendingScreenProps {
  email: string
  onChangeEmail: () => void
}

export function VerificationPendingScreen({
  email,
  onChangeEmail
}: VerificationPendingScreenProps) {
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Countdown para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail(email)
      toast.success('Correo reenviado')
      setCountdown(60) // 60 segundos de espera
    } catch (error) {
      toast.error('Error al reenviar correo')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <Card className="bg-surface border-none max-w-md w-full">
        <CardContent className="pt-6 space-y-6">

          {/* Icono animado */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-accent animate-pulse" />
            </div>
          </div>

          {/* Mensaje */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Revisa tu bandeja de entrada
            </h2>
            <p className="text-text-muted text-sm">
              Enviamos un correo de verificación a:
            </p>
            <p className="text-accent font-mono">
              {email}
            </p>
          </div>

          {/* Instrucciones */}
          <div className="bg-surface-hover rounded-lg p-4 space-y-2">
            <p className="text-sm text-text-muted">
              Haz clic en el enlace del correo para verificar tu cuenta.
            </p>
            <p className="text-sm text-text-muted">
              ¿No lo ves? Revisa tu carpeta de spam.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="w-full"
            >
              {isResending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {countdown > 0
                ? `Reenviar en ${countdown}s`
                : 'Reenviar correo'
              }
            </Button>

            <Button
              variant="ghost"
              onClick={onChangeEmail}
              className="w-full text-text-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cambiar email
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
```

#### 4. Flujo de Registro Completo

```typescript
// src/features/auth/components/SignupWizard.tsx

'use client'
import { useState } from 'react'
import { SignupForm } from './SignupForm'
import { EmailConfirmationStep } from './EmailConfirmationStep'
import { VerificationPendingScreen } from './VerificationPendingScreen'
import { signUp } from '../services/auth-service'
import { toast } from 'sonner'

type Step = 'form' | 'confirm-email' | 'verification-pending'

interface FormData {
  nombre: string
  email: string
  whatsapp: string
  password: string
  categoria: 'FLIGHT' | 'GROUND'
  posicion: string
}

export function SignupWizard() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFormSubmit = (data: FormData) => {
    setFormData(data)
    setStep('confirm-email') // Ir a confirmación
  }

  const handleEmailConfirmed = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      // Registrar en Supabase (enviará email automáticamente)
      await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            whatsapp: formData.whatsapp,
            categoria: formData.categoria,
            posicion: formData.posicion
          }
        }
      })

      setStep('verification-pending')

    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast.error('Este email ya está registrado')
      } else {
        toast.error('Error al crear cuenta')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    setStep('form')
  }

  const handleChangeEmail = () => {
    setStep('form')
  }

  // Renderizar paso actual
  switch (step) {
    case 'form':
      return (
        <SignupForm
          initialData={formData}
          onSubmit={handleFormSubmit}
        />
      )

    case 'confirm-email':
      return (
        <EmailConfirmationStep
          email={formData!.email}
          onConfirm={handleEmailConfirmed}
          onGoBack={handleGoBack}
        />
      )

    case 'verification-pending':
      return (
        <VerificationPendingScreen
          email={formData!.email}
          onChangeEmail={handleChangeEmail}
        />
      )
  }
}
```

#### 5. Servicio de Auth

```typescript
// src/features/auth/services/auth-service.ts

import { getSupabaseClient } from '@/shared/lib/supabase'

export async function signUp(params: SignUpParams) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: params.options?.data,
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
  return data
}

export async function resendVerificationEmail(email: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    // Verificar si el email no está confirmado
    if (error.message.includes('Email not confirmed')) {
      throw new Error('EMAIL_NOT_VERIFIED')
    }
    throw error
  }

  return data
}
```

#### 6. Protección en Login

```typescript
// src/features/auth/components/LoginForm.tsx

const handleLogin = async (data: LoginFormData) => {
  setIsLoading(true)
  try {
    await signIn(data.email, data.password)
    router.push('/dashboard')

  } catch (error: any) {
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      toast.error('Debes verificar tu email antes de iniciar sesión', {
        description: 'Revisa tu bandeja de entrada',
        action: {
          label: 'Reenviar',
          onClick: () => resendVerificationEmail(data.email)
        }
      })
    } else if (error.message.includes('Invalid login')) {
      toast.error('Email o contraseña incorrectos')
    } else {
      toast.error('Error al iniciar sesión')
    }
  } finally {
    setIsLoading(false)
  }
}
```

#### 7. Callback de Verificación

```typescript
// src/app/auth/callback/route.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/verificado'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error de verificación
  return NextResponse.redirect(`${origin}/auth/error?type=verification`)
}
```

#### 8. Página de Éxito

```typescript
// src/app/verificado/page.tsx

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerificadoPage() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <Card className="bg-surface border-none max-w-md w-full">
        <CardContent className="pt-6 space-y-6 text-center">

          {/* Icono de éxito */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              ¡Email verificado!
            </h1>
            <p className="text-text-muted">
              Tu cuenta está lista para usar.
            </p>
          </div>

          {/* Botón */}
          <Button asChild className="w-full bg-accent text-black hover:bg-accent/90">
            <Link href="/login">
              Iniciar sesión
            </Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
```

---

### RESUMEN DEL FLUJO

```
┌─────────────────────────────────────────────────────────────────┐
│                     REGISTRO DE USUARIO                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Usuario llena formulario    │
              │   (nombre, email, password)   │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   "¿Tu correo es correcto?"   │
              │   [Corregir] [Sí, continuar]  │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Supabase crea usuario       │
              │   + envía email verificación  │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   "Revisa tu bandeja"         │
              │   [Reenviar] [Cambiar email]  │
              └───────────────────────────────┘
                              │
                    (Usuario hace clic en email)
                              │
                              ▼
              ┌───────────────────────────────┐
              │   /auth/callback procesa      │
              │   código de verificación      │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   "¡Email verificado!"        │
              │   [Iniciar sesión]            │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Usuario puede hacer login   │
              │   y acceder a la app          │
              └───────────────────────────────┘
```

---

## 📋 PANEL DE DETALLES DE VUELO (FIDS)

> Diseño del panel expandido para ver y gestionar cambios de un vuelo.

---

### DISEÑO UI

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │  VIVA  VIV 5008                              [✏️] [🗑️] │  │
│   │                                                         │  │
│   │  ─────────────────────────────────────────────────────  │  │
│   │                                                         │  │
│   │  DESTINO          CULIACAN (MMCL)                      │  │
│   │  HORA PROG.       18:00                                │  │
│   │  GATE ORIG.       20                                   │  │
│   │                                                         │  │
│   │  ─────────────────────────────────────────────────────  │  │
│   │                                                         │  │
│   │  CAMBIOS ACTIVOS:                                      │  │
│   │                                                         │  │
│   │  ┌───────────────────────────────────────────────────┐ │  │
│   │  │ 🟠 DELAY         Nueva hora: 19:15                │ │  │
│   │  │                  (hace 23 min por @maria_ops)     │ │  │
│   │  └───────────────────────────────────────────────────┘ │  │
│   │                                                         │  │
│   │  ┌───────────────────────────────────────────────────┐ │  │
│   │  │ 🔵 GATE CHANGE   Nuevo gate: 18                   │ │  │
│   │  │                  (hace 10 min por @carlos_pil)    │ │  │
│   │  └───────────────────────────────────────────────────┘ │  │
│   │                                                         │  │
│   │  ─────────────────────────────────────────────────────  │  │
│   │                                                         │  │
│   │  AGREGAR CAMBIO:                                       │  │
│   │                                                         │  │
│   │  ○ Delay      [Nueva hora: ____]                       │  │
│   │  ○ Gate Chg   [Nuevo gate: ____]                       │  │
│   │  ○ Cancelado  ⚠️ Esto eliminará otros status          │  │
│   │                                                         │  │
│   │  [AGREGAR CAMBIO]                                      │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### ELEMENTOS DEL PANEL

| Sección | Descripción |
|---------|-------------|
| **Header** | Aerolínea + número de vuelo + botones editar/eliminar |
| **Info Original** | Destino, hora programada, gate original |
| **Cambios Activos** | Lista de cambios con tipo, valor, timestamp y usuario |
| **Agregar Cambio** | Radio buttons para Delay/Gate Change/Cancelado |

---

### COLORES DE STATUS

| Status | Color | Código |
|--------|-------|--------|
| DELAY | Naranja | `#f59e0b` |
| GATE_CHANGE | Azul | `#3b82f6` |
| CANCELED | Rojo | `#ef4444` |
| ON_TIME | Verde | `#22c55e` |
| BOARDING | Verde animado | `#22c55e` + pulse |

---

### MODELO DE DATOS REQUERIDO

```typescript
// Extender el modelo Flight para soportar historial de cambios

interface FlightChange {
  id: string
  flight_id: string
  change_type: 'DELAY' | 'GATE_CHANGE' | 'CANCELED' | 'STATUS_UPDATE'
  old_value: string | null
  new_value: string
  created_by: string  // user_id
  created_by_name: string  // nombre o @handle
  created_at: string
}

interface FlightWithHistory extends Flight {
  changes: FlightChange[]
  original_gate: string | null
  original_time: string
}
```

---

### MIGRACIÓN SQL

```sql
-- Tabla para historial de cambios de vuelos
CREATE TABLE flight_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('DELAY', 'GATE_CHANGE', 'CANCELED', 'STATUS_UPDATE')),
  old_value TEXT,
  new_value TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_flight_changes_flight_id ON flight_changes(flight_id);
CREATE INDEX idx_flight_changes_created_at ON flight_changes(created_at DESC);

-- RLS
ALTER TABLE flight_changes ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver cambios
CREATE POLICY "Anyone can view flight changes"
  ON flight_changes FOR SELECT
  USING (true);

-- Solo usuarios autenticados pueden crear cambios
CREATE POLICY "Authenticated users can create changes"
  ON flight_changes FOR INSERT
  WITH CHECK (auth.uid() = created_by);
```

---

## 📊 SISTEMA DE AUDITORÍA Y TRACKING DE USUARIOS

> Todas las acciones de los usuarios deben ser registradas para control, métricas y detección de cambios falsos.

---

### PRINCIPIO DE AUDITORÍA

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CADA CAMBIO = REGISTRO EN audit_logs                      │
│   - Quién (user_id + nombre)                                │
│   - Qué (tabla + campo + registro)                          │
│   - Cuándo (timestamp)                                      │
│   - Antes → Después (old_value → new_value)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 1. TABLA DE AUDITORÍA GENERAL

```sql
-- Tabla principal de auditoría para TODAS las acciones
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quién
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_position TEXT,  -- PILOT, FA, OPS, etc.

  -- Qué
  action TEXT NOT NULL CHECK (action IN (
    'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE',
    'LOGIN', 'LOGOUT', 'VIEW'
  )),
  table_name TEXT NOT NULL,
  record_id UUID,
  field_name TEXT,  -- Campo específico que cambió

  -- Valores
  old_value JSONB,  -- Estado anterior (null si es CREATE)
  new_value JSONB,  -- Estado nuevo (null si es DELETE)

  -- Contexto
  ip_address INET,
  user_agent TEXT,

  -- Tiempo
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Para consolidación visual (1 hora sin cambios)
  is_consolidated BOOLEAN DEFAULT FALSE,
  consolidated_at TIMESTAMPTZ
);

-- Índices para queries rápidas
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todos los logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );

-- Usuarios pueden ver sus propios logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Sistema puede insertar logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
```

---

### 2. FUNCIÓN PARA REGISTRAR AUDITORÍA

```sql
-- Función helper para insertar logs de auditoría
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_field_name TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_info RECORD;
  v_log_id UUID;
BEGIN
  -- Obtener info del usuario
  SELECT email, nombre, posicion
  INTO v_user_info
  FROM users
  WHERE id = p_user_id;

  -- Insertar log
  INSERT INTO audit_logs (
    user_id, user_email, user_name, user_position,
    action, table_name, record_id, field_name,
    old_value, new_value
  ) VALUES (
    p_user_id, v_user_info.email, v_user_info.nombre, v_user_info.posicion,
    p_action, p_table_name, p_record_id, p_field_name,
    p_old_value, p_new_value
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3. TRIGGERS AUTOMÁTICOS PARA TABLAS CRÍTICAS

```sql
-- Trigger genérico para auditoría
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit(
      COALESCE(NEW.created_by, auth.uid()),
      'CREATE',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Solo loguear si hay cambios reales
    IF OLD IS DISTINCT FROM NEW THEN
      PERFORM log_audit(
        COALESCE(auth.uid(), NEW.created_by),
        'UPDATE',
        TG_TABLE_NAME,
        NEW.id,
        NULL,
        to_jsonb(OLD),
        to_jsonb(NEW)
      );
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit(
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      NULL,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a tablas críticas
CREATE TRIGGER audit_flights
  AFTER INSERT OR UPDATE OR DELETE ON flights
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_pilot_duty_days
  AFTER INSERT OR UPDATE OR DELETE ON pilot_duty_days
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_pilot_segments
  AFTER INSERT OR UPDATE OR DELETE ON pilot_segments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

### 4. CONSOLIDACIÓN VISUAL (1 HORA SIN CAMBIOS)

```sql
-- Función que consolida cambios después de 1 hora
-- Los cambios se mantienen en audit_logs pero se marcan como consolidados
CREATE OR REPLACE FUNCTION consolidate_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE audit_logs
  SET
    is_consolidated = TRUE,
    consolidated_at = NOW()
  WHERE
    is_consolidated = FALSE
    AND created_at < NOW() - INTERVAL '1 hour'
    AND NOT EXISTS (
      -- No consolidar si hay cambios más recientes en el mismo registro
      SELECT 1 FROM audit_logs al2
      WHERE al2.table_name = audit_logs.table_name
        AND al2.record_id = audit_logs.record_id
        AND al2.created_at > audit_logs.created_at
        AND al2.created_at >= NOW() - INTERVAL '1 hour'
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Llamar cada 15 minutos via cron o Edge Function
-- SELECT consolidate_audit_logs();
```

---

### 5. SERVICIO DE AUDITORÍA (TypeScript)

```typescript
// src/shared/services/audit-service.ts

'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'

interface LogAuditParams {
  action: AuditAction
  tableName: string
  recordId?: string
  fieldName?: string
  oldValue?: unknown
  newValue?: unknown
}

export async function logAudit(params: LogAuditParams) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.rpc('log_audit', {
    p_user_id: user.id,
    p_action: params.action,
    p_table_name: params.tableName,
    p_record_id: params.recordId,
    p_field_name: params.fieldName,
    p_old_value: params.oldValue ? JSON.stringify(params.oldValue) : null,
    p_new_value: params.newValue ? JSON.stringify(params.newValue) : null,
  })

  if (error) {
    console.error('Error logging audit:', error)
    return { error: error.message }
  }

  return { error: null }
}

// Obtener historial de cambios de un registro
export async function getRecordHistory(
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return data as AuditLog[]
}

// Obtener cambios recientes (no consolidados) para mostrar en UI
export async function getRecentChanges(
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .eq('is_consolidated', false)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as AuditLog[]
}
```

---

### 6. MÉTRICAS PARA ADMIN

```sql
-- Vista para métricas de usuario
CREATE OR REPLACE VIEW user_activity_metrics AS
SELECT
  u.id as user_id,
  u.nombre,
  u.email,
  u.posicion,

  -- Total de acciones
  COUNT(al.id) as total_actions,

  -- Por tipo de acción
  COUNT(al.id) FILTER (WHERE al.action = 'CREATE') as creates,
  COUNT(al.id) FILTER (WHERE al.action = 'UPDATE') as updates,
  COUNT(al.id) FILTER (WHERE al.action = 'DELETE') as deletes,
  COUNT(al.id) FILTER (WHERE al.action = 'STATUS_CHANGE') as status_changes,

  -- Por tabla
  COUNT(al.id) FILTER (WHERE al.table_name = 'flights') as flight_edits,
  COUNT(al.id) FILTER (WHERE al.table_name = 'pilot_duty_days') as duty_edits,

  -- Actividad reciente
  COUNT(al.id) FILTER (WHERE al.created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(al.id) FILTER (WHERE al.created_at >= NOW() - INTERVAL '7 days') as last_7d,

  -- Último acceso
  MAX(al.created_at) as last_activity

FROM users u
LEFT JOIN audit_logs al ON al.user_id = u.id
GROUP BY u.id, u.nombre, u.email, u.posicion;

-- Query para detectar cambios sospechosos (muchos cambios rápidos)
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_time_window INTERVAL DEFAULT '5 minutes',
  p_threshold INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  action_count BIGINT,
  time_period TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_id,
    al.user_name,
    COUNT(*) as action_count,
    date_trunc('minute', al.created_at) as time_period
  FROM audit_logs al
  WHERE al.created_at >= NOW() - p_time_window
  GROUP BY al.user_id, al.user_name, date_trunc('minute', al.created_at)
  HAVING COUNT(*) >= p_threshold
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql;
```

---

### 7. COMPONENTE DE HISTORIAL DE CAMBIOS

```typescript
// src/shared/components/ChangeHistory.tsx

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User } from 'lucide-react'

interface ChangeHistoryProps {
  changes: AuditLog[]
  showConsolidated?: boolean
}

export function ChangeHistory({ changes, showConsolidated = false }: ChangeHistoryProps) {
  const visibleChanges = showConsolidated
    ? changes
    : changes.filter(c => !c.is_consolidated)

  if (visibleChanges.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 uppercase tracking-wide">
        Cambios recientes
      </p>

      {visibleChanges.map((change) => (
        <div
          key={change.id}
          className={`text-xs p-2 rounded-lg ${
            change.is_consolidated
              ? 'bg-zinc-900/50 text-zinc-500'
              : 'bg-zinc-800/50 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3 h-3" />
            <span className="font-medium">{change.user_name || 'Usuario'}</span>
            <span className="text-zinc-600">•</span>
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(change.created_at), {
                addSuffix: true,
                locale: es
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">{change.action}:</span>
            {change.old_value && (
              <span className="line-through text-red-400/70">
                {JSON.stringify(change.old_value)}
              </span>
            )}
            {change.old_value && change.new_value && (
              <span className="text-zinc-600">→</span>
            )}
            {change.new_value && (
              <span className="text-green-400">
                {JSON.stringify(change.new_value)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

### 8. REGLAS DE RETENCIÓN

```sql
-- Eliminar logs muy antiguos (mantener 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar semanalmente
-- SELECT cleanup_old_audit_logs();
```

---

### RESUMEN: FLUJO DE AUDITORÍA

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO HACE CAMBIO                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Trigger automático captura  │
              │   - old_value (estado antes)  │
              │   - new_value (estado después)│
              │   - user_id + timestamp       │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   INSERT en audit_logs        │
              │   is_consolidated = FALSE     │
              └───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PASA 1 HORA                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
       ¿Hay cambios                     No hay cambios
       más recientes?                   en ese registro
              │                               │
              ▼                               ▼
     ┌──────────────┐              ┌──────────────────┐
     │  Mantener    │              │  is_consolidated │
     │  visible     │              │  = TRUE          │
     └──────────────┘              └──────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────┐
                              │   UI muestra solo cambios     │
                              │   NO consolidados (recientes) │
                              │   Historial completo en admin │
                              └───────────────────────────────┘
```

---

### DASHBOARD ADMIN: MÉTRICAS DE USUARIOS

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 MÉTRICAS DE ACTIVIDAD                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TOP COLABORADORES (últimos 7 días)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. @maria_ops     │ 47 cambios  │ 🟢 98% precisión      │   │
│  │ 2. @carlos_pilot  │ 32 cambios  │ 🟢 95% precisión      │   │
│  │ 3. @ana_trafico   │ 28 cambios  │ 🟡 87% precisión      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ ALERTAS                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @nuevo_usuario: 15 cambios en 5 min (revisar)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ACTIVIDAD POR HORA                                            │
│  [░░░░░░██████████████░░░░░░░░]                                │
│   6am         12pm         6pm         12am                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Última actualización: 2026-01-16*
