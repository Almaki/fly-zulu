# 🎯 PROMPT COMPLETO PARA CLAUDE CODE

> Copia todo el contenido de este archivo y pégalo en Claude Code ANTES de escribir /new app

---

# INSTRUCCIONES PRE-SAAS FACTORY PARA FLY-ZULU

LEE ESTAS INSTRUCCIONES COMPLETAMENTE ANTES DE HACER CUALQUIER COSA.

## CONTEXTO DEL PROYECTO: FLY-ZULU

Este es un proyecto completamente documentado. Tu trabajo es:

1. LEER todo este documento completo
2. COMPRENDER las reglas de negocio y arquitectura
3. CONFIRMAR que entendiste todo
4. ESPERAR mi comando `/new app` para iniciar SaaS Factory

## REGLAS CRÍTICAS:

- **NO** hagas preguntas sobre el proyecto - TODO está documentado aquí
- **NO** empieces a codificar hasta que yo diga `/new app`
- **NO** uses el wizard interactivo de SaaS Factory - ya tienes el contexto
- **SÍ** salta las preguntas del wizard y usa esta información
- **SÍ** confirma que leíste y entendiste este documento

## STACK OBLIGATORIO (NO NEGOCIABLE):

```
Framework:    Next.js 15+ (App Router) + TypeScript estricto
Database:     Supabase (PostgreSQL + Auth + Realtime + Storage)
Styling:      Tailwind CSS + shadcn/ui
State:        Zustand
Forms:        React Hook Form + Zod
Offline:      next-pwa + IndexedDB (idb)
Pagos:        Mercado Pago + PayPal (NO STRIPE)
Deploy:       Vercel
```

## PRIORIDADES DE DESARROLLO:

1. **Mobile-first** - TODO se diseña primero para móvil (max-width 390px)
2. **Offline-first** - PILOT y FA DEBEN funcionar 100% sin internet
3. **Wizard multi-paso** - Formularios largos divididos en 3-6 pantallas
4. **Feedback visual** - Toasts, estados de sync, indicadores de conexión

---

# SECCIÓN 1: INFORMACIÓN DEL PROYECTO

## 1.1 Identidad

| Campo | Valor |
|-------|-------|
| **Nombre** | FLY-ZULU (o ZULU) |
| **Tagline** | "Tu base de operaciones" |
| **Target** | Tripulaciones de aviación en México |
| **Tipo** | PWA (Progressive Web App) |

## 1.2 El Problema/Dolor

Las tripulaciones de aviación en México usan herramientas fragmentadas:
- Logbooks en papel o Excel → Pérdida de datos
- Grupos de WhatsApp caóticos → Info dispersa
- Sin registro digital de operaciones → Todo en papel
- Sin comunidad centralizada → Conocimiento se pierde

## 1.3 La Solución

Una PWA todo-en-uno para tripulaciones mexicanas:
- Registro de horas y jornada (PILOT)
- Registro de vuelo y servicio (FA)
- Hojas de control digital (OPS)
- Control de tiempos (TRAFICO)
- Transit checks digitales (MANTTO)
- Directorio crowdsourced de servicios
- Tablero FIDS compartido

---

# SECCIÓN 2: SISTEMA DE ROLES

## 2.1 Jerarquía

```
                    SUPERADMIN
                        │
         ┌──────────────┼──────────────┐
         │                             │
      FLIGHT                        GROUND
    (En aire)                     (En tierra)
    ┌───┴───┐                   ┌────┼────┐
  PILOT    FA                 OPS TRAFICO MANTTO
```

## 2.2 Páginas por Rol

| Rol | Páginas Exclusivas |
|-----|-------------------|
| PILOT | /pilot/mcdu, /pilot/duty, /pilot/academy, /pilot/copilot, /pilot/crewmind |
| FA | /fa/vuelo, /fa/seguridad, /fa/pax, /fa/catering, /fa/incidentes |
| OPS | /ops/control, /ops/walkaround, /ops/gpu, /ops/responsabilidad |
| TRAFICO | /trafico/tiempos, /trafico/especiales, /trafico/seatmap |
| MANTTO | /mantto/transit, /mantto/certificacion |
| SUPERADMIN | /admin/* + TODAS las anteriores |

## 2.3 Páginas Compartidas

- **TODOS**: FIDS (/board), Perfil (/profile)
- **Solo FLIGHT (Pilot+FA)**: Directorio (/directory)

---

# SECCIÓN 3: SISTEMA DE AUTH

## 3.1 Campos de Registro

```typescript
interface UserRegistration {
  nombre: string;           // Editable después
  email: string;            // NO editable (único)
  password: string;         // Min 8 chars
  whatsapp: string;         // NO editable (único)
  categoria: 'FLIGHT' | 'GROUND';
  posicion: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO';
  // Posición NO editable después del registro
  terminos: boolean;        // Requerido
  privacidad: boolean;      // Requerido
  cookies: boolean;         // Requerido
}
```

## 3.2 Protecciones

- Email único
- WhatsApp único
- Device Fingerprint (FingerprintJS)
- IP + Geolocalización

## 3.3 Sistema de Strikes

| Strikes | Consecuencia |
|---------|--------------|
| 1 | Advertencia |
| 2 | Restricción 24h |
| 3 | Ban permanente |

---

# SECCIÓN 4: TABLERO FIDS (CRÍTICO)

## 4.1 Lógica de Retención

```
VENTANA DE VISUALIZACIÓN (hora LOCAL del aeropuerto):

     -3 HORAS          AHORA           +24 HORAS
         │                │                  │
         ▼                ▼                  ▼
   ┌─────────────────────────────────────────────┐
   │          VUELOS VISIBLES                    │
   └─────────────────────────────────────────────┘
   
- Vuelos STD > 3h atrás → SE ARCHIVAN automáticamente
- Vuelos próximas 24h → VISIBLES
- Job cada 15 minutos mueve a histórico
```

## 4.2 Zonas Horarias México

```
MEX, GDL, PVR, MID = America/Mexico_City (UTC-6)
CUN = America/Cancun (UTC-5)
TIJ = America/Tijuana (UTC-8)
HMO = America/Hermosillo (UTC-7)
```

## 4.3 Status de Vuelos

| Status | Color | Acumulable |
|--------|-------|------------|
| On Time | Normal | - |
| Delay | #FF9500 | Sí |
| Gate Change | #007AFF | Sí |
| Canceled | #FF3B30 | NO |

---

# SECCIÓN 5: MÓDULOS POR ROL

## 5.1 PILOT

### MCDU (Estilo A320)
- Fondo negro #0a0a0a
- Texto verde #00ff41
- Font monospace
- Campos: DATE, TAIL, TYPE, DEP, DEST, OUT, OFF, ON, IN
- Cálculos auto: FLT TIME (ON-OFF), BLK TIME (IN-OUT)

### Jornada
- Siempre en ZULU
- INICIO: Manual
- FIN: Último IN + 30 min (editable)
- Alerta si > 14 horas

### Academy (Premium)
- Flashcards por sistema ATA
- Tracking de progreso

### CoPilot 24/7 (Premium)
- Asistente IA repaso técnico
- Disclaimer obligatorio
- NO reemplaza manuales

### CrewMind (Premium)
- Factores humanos
- James Reason, TEM, CRM
- 9 Competencias ICAO

## 5.2 FA

### Registro de Vuelo
- Fecha, número vuelo, tipo avión, matrícula
- Origen, destino
- Capitán, copiloto
- Tiempos: entrada, dar libre, abordaje, primer/último cliente, cierre

### Servicio a Bordo
- Bar Set #
- Color Fleje (selector visual)
- Folio Cash
- Ventas MXN, USD, tarjeta

### Pasajeros Especiales
- Códigos: WCHR, WCHC, WCHS, UMNR, DEAF, BLND, MAAS, DPNA, MEDA, OXYG, STCR, EXST

### Checklist Seguridad
- Equipos emergencia
- Evacuación
- Verificación cabina

### Incidentes
- Tipos: Médico, Conflictivo, Intoxicación, Fumar, etc.
- Descripción, acciones, testigos, fotos

## 5.3 OPS

### Hoja de Control
- Datos vuelo
- Combustible (inicial, final, distribución)
- Cierre clientes (pesos estándar: H=89kg, M=81kg, Med=33kg)
- Distribución compartimentos

### Walk Around
- Checklist por zonas

### GPU Report
- Hora conexión/desconexión

## 5.4 TRAFICO

### Control de Tiempos
- ETD, ON BLOCK, abordaje, último PAX, cierre, OFF BLOCK

### Procedimientos Especiales
- Por tipo de pasajero

### Seatmap
- Visual interactivo por tipo avión

## 5.5 MANTTO

### Transit Check R24
- Checklist completo por secciones
- Niveles de aceite por motor
- Discrepancias

### Certificación
- Licencia DGAC
- Firma digital

---

# SECCIÓN 6: DIRECTORIO CREW

## 6.1 Acceso
- Solo FLIGHT (PILOT + FA)
- NO acceso GROUND

## 6.2 Categorías
- ✈️ A pie del avión
- 🏢 Aeropuerto
- 🚕 Taxi/Uber confianza
- 🏨 Hotel
- 🍔 Comida

## 6.3 WhatsApp Click-to-Chat
```javascript
const msg = "Hola! Soy tripulación, ¿Habrá oportunidad de apoyo para una comanda? Llegamos en el vuelo...";
const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
```

---

# SECCIÓN 7: DESIGN SYSTEM

## 7.1 Colores

```css
/* Base */
--bg-dark: #0a0a0a;
--surface: #141414;
--text: #fafafa;
--text-muted: #71717a;

/* MCDU */
--mcdu-green: #00ff41;
--mcdu-cyan: #00ffff;
--mcdu-amber: #ffbf00;

/* Accent */
--accent: #00ff88;

/* Airlines */
--volaris: #E91E8C;
--viva: #39FF14;
--aeromexico: #E31837;

/* Status */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;

/* WhatsApp */
--whatsapp: #25D366;
```

## 7.2 Componentes Clave a Crear

1. **BottomNav** - 5 tabs, mismo para todos los roles
2. **TimeWheel** - Selector hora ZULU con ruedas
3. **Stepper** - Contador +/- para PAX
4. **Accordion** - Checklists colapsables
5. **Toast** - Notificaciones sonner
6. **Wizard** - Formularios multi-paso

---

# SECCIÓN 8: OFFLINE STRATEGY

## 8.1 Prioridad

| Rol | Prioridad | Razón |
|-----|-----------|-------|
| PILOT | CRÍTICO | Registra en vuelo |
| FA | CRÍTICO | Registra en vuelo |
| OPS/TRAFICO/MANTTO | ALTA | Rampa sin señal |
| FIDS/DIRECTORIO | MEDIA | Solo lectura |

## 8.2 Tecnologías

```javascript
{
  pwa: "next-pwa",
  storage: "idb",        // IndexedDB wrapper
  sync: "Background Sync API"
}
```

## 8.3 Estados UI

```
🟢 Online - Sincronizado
🟡 Sincronizando... (X de Y)
🔴 Offline - X pendientes
```

---

# SECCIÓN 9: MONETIZACIÓN

## 9.1 Planes

| Tier | Precio | Incluye |
|------|--------|---------|
| FREE | $0 | Registro día actual, FIDS (ver), Directorio, 5 flashcards/día |
| PREMIUM | $149 MXN/mes | Todo ilimitado, historial, export, IA, editar FIDS |

## 9.2 Pasarelas

- **Mercado Pago** - Tarjetas MX, OXXO
- **PayPal** - Internacional
- **NO STRIPE**

---

# SECCIÓN 10: SUPERADMIN

## 10.1 Credenciales

```
Email: maliachialex@gmail.com
Password: superadminsaas1414
Rol: SUPERADMIN
```

## 10.2 Panel

- Métricas (usuarios, conversión, DAU)
- Gestión usuarios (strikes, permisos)
- Histórico FIDS
- Feed actividad

---

# SECCIÓN 11: ARQUITECTURA

## 11.1 Estructura Feature-First

```
src/
├── app/
│   ├── (auth)/          # Login, registro
│   ├── (dashboard)/     # Rutas protegidas
│   │   ├── pilot/
│   │   ├── fa/
│   │   ├── ops/
│   │   ├── trafico/
│   │   └── mantto/
│   └── admin/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── store/
│   ├── fids/
│   ├── directory/
│   ├── pilot/
│   ├── fa/
│   ├── ops/
│   ├── trafico/
│   ├── mantto/
│   └── admin/
└── shared/
    ├── components/
    ├── hooks/
    ├── lib/
    └── stores/
```

---

# CONFIRMACIÓN REQUERIDA

Después de leer todo este documento, responde EXACTAMENTE así:

```
🚀 LISTO. Tengo el contexto completo de FLY-ZULU.

Entendí:
- [Lista breve de los puntos principales]

Esperando comando /new app para iniciar.
Saltaré el wizard interactivo y usaré esta información.
```

---

**NO HAGAS NADA MÁS HASTA QUE YO ESCRIBA: /new app**
