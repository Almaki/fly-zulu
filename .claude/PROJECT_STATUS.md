# FLY-ZULU - Estado del Proyecto

> **Última actualización:** 2026-01-16
> **Último commit:** `b5931cb` - fix: E2E testing bugs

## Resumen del Proyecto

**FLY-ZULU** es una aplicación web para tripulaciones de aviación (pilotos y sobrecargos) que incluye:
- **FIDS Board**: Tablero colaborativo de vuelos en tiempo real
- **Flight Log**: Registro de vuelos con cálculo automático de tiempos (MCDU style)
- **Directorio Crew**: Directorio colaborativo de servicios por aeropuerto
- **Sistema de Soporte**: Tickets con notificaciones en tiempo real
- **Admin Panel**: Métricas y gestión de usuarios

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Validación**: Zod + React Hook Form

## Roles de Usuario

| Categoría | Rol | Acceso |
|-----------|-----|--------|
| FLIGHT | PILOT | /flight, /board, /directory, /profile |
| FLIGHT | FA (Flight Attendant) | /board, /directory, /profile |
| GROUND | OPS, MANTO, TRAFICO | /board, /directory, /profile |
| ADMIN | Administrador | /admin/* |

## Estado Actual (Post E2E Testing)

### Completado Recientemente

1. **Sistema de Soporte** (migración 017)
   - Tickets con prioridad y estado
   - Notificaciones con sonido seatbelt
   - Polling cada 30s con refresh de contenido

2. **Branding y SEO**
   - Favicon FZ en SVG (icon.svg, icon-192x192.svg, icon-512x512.svg)
   - OG Image para WhatsApp/redes sociales (og-image.svg)
   - Metadata dinámica por página con template "%s | FLY-ZULU"

3. **Directorio Mejorado**
   - Muestra fecha de última actualización
   - Muestra nombre del usuario que editó
   - Solo FLIGHT puede agregar entradas (GROUND ve pero no edita)
   - Gramática corregida en contador

4. **MCDU Flight Log**
   - Validación de tiempos integrada (OUT < OFF < ON < IN)
   - Feedback visual de errores en rojo
   - Soporte para vuelos que cruzan medianoche

5. **E2E Testing Fixes**
   - Botones sin funcionalidad comentados en FIDS (TODO)
   - Permisos de directorio validados por rol
   - Notificaciones refrescan contenido al detectar nuevas

### Pendiente / TODO

1. **FIDS - Agregar vuelos** (comentado, no implementado)
   - Funcionalidad para agregar vuelos colaborativamente
   - Ver `src/features/fids/components/fids-board.tsx` líneas 37-44 y 118-126

2. **Academy Module** (no iniciado)
   - Entrenamiento y certificaciones para tripulación

3. **Métricas Avanzadas** (parcial)
   - Dashboard básico existe en /admin/metrics
   - Faltan gráficos de tendencias

## Estructura de Features

```
src/features/
├── admin/          # Panel de administración
├── auth/           # Autenticación y perfiles
├── directory/      # Directorio crew por aeropuerto
├── fids/           # Flight Information Display System
├── pilot/          # Flight log (MCDU section)
└── support/        # Sistema de tickets y notificaciones
```

## Archivos Clave Modificados Recientemente

| Archivo | Descripción |
|---------|-------------|
| `src/features/pilot/components/flight-page/mcdu-section.tsx` | Validación de tiempos MCDU |
| `src/features/fids/components/fids-board.tsx` | Botones comentados |
| `src/features/directory/components/directory-list.tsx` | Permisos y gramática |
| `src/features/directory/components/directory-entry-card.tsx` | Info de última edición |
| `src/features/support/hooks/use-notifications.ts` | Polling mejorado |
| `src/app/layout.tsx` | Metadata y OG tags |
| `public/icons/*.svg` | Iconos FZ |
| `public/og-image.svg` | Imagen para compartir |

## Migraciones de BD

La última migración es **017** (sistema de soporte):
- `support_tickets` - Tickets de soporte
- `user_notifications` - Notificaciones por usuario
- RLS policies para ambas tablas

## Comandos Útiles

```bash
npm run dev          # Desarrollo (auto-port 3000-3006)
npm run build        # Build producción
npm run typecheck    # Verificar tipos
```

## Notas para Continuar

1. El proyecto está desplegado en Vercel con auto-deploy desde `master`
2. Supabase está configurado con RLS habilitado
3. Los archivos de sonido están en `/public/sounds/`
4. El middleware protege rutas por rol de usuario

---

*Este archivo se actualiza después de cambios significativos para mantener contexto entre sesiones.*
