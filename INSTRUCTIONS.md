# 🚀 FLY-ZULU — INSTRUCCIONES PARA CLAUDE CODE

> Guía paso a paso para crear el proyecto usando SaaS Factory

---

## 📋 ARCHIVOS INCLUIDOS

```
fly-zulu-saas/
├── BUSINESS_LOGIC.md     ← Respuestas a las 7 preguntas del SaaS Factory
├── CONTEXT.md            ← Información técnica completa (respaldo)
├── INSTRUCTIONS.md       ← Este archivo (pasos a seguir)
└── PROMPT_CLAUDE_CODE.md ← Prompt listo para copiar/pegar
```

---

## 🔧 PASOS EN CURSOR + CLAUDE CODE

### PASO 1: Abrir Cursor

Abre la aplicación Cursor en tu computadora.

---

### PASO 2: Clonar SaaS Factory

En la terminal de Cursor (`Ctrl + ``):

```bash
git clone https://github.com/daniel-carreon/saas-factory-setup fly-zulu
```

---

### PASO 3: Abrir el proyecto

```
File → Open Folder → selecciona "fly-zulu"
```

---

### PASO 4: Copiar archivos del proyecto

Copia los archivos `BUSINESS_LOGIC.md` y `CONTEXT.md` a la carpeta del proyecto:

```
fly-zulu/
├── .claude/              ← Ya existe (del saas-factory)
├── BUSINESS_LOGIC.md     ← COPIAR AQUÍ
├── CONTEXT.md            ← COPIAR AQUÍ
└── ... resto del template
```

---

### PASO 5: Abrir Claude Code

Presiona `Ctrl + Shift + P` (o `Cmd + Shift + P` en Mac)

Escribe: **"Claude"** → Selecciona **"Claude: Open Claude Code"**

O desde terminal:
```bash
claude --dangerously-skip-permissions
```

---

### PASO 6: Pegar el Prompt Pre-SaaS Factory

**COPIA Y PEGA ESTO EN CLAUDE CODE:**

```markdown
# INSTRUCCIONES PRE-SAAS FACTORY

LEE ESTAS INSTRUCCIONES COMPLETAMENTE ANTES DE HACER CUALQUIER COSA.

## CONTEXTO DEL PROYECTO: FLY-ZULU

Voy a proporcionarte la documentación completa de un proyecto. Tu trabajo es:

1. LEER todos los documentos que te proporciono
2. COMPRENDER las reglas de negocio y arquitectura
3. CONFIRMARME que entendiste todo
4. ESPERAR mi comando `/new app` para iniciar SaaS Factory

## REGLAS CRÍTICAS:

- NO hagas preguntas sobre el proyecto - todo está documentado
- NO empieces a codificar hasta que yo diga `/new app`
- NO uses el wizard interactivo de SaaS Factory - ya tienes todo el contexto
- SÍ confirma que leíste y entendiste cada documento

## STACK OBLIGATORIO (NO NEGOCIABLE):

- Next.js 15+ (App Router) + TypeScript estricto
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Tailwind CSS + shadcn/ui
- Zustand para estado global
- React Hook Form + Zod para formularios
- next-pwa + IndexedDB para offline
- Mercado Pago + PayPal (NO Stripe)
- Vercel para deploy

## PRIORIDADES DE DESARROLLO:

1. **Mobile-first** - TODO se diseña primero para móvil
2. **Offline-first** - Pilot y FA DEBEN funcionar sin internet
3. **Wizard multi-paso** - Formularios largos divididos en pantallas
4. **Feedback visual** - Toasts, estados de sync, indicadores

## DOCUMENTOS A LEER:

Te voy a pegar 2 documentos en orden. Después de cada uno, confirma con:
"✅ Documento [N] leído y comprendido. [Resumen breve de lo que entendiste]"

Cuando hayas confirmado ambos documentos, di:
"🚀 LISTO. Tengo el contexto completo de FLY-ZULU. Esperando comando /new app"

---

## DOCUMENTO 1: BUSINESS_LOGIC.md

[Aquí pegas el contenido de BUSINESS_LOGIC.md]

---

Confirma: "✅ Documento 1 leído y comprendido."
```

---

### PASO 7: Pegar BUSINESS_LOGIC.md

Después de que Claude Code confirme que está listo, pega el contenido completo de `BUSINESS_LOGIC.md`.

Espera la confirmación: "✅ Documento 1 leído y comprendido."

---

### PASO 8: Pegar CONTEXT.md

Escribe:
```
## DOCUMENTO 2: CONTEXT.md
```

Y pega el contenido completo de `CONTEXT.md`.

Espera la confirmación: "✅ Documento 2 leído y comprendido."

---

### PASO 9: Verificar que Claude Code está listo

Claude Code debería responder algo como:

```
🚀 LISTO. Tengo el contexto completo de FLY-ZULU.

Entendí:
- App para tripulaciones de aviación México
- 5 roles: PILOT, FA, OPS, TRAFICO, MANTTO + SUPERADMIN
- Mobile-first, Offline-first (crítico para PILOT y FA)
- Tablero FIDS con ventana -3h a +24h
- Freemium con Mercado Pago + PayPal
- Stack: Next.js + Supabase + Tailwind + shadcn/ui

Esperando comando /new app
```

---

### PASO 10: Ejecutar /new app

Una vez que Claude Code confirme que tiene todo el contexto, escribe:

```
/new app
```

Claude Code debería:
1. **NO hacer preguntas** (ya tiene las respuestas)
2. **Crear la estructura** según SaaS Factory
3. **Aplicar la arquitectura Feature-First**
4. **Configurar el proyecto** automáticamente

---

## ⚠️ SI CLAUDE CODE HACE PREGUNTAS

Si por alguna razón Claude Code hace preguntas del wizard, responde:

```
Las respuestas están en BUSINESS_LOGIC.md y CONTEXT.md que ya leíste.
Usa esa información y continúa sin preguntar.
```

---

## 🎯 ORDEN DE DESARROLLO SUGERIDO

Una vez creado el proyecto base, desarrollar en este orden:

### Sprint 1: Core
1. Auth (registro, login, roles)
2. Layout base + Bottom Navigation
3. Perfil de usuario

### Sprint 2: FIDS + Directorio
4. Tablero FIDS (con lógica de retención)
5. Directorio Crew (solo FLIGHT)

### Sprint 3: PILOT
6. MCDU
7. Jornada
8. Offline sync

### Sprint 4: FA
9. Registro de vuelo
10. Checklist seguridad
11. Servicio a bordo

### Sprint 5: Ground Roles
12. OPS - Hoja de Control
13. TRAFICO - Control de Tiempos
14. MANTTO - Transit Check

### Sprint 6: Premium
15. Academy (flashcards)
16. CoPilot 24/7 (IA)
17. CrewMind (factores humanos)

### Sprint 7: Pagos + Admin
18. Integración Mercado Pago + PayPal
19. Panel SuperAdmin
20. Estadísticas

---

## 📝 NOTAS IMPORTANTES

### Para Claude Code:

1. **Arquitectura Feature-First** - Cada feature tiene sus components, hooks, services, types, store

2. **Nombres de archivos** - Usar kebab-case: `pilot-mcdu.tsx`, `auth-service.ts`

3. **Componentes shadcn/ui** - Instalar según se necesiten: `npx shadcn-ui@latest add button`

4. **Variables de entorno** - Crear `.env.local` desde `.env.example`

5. **Supabase MCP** - Configurar en `.mcp.json` para acceso directo

---

## 🔗 RECURSOS

- SaaS Factory: `https://github.com/daniel-carreon/saas-factory-setup`
- Supabase Docs: `https://supabase.com/docs`
- shadcn/ui: `https://ui.shadcn.com`
- Tailwind CSS: `https://tailwindcss.com/docs`
- next-pwa: `https://github.com/shadowwalker/next-pwa`

---

*Instrucciones para FLY-ZULU*
*Fecha: Enero 2026*
