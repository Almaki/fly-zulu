# 📋 FLY-ZULU — BUSINESS LOGIC (Respuestas para SaaS Factory)

> Este archivo responde las preguntas del SaaS Factory framework

---

## 🎯 PREGUNTA 1: ¿Cuál es el DOLOR/PROBLEMA?

### El problema principal
Las tripulaciones de aviación en México (pilotos, sobrecargos, operaciones, tráfico, mantenimiento) usan herramientas fragmentadas y obsoletas:

- **Logbooks en papel o Excel** → Pérdida de datos, errores de cálculo
- **Grupos de WhatsApp caóticos** → Información dispersa, difícil encontrar
- **Sin registro digital de operaciones** → Hojas de control, transit checks en papel
- **Cada aerolínea tiene sus propios sistemas** → No portabilidad de datos
- **Sin comunidad centralizada** → No existe un "hub" para crews mexicanos

### Costo de NO resolver
- Pilotos pierden horas reconstruyendo logbooks para auditorías SCT
- Sobrecargos repiten información en cada vuelo (manual)
- OPS/Tráfico/Mantto llenan formatos en papel que se pierden
- Información de servicios (comida, hoteles) solo existe en la memoria de veteranos
- Nuevos tripulantes no tienen acceso a conocimiento colectivo

---

## 🎯 PREGUNTA 2: ¿Quién es el USUARIO?

### Usuarios Primarios

| Rol | Código | Descripción | Dolor Principal |
|-----|--------|-------------|-----------------|
| **Piloto** | PILOT | Capitanes y Primeros Oficiales | Registro de horas, jornada laboral |
| **Sobrecargo** | FA | Flight Attendants | Registro de vuelo, tiempos, especiales |
| **Operaciones** | OPS | Personal de rampa/despacho | Hoja de control, combustible, carga |
| **Tráfico** | TRAFICO | Agentes de tráfico | Control de tiempos, pasajeros |
| **Mantenimiento** | MANTTO | Técnicos de línea | Transit checks, certificaciones |

### Características Demográficas
- **Edad**: 25-55 años
- **Tech-savvy**: Medio (usan apps básicas, no son developers)
- **Dispositivo principal**: Smartphone (80% Android, 20% iOS)
- **Conectividad**: Frecuentemente sin internet (en vuelo, rampa remota)
- **Idioma**: Español mexicano
- **Ubicación**: Aeropuertos de México (MEX, GDL, MTY, CUN, TIJ, etc.)

### Contexto de Uso
- **Pilotos/FA**: Registran datos EN VUELO (modo avión) → Necesitan offline
- **OPS/Tráfico/Mantto**: Registran en rampa (a veces sin señal) → Necesitan offline
- **Todos**: Revisan historial cuando tienen WiFi → Sync automático

---

## 🎯 PREGUNTA 3: ¿Qué SOLUCIONES existen? (Competencia)

### Competencia Directa

| App | Target | Precio | Debilidades |
|-----|--------|--------|-------------|
| **LogTen Pro** | Pilotos (global) | $149 USD/año | Solo pilotos, caro, en inglés |
| **ForeFlight** | Pilotos (USA) | $99-299 USD/año | USA-centric, no México |
| **CrewLounge PILOTLOG** | Pilotos | €89/año | Solo logbook, no operaciones |
| **AIMS eCrew** | Aerolíneas | Enterprise | Solo para aerolíneas grandes |
| **Clever Crew** | Sobrecargos | Gratis/Premium | Solo FA, limitado |

### Competencia Indirecta
- **Excel/Google Sheets** → Manual, propenso a errores
- **WhatsApp Groups** → Caótico, no estructurado
- **Papel/Formatos físicos** → Se pierden, no hay backup

### Oportunidad de Mercado
**NO existe una app que:**
- ✅ Cubra TODOS los roles (pilot + FA + ground)
- ✅ Sea específica para México (DGAC, aerolíneas mexicanas)
- ✅ Funcione 100% offline
- ✅ Tenga directorio crowdsourced de servicios
- ✅ Incluya herramientas de desarrollo profesional (factores humanos)
- ✅ Sea asequible (~$99-149 MXN/mes)

---

## 🎯 PREGUNTA 4: ¿Cuál es la SOLUCIÓN propuesta?

### FLY-ZULU: "Tu base de operaciones"

Una PWA todo-en-uno para tripulaciones de aviación mexicanas:

### Módulos por Rol

**🧑‍✈️ PILOT (Pilotos)**
- MCDU Digital → Registro de horas estilo Airbus
- Jornada Laboral → Control de tiempos ZULU
- Academy → Flashcards técnicos
- CoPilot 24/7 → Asistente IA de repaso
- CrewMind → Factores humanos y CRM

**👩‍✈️ FA (Sobrecargos)**
- Registro de Vuelo → Tiempos, tripulación, especiales
- Checklist Seguridad → Equipos de emergencia
- Servicio a Bordo → Bar set, inventario, cierre de caja
- Reporte de Incidentes → Médicos, conflictivos, etc.

**🛫 OPS (Operaciones)**
- Hoja de Control → Combustible, PAX, carga
- Walk Around → Checklist visual
- Reporte GPU → Ground Power Unit
- Formato Responsabilidad → Firmas digitales

**🎫 TRÁFICO (Agentes)**
- Control de Tiempos → ETD, boarding, cierre
- Procedimientos Especiales → WCHR, UMNR, etc.
- Seatmap Interactivo → Distribución visual

**🔧 MANTTO (Mantenimiento)**
- Transit Check R24 → Checklist completo
- Niveles de Aceite → Por motor
- Discrepancias → Registro y seguimiento

**📺 COMPARTIDO (Todos)**
- Tablero FIDS → Vuelos crowdsourced
- Directorio Crew → Servicios en pernoctas
- Perfil → Datos personales y suscripción

---

## 🎯 PREGUNTA 5: ¿Cuál es el STACK técnico?

### Stack Base (SaaS Factory + Ajustes)

| Categoría | Tecnología | Justificación |
|-----------|------------|---------------|
| **Framework** | Next.js 15+ (App Router) | SSR, PWA ready |
| **Lenguaje** | TypeScript estricto | Menos bugs |
| **Database** | Supabase (PostgreSQL) | Realtime, Auth incluido |
| **Auth** | Supabase Auth | Email/password |
| **Styling** | Tailwind CSS + shadcn/ui | Consistencia, dark mode |
| **State** | Zustand | Simple, performante |
| **Forms** | React Hook Form + Zod | Validación robusta |
| **Offline** | IndexedDB + Service Worker | Crítico para aviación |
| **PWA** | next-pwa | Instalable en móvil |
| **Pagos** | Mercado Pago + PayPal | México (NO Stripe) |
| **Deploy** | Vercel | Edge functions |
| **AI Skills** | Claude Code | CoPilot, CrewMind |

### Arquitectura Feature-First

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Login, registro
│   ├── (dashboard)/         # Rutas protegidas por rol
│   │   ├── pilot/
│   │   ├── fa/
│   │   ├── ops/
│   │   ├── trafico/
│   │   └── mantto/
│   └── admin/
│
├── features/                 # Por funcionalidad
│   ├── auth/
│   ├── fids/                # Tablero
│   ├── directory/           # Directorio crew
│   ├── pilot/               # MCDU, jornada, academy
│   ├── fa/                  # Registro vuelo FA
│   ├── ops/                 # Hoja control
│   ├── trafico/             # Control tiempos
│   ├── mantto/              # Transit check
│   └── admin/               # Panel SuperAdmin
│
└── shared/                   # Reutilizable
    ├── components/          # UI components
    ├── hooks/               # useOffline, useZuluTime
    ├── lib/                 # supabase client
    └── stores/              # Zustand stores
```

---

## 🎯 PREGUNTA 6: ¿Cómo MONETIZAR?

### Modelo Freemium

**FREE (Sin costo)**
- ✅ Registro y perfil
- ✅ MCDU/Registro (solo día actual, no historial)
- ✅ Tablero FIDS (ver, no editar status)
- ✅ Directorio (ver y agregar)
- ✅ Checklists básicos
- ✅ 5 flashcards/día

**PREMIUM (~$99-149 MXN/mes)**
- ✅ Todo FREE sin límites
- ✅ Historial completo ilimitado
- ✅ Exportación PDF/Excel
- ✅ Academy ilimitada
- ✅ CoPilot 24/7 (asistente IA)
- ✅ CrewMind (factores humanos)
- ✅ Edición de status en tablero
- ✅ Notificaciones inteligentes
- ✅ Sync multi-dispositivo

### Precios Sugeridos

| Plan | Precio | Ahorro |
|------|--------|--------|
| Mensual | $149 MXN | - |
| Trimestral | $349 MXN | 22% |
| Anual | $999 MXN | 44% |

### Pasarelas de Pago
- **Mercado Pago** → Tarjetas mexicanas, OXXO
- **PayPal** → Internacional
- **NO Stripe** → Difícil en México

---

## 🎯 PREGUNTA 7: ¿Cuáles son las MÉTRICAS de éxito?

### KPIs Principales

| Métrica | Target Mes 1 | Target Mes 6 |
|---------|--------------|--------------|
| Usuarios registrados | 500 | 5,000 |
| DAU (Daily Active Users) | 100 | 1,000 |
| Conversión Free→Premium | 5% | 10% |
| Churn mensual | <10% | <5% |
| NPS | >40 | >60 |
| Registros offline sync exitosos | >95% | >99% |

### Métricas por Módulo

| Módulo | Métrica Clave |
|--------|---------------|
| MCDU | Vuelos registrados/usuario/mes |
| FIDS | Actualizaciones crowdsourced/día |
| Directorio | Servicios agregados/mes |
| Academy | Flashcards completadas/sesión |
| Checklists | % completados sin errores |

---

## 📋 RESUMEN EJECUTIVO

| Pregunta | Respuesta Corta |
|----------|-----------------|
| **Dolor** | Herramientas fragmentadas, papel, sin offline |
| **Usuario** | Crews mexicanos (pilot, FA, OPS, tráfico, mantto) |
| **Competencia** | Apps caras, solo pilotos, no México, no offline |
| **Solución** | PWA todo-en-uno, offline-first, por roles |
| **Stack** | Next.js + Supabase + Tailwind + PWA |
| **Monetización** | Freemium ($149 MXN/mes premium) |
| **Métricas** | DAU, conversión, sync rate, NPS |

---

*Archivo generado para SaaS Factory*
*Proyecto: FLY-ZULU*
*Fecha: Enero 2026*
