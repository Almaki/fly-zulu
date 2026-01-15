# 📚 FLY-ZULU — CONTEXT.md (Información Técnica Completa)

> Documento de respaldo con toda la información detallada del proyecto

---

## 📑 TABLA DE CONTENIDOS

1. [Información General](#1-información-general)
2. [Sistema de Roles](#2-sistema-de-roles)
3. [Sistema de Auth](#3-sistema-de-auth)
4. [Tablero FIDS](#4-tablero-fids)
5. [Módulo PILOT](#5-módulo-pilot)
6. [Módulo FA](#6-módulo-fa)
7. [Módulo OPS](#7-módulo-ops)
8. [Módulo TRÁFICO](#8-módulo-tráfico)
9. [Módulo MANTTO](#9-módulo-mantto)
10. [Directorio Crew](#10-directorio-crew)
11. [Design System](#11-design-system)
12. [Offline Strategy](#12-offline-strategy)
13. [Base de Datos](#13-base-de-datos)
14. [SuperAdmin](#14-superadmin)

---

## 1. INFORMACIÓN GENERAL

### Identidad del Producto

| Campo | Valor |
|-------|-------|
| **Nombre** | FLY-ZULU (o simplemente ZULU) |
| **Tagline** | "Tu base de operaciones" |
| **Target** | Tripulaciones de aviación en México |
| **Modelo** | PWA (Progressive Web App) |
| **Prioridad** | Mobile-first, Offline-first |

### Aerolíneas Target (México)

| Aerolínea | Código | Color |
|-----------|--------|-------|
| Volaris | Y4 | #E91E8C (Rosa) |
| VivaAerobus | VB | #39FF14 (Verde) |
| Aeroméxico | AM | #E31837 (Rojo) |

### Aeropuertos Principales

```
MEX - Ciudad de México (America/Mexico_City, UTC-6)
GDL - Guadalajara (America/Mexico_City, UTC-6)
MTY - Monterrey (America/Monterrey, UTC-6)
CUN - Cancún (America/Cancun, UTC-5)
TIJ - Tijuana (America/Tijuana, UTC-8)
```

---

## 2. SISTEMA DE ROLES

### Jerarquía de Roles

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPERADMIN                             │
│                    (Acceso total)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐                 ┌─────────────┐          │
│   │   FLIGHT    │                 │   GROUND    │          │
│   │  (En aire)  │                 │  (En tierra)│          │
│   ├─────────────┤                 ├─────────────┤          │
│   │   PILOT     │                 │     OPS     │          │
│   │    FA       │                 │   TRAFICO   │          │
│   │             │                 │   MANTTO    │          │
│   └─────────────┘                 └─────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Páginas por Rol

| Rol | Páginas Exclusivas | Páginas Compartidas |
|-----|-------------------|---------------------|
| PILOT | /pilot/mcdu, /pilot/duty, /pilot/academy, /pilot/copilot, /pilot/crewmind | FIDS, Directorio, Perfil |
| FA | /fa/vuelo, /fa/seguridad, /fa/pax, /fa/catering, /fa/incidentes | FIDS, Directorio, Perfil |
| OPS | /ops/control, /ops/walkaround, /ops/gpu, /ops/responsabilidad | FIDS, Perfil |
| TRAFICO | /trafico/tiempos, /trafico/especiales, /trafico/seatmap | FIDS, Perfil |
| MANTTO | /mantto/transit, /mantto/certificacion | FIDS, Perfil |
| SUPERADMIN | /admin/* + TODAS las anteriores | Todo |

### Grupos de Funcionalidad

- **FLIGHT** (PILOT + FA): Acceso a Directorio Crew
- **GROUND** (OPS + TRAFICO + MANTTO): Sin acceso a Directorio
- **ALL**: Acceso a FIDS y Perfil

---

## 3. SISTEMA DE AUTH

### Campos de Registro

```typescript
interface UserRegistration {
  // Requeridos
  nombre: string;           // Editable después
  email: string;            // NO editable (único)
  password: string;         // Min 8 chars
  whatsapp: string;         // NO editable (único)
  
  // Posición
  categoria: 'FLIGHT' | 'GROUND';
  posicion: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO';
  // NO editable después del registro
  
  // Consentimientos (todos requeridos)
  terminos: boolean;
  privacidad: boolean;
  cookies: boolean;
  
  // Auto-capturados
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  created_at: timestamp;
}
```

### Protecciones Anti-Abuso

1. **Email único** - No duplicados
2. **WhatsApp único** - No duplicados
3. **Device Fingerprint** - FingerprintJS
4. **IP + Geo** - Registro de ubicación
5. **Filtro de palabras** - Nombres ofensivos

### Sistema de Strikes

| Strikes | Consecuencia |
|---------|--------------|
| 1 | Advertencia visible |
| 2 | Restricción temporal (24h) |
| 3 | Ban permanente |

---

## 4. TABLERO FIDS

### Lógica de Retención (CRÍTICO)

```
VENTANA DE VISUALIZACIÓN
─────────────────────────────────────────────────────────
     -3 HORAS          AHORA           +24 HORAS
         │                │                  │
         ▼                ▼                  ▼
   ┌─────────────────────────────────────────────┐
   │     VUELOS VISIBLES EN EL TABLERO          │
   │     (según hora LOCAL del aeropuerto)      │
   └─────────────────────────────────────────────┘
```

**Reglas:**
- Vuelos con STD > 3 horas atrás → Se archivan automáticamente
- Vuelos con STD en próximas 24 horas → Visibles
- Job automático cada 15 minutos para archivar
- Histórico permanente en tabla separada (solo SuperAdmin)

### Zonas Horarias México

```sql
INSERT INTO airport_timezones VALUES
  ('MEX', 'America/Mexico_City', -6),
  ('GDL', 'America/Mexico_City', -6),
  ('MTY', 'America/Monterrey', -6),
  ('CUN', 'America/Cancun', -5),      -- Quintana Roo UTC-5
  ('TIJ', 'America/Tijuana', -8),     -- Baja California
  ('HMO', 'America/Hermosillo', -7),  -- Sonora
  ('SJD', 'America/Mazatlan', -7),
  ('PVR', 'America/Mexico_City', -6);
```

### Status de Vuelos

| Status | Color | Acumulable |
|--------|-------|------------|
| On Time | Normal | - |
| Delay | #FF9500 (Naranja) | Sí |
| Gate Change | #007AFF (Azul) | Sí |
| Canceled | #FF3B30 (Rojo) | NO (exclusivo) |

---

## 5. MÓDULO PILOT

### MCDU (Estilo Airbus A320)

**Estética:**
```css
/* Colores MCDU */
--mcdu-bg: #0a0a0a;
--mcdu-green: #00ff41;
--mcdu-cyan: #00ffff;
--mcdu-amber: #ffbf00;
--mcdu-font: 'JetBrains Mono', monospace;
```

**Campos por Segmento:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| DATE | Auto | Fecha del vuelo |
| TAIL | Input | Matrícula (XA-XXX) |
| TYPE | Select | A319, A320, A321 |
| DEP | Input | ICAO origen (4 letras) |
| DEST | Input | ICAO destino (4 letras) |
| OUT | Time | Salida de puerta |
| OFF | Time | Despegue (wheels up) |
| ON | Time | Aterrizaje (wheels down) |
| IN | Time | Llegada a puerta |
| FLT TIME | Auto | ON - OFF |
| BLK TIME | Auto | IN - OUT |

**Jornada Laboral:**
- Siempre en horario ZULU
- INICIO: Manual (primer presentación)
- FIN: Último IN + 00:30 (editable)
- TOTAL: FIN - INICIO
- Alerta si > 14 horas

### Academy (Flashcards)

**Sistemas A320:**
- ATA 21: Air Conditioning
- ATA 22: Auto Flight
- ATA 24: Electrical Power
- ATA 26: Fire Protection
- ATA 27: Flight Controls
- ATA 28: Fuel
- ATA 29: Hydraulic Power
- ATA 30: Ice & Rain Protection
- ATA 31: Indicating/Recording
- ATA 32: Landing Gear
- ATA 34: Navigation
- ATA 36: Pneumatic
- ATA 49: APU
- ATA 52: Doors
- ATA 70: Engine
- ATA 71: Power Plant
- ATA 80: Starting

### CoPilot 24/7 (IA)

**Disclaimer obligatorio:**
```
⚠️ DISCLAIMER
Esta herramienta es SOLO para repaso y estudio.
NO reemplaza manuales oficiales, entrenamiento certificado,
ni procedimientos de tu aerolínea.
En caso de duda, SIEMPRE consulta documentación oficial.
```

**Capacidades:**
- Repaso de sistemas A320
- Memory items
- Limitaciones
- Procedimientos normales y anormales
- NO reemplaza manuales oficiales

### CrewMind (Factores Humanos)

**Temas:**
- James Reason Model (Swiss Cheese)
- TEM (Threat and Error Management)
- CRM (Crew Resource Management)
- 9 Competencias ICAO
- SHELL Model
- Dirty Dozen

---

## 6. MÓDULO FA

### Registro de Vuelo - Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Fecha | Date | Fecha del vuelo |
| Número de vuelo | Input | Y4-2847 |
| Tipo de avión | Select | A319, A320, A321 |
| Matrícula | Input | XA-XXX |
| Origen | Input | IATA 3 letras |
| Destino | Input | IATA 3 letras |
| Capitán | Input | Nombre completo |
| Copiloto | Input | Nombre completo |

### Control de Tiempos FA

| Tiempo | Descripción |
|--------|-------------|
| Hora de vuelo (STD) | Hora programada |
| Entrada al avión | Llegada de crew |
| Dar libre | Autorización de OPS |
| Inicio abordaje | Primer PAX |
| Primer cliente | Sube primer PAX |
| Último cliente | Sube último PAX |
| Cierre de puertas | Cierre final |
| Baja último PAX | Solo si relevo de crew |

### Servicio a Bordo

| Campo | Descripción |
|-------|-------------|
| Bar Set # | Número de set de catering |
| Color Fleje | Rojo, Verde, Azul, Amarillo, Blanco |
| Folio Cash | Número de folio de caja |
| Ventas MXN | Total en pesos |
| Ventas USD | Total en dólares |
| Ventas tarjeta | Total con tarjeta |

### Pasajeros Especiales (Códigos)

| Código | Descripción |
|--------|-------------|
| WCHR | Wheelchair - camina distancias cortas |
| WCHC | Wheelchair - completamente inmóvil |
| WCHS | Wheelchair - no sube escaleras |
| UMNR | Menor no acompañado |
| DEAF | Pasajero sordo |
| BLND | Pasajero ciego |
| MAAS | Meet and Assist |
| DPNA | Discapacidad intelectual |
| MEDA | Condición médica |
| OXYG | Pasajero con oxígeno |
| STCR | Pasajero en camilla |
| EXST | Asiento extra |

---

## 7. MÓDULO OPS

### Hoja de Control - Secciones

1. **Datos del Vuelo**
   - Fecha, vuelo llegada/salida, matrícula, posición
   - ETD/STD, configuración, trip, PAX FPLAN

2. **Combustible**
   - Fuel inicial/final (kg)
   - Taxi, TOF, Trip Fuel
   - Distribución por tanques (Izq, Central, Der)
   - Hora y remisión de carga

3. **Cierre de Clientes**
   - Pesos estándar: Hombre 89kg, Mujer 81kg, Medio 33kg
   - Conteo por cabina (A+M, A EXT, B, C)
   - Categorías: Hom, Muj, Med, Inf, OSP

4. **Distribución por Compartimentos**
   - FWD, AFT, BULK
   - Equipaje, carga comercial
   - Cálculo automático de pesos

5. **Pesos Finales**
   - OEW, Payload, ZFW, TOW, Landing Weight
   - MAC%, CG

### Walk Around Checklist

**Zonas de Inspección:**
- Nose & Cockpit
- Left Wing
- Left Engine
- Fuselage Left
- Tail Section
- Fuselage Right
- Right Engine
- Right Wing

### Reporte GPU

- Hora conexión/desconexión
- Número de GPU
- Motivo de uso
- Observaciones

---

## 8. MÓDULO TRÁFICO

### Control de Tiempos

| Tiempo | Campo |
|--------|-------|
| ETD/STD | Hora programada |
| ON BLOCK llegada | Cuñas al llegar |
| Inicio abordaje | Primer llamado |
| Último pax abordo | Cierre de boarding |
| Entrega documentación | Pax manifest |
| Cierre de puerta | Door closed |
| OFF BLOCK | Cuñas fuera |
| Hora despegue | Wheels up |

### Procedimientos Especiales

**Por tipo:**
- Sillas de ruedas (WCHR, WCHC, WCHS)
- Menores (UMNR, UMNA)
- Asistencia médica (MEDA, OXYG)
- VIP / Autoridades
- Deportados
- Mascotas en cabina
- Armas autorizadas

### Seatmap Interactivo

**Tipos de avión:**
```
A321 (220 pax): Config 3-3
A320 (186 pax): Config 3-3
A319 (144 pax): Config 3-3
```

**Colores de asiento:**
- Disponible: Gris
- Ocupado: Azul
- Especial: Amarillo
- Bloqueado: Rojo

---

## 9. MÓDULO MANTTO

### Transit Check R24

**Secciones del Checklist:**

1. ARRIVAL ITEMS
2. TOWING
3. FUSELAGE INSPECTION
4. RVSM ZONE
5. SHOCK ABSORBERS
6. POWER PLANT (con niveles de aceite)
7. WINGS
8. TAIL SECTION
9. LANDING GEAR
10. FLIGHT CONTROLS
11. DOORS & HATCHES
12. FINAL WALKTHROUGH

**Oil Levels por Motor:**

```
Engine 1 (LEFT):   [___] / [MAX] qts
Engine 2 (RIGHT):  [___] / [MAX] qts

Límites A320:
- Minimum: 12 qts
- Maximum: 24 qts
- Normal ops: 14-20 qts
- Refill if: <14 qts
```

### Certificación

- Número de licencia DGAC
- Firma digital
- Timestamp
- Observaciones/discrepancias

---

## 10. DIRECTORIO CREW

### Acceso
- Solo roles FLIGHT (PILOT + FA)
- NO acceso para GROUND

### Categorías de Servicios

| Emoji | Categoría |
|-------|-----------|
| ✈️ | A pie del avión |
| 🏢 | Aeropuerto |
| 🚕 | Taxi/Uber confianza |
| 🏨 | Hotel |
| 🍔 | Comida |
| 💊 | Farmacia |
| 🏥 | Médico |

### Datos por Servicio

```typescript
interface DirectoryService {
  id: string;
  ubicacion: string;          // Ciudad o aeropuerto
  categorias: string[];       // Múltiples permitidas
  nombre_contacto: string;
  telefono: string;
  whatsapp?: string;
  tipo_comida?: string;       // Si aplica
  rating: number;             // 1-5 estrellas
  observaciones: string;
  created_by: string;
  created_at: timestamp;
}
```

### WhatsApp Click-to-Chat

```javascript
const defaultMessage = `Hola! Soy tripulación, ¿Habrá oportunidad de apoyo para una comanda? Llegamos en el vuelo...`;
const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;
```

---

## 11. DESIGN SYSTEM

### Paleta de Colores

```css
:root {
  /* Base */
  --bg-dark: #0a0a0a;
  --surface: #141414;
  --surface-hover: #1a1a1a;
  --text: #fafafa;
  --text-muted: #71717a;
  
  /* MCDU Theme */
  --mcdu-green: #00ff41;
  --mcdu-cyan: #00ffff;
  --mcdu-amber: #ffbf00;
  
  /* Accent */
  --accent: #00ff88;
  --accent-glow: rgba(0, 255, 136, 0.3);
  
  /* Premium */
  --premium-purple: #880088;
  --premium-gold: #f09f33;
  
  /* Status */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Airlines */
  --volaris: #E91E8C;
  --viva: #39FF14;
  --aeromexico: #E31837;
  
  /* WhatsApp */
  --whatsapp: #25D366;
}
```

### Tipografía

```css
/* Base */
font-family: 'Inter', system-ui, sans-serif;

/* MCDU/Monospace */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

### Componentes Clave

1. **Bottom Navigation** - 5 tabs para todos los roles
2. **TimeWheel** - Selector de hora ZULU con ruedas
3. **Stepper** - Contador +/- para PAX
4. **Accordion** - Checklists colapsables
5. **Toast** - Notificaciones de feedback
6. **Wizard** - Formularios multi-paso

### Mobile-First Breakpoints

```css
/* Mobile first approach */
/* Default: < 640px (mobile) */

/* Tablet */
@media (min-width: 640px) { }

/* Laptop */
@media (min-width: 1024px) { }

/* Desktop */
@media (min-width: 1280px) { }
```

---

## 12. OFFLINE STRATEGY

### Prioridad por Rol

| Rol | Prioridad Offline | Justificación |
|-----|------------------|---------------|
| PILOT | CRÍTICO | Registra en vuelo |
| FA | CRÍTICO | Registra en vuelo |
| OPS | ALTA | Rampa sin señal |
| TRAFICO | ALTA | Rampa sin señal |
| MANTTO | ALTA | Rampa sin señal |
| FIDS | MEDIA | Solo lectura |
| DIRECTORIO | MEDIA | Solo lectura |

### Tecnologías

```javascript
// Stack offline
{
  "pwa": "next-pwa",
  "storage": "idb (IndexedDB wrapper)",
  "sync": "Background Sync API",
  "cache": "Workbox strategies"
}
```

### Estrategia de Sync

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Usuario registra datos                                  │
│     ↓                                                       │
│  2. Guarda en IndexedDB (local)                            │
│     ↓                                                       │
│  3. Marca como "pending sync"                              │
│     ↓                                                       │
│  4. Cuando hay conexión:                                   │
│     ↓                                                       │
│  5. Background sync a Supabase                             │
│     ↓                                                       │
│  6. Marca como "synced"                                    │
│     ↓                                                       │
│  7. Toast: "✅ Sincronizado"                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estados de Conexión (UI)

```
🟢 Online - Sincronizado
🟡 Sincronizando... (3 de 5)
🔴 Offline - 5 registros pendientes
```

---

## 13. BASE DE DATOS

### Tablas Principales

```sql
-- Usuarios
users (id, nombre, email, whatsapp, categoria, posicion, strikes, ...)

-- Dispositivos
user_devices (id, user_id, fingerprint, ip, user_agent, ...)

-- Suscripciones
subscriptions (id, user_id, plan, status, starts_at, ends_at, ...)

-- FIDS
board_flights (id, airport_code, flight_date, airline_code, ...)
board_flights_history (id, original_id, archived_at, ...)

-- Directorio
directory_services (id, ubicacion, categorias, nombre_contacto, ...)
directory_reviews (id, service_id, user_id, rating, comment, ...)

-- Pilot
pilot_duty_days (id, user_id, fecha, inicio, fin, ...)
pilot_flight_segments (id, duty_id, tail, type, dep, dest, ...)

-- FA
fa_vuelo_registro (id, user_id, fecha, numero_vuelo, ...)
fa_pasajeros_especiales (id, vuelo_id, tipo_especial, ...)
fa_checklist_seguridad (id, vuelo_id, extintores, pbe, ...)
fa_incidentes (id, vuelo_id, tipo_incidente, ...)

-- OPS
ops_hoja_control (id, user_id, fecha, vuelo_salida, ...)
ops_walkaround (id, hoja_id, zona, items_checked, ...)
ops_gpu_report (id, hoja_id, hora_conexion, ...)

-- Tráfico
trafico_control_tiempos (id, user_id, fecha, vuelo, ...)
trafico_especiales (id, control_id, tipo, cantidad, ...)

-- Mantto
mantto_transit_check (id, user_id, fecha, matricula, ...)
mantto_oil_levels (id, check_id, engine, level_qts, ...)
```

### Row Level Security (RLS)

```sql
-- Ejemplo: usuarios solo ven sus propios datos
CREATE POLICY "Users see own data" ON pilot_duty_days
  FOR SELECT USING (auth.uid() = user_id);

-- SuperAdmin ve todo
CREATE POLICY "Admin sees all" ON pilot_duty_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND posicion = 'SUPERADMIN'
    )
  );
```

---

## 14. SUPERADMIN

### Credenciales por Defecto

```
Nombre: Alex M
Email: maliachialex@gmail.com
Password: superadminsaas1414
Rol: SUPERADMIN
```

### Panel de Control

**Métricas:**
- Total usuarios (por rol)
- Registros por período
- Usuarios activos (DAU, WAU, MAU)
- Conversión Free → Premium
- Sync success rate

**Gestión de Usuarios:**
- Lista con filtros
- Agregar/quitar strikes
- Asignar permisos extra
- Ver actividad

**Feed de Actividad:**
- Nuevos registros
- Actualizaciones de FIDS
- Servicios en Directorio
- Incidentes reportados

**Histórico FIDS:**
- Búsqueda por aeropuerto/fecha
- Exportación CSV/Excel
- Estadísticas de puntualidad

---

## 📋 GLOSARIO DE TÉRMINOS

| Término | Significado |
|---------|-------------|
| FA | Flight Attendant (Sobrecargo) |
| FO | First Officer (Primer Oficial) |
| Purser | Jefe de Cabina |
| Pernocta | Quedarse a dormir en destino |
| Radial | Vuelo ida y vuelta mismo día |
| Block Time | Tiempo puerta a puerta |
| Flight Time | Tiempo aire (OFF a ON) |
| Zulu | Hora UTC |
| OUT | Avión sale de puerta |
| IN | Avión llega a puerta |
| OFF | Despegue (wheels up) |
| ON | Aterrizaje (wheels down) |
| STD | Scheduled Time Departure |
| ETD | Estimated Time Departure |
| OEW | Operating Empty Weight |
| ZFW | Zero Fuel Weight |
| TOW | Take Off Weight |
| MAC | Mean Aerodynamic Chord |
| CG | Center of Gravity |
| DGAC | Dirección General de Aeronáutica Civil |
| SCT | Secretaría de Comunicaciones y Transportes |

---

*Documento de Contexto - FLY-ZULU*
*Versión: 1.0*
*Fecha: Enero 2026*
