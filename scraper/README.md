# ESIA GAP Scraper

Scraper automatizado para extraer información de vuelos del sistema ESIA de GAP (Grupo Aeroportuario del Pacífico).

## Requisitos

- Node.js 18+
- Playwright instalado

## Instalación

```bash
cd scraper
npm install
npx playwright install chromium
```

## Uso

### 1. Login y guardar sesión

Primero ejecuta el login para autenticarte y guardar la sesión:

```bash
# Con navegador visible (para ver qué pasa)
npm run login

# Sin navegador (headless)
npm run login:headless
```

Esto generará:
- `storageState.json` - Cookies y estado de sesión
- `screenshots/before-login.png` - Captura antes del login
- `screenshots/after-login.png` - Captura después del login

### 2. Extraer datos de vuelos

Una vez logueado, puedes extraer los datos:

```bash
# Con navegador visible
npm run scrape

# Sin navegador
npm run scrape:headless
```

Esto generará:
- `flights-data.json` - Datos de vuelos extraídos
- `screenshots/flights-page.png` - Captura de la página de vuelos

## Credenciales

Las credenciales están configuradas en `tests/login.spec.ts`:

```typescript
const CREDENTIALS = {
  usuario: 'VOI',
  clave: 'voi',
  aeropuerto: 'TIJ', // Tijuana
}
```

## Estructura del proyecto

```
scraper/
├── tests/
│   ├── login.spec.ts          # Script de login
│   └── scrape-flights.spec.ts # Script de extracción
├── screenshots/               # Capturas de pantalla
├── storageState.json          # Sesión guardada (se genera)
├── flights-data.json          # Datos extraídos (se genera)
├── playwright.config.ts       # Configuración Playwright
└── package.json
```

## Notas sobre ESIA

- El sistema usa frames (el login está en `mainFrame`)
- El formulario de login tiene:
  - `input[name="usuario"]`
  - `input[name="clave"]`
  - `select[name="cod_iapto"]` (código de aeropuerto)
- El POST va a `validaracceso.do`

## Troubleshooting

### El frame mainFrame no se encuentra

El script busca automáticamente en todos los frames disponibles. Si el formulario no se encuentra, revisa los screenshots generados.

### Sesión expirada

Si la sesión expira, ejecuta el login de nuevo:

```bash
rm storageState.json
npm run login
```

### Ver estructura de la página

Para explorar qué elementos hay en la página:

```bash
npx playwright test scrape-flights.spec.ts -g "Explorar estructura"
```

## Integración con FLY-ZULU

Los datos extraídos en `flights-data.json` pueden ser:

1. Importados manualmente a la base de datos
2. Procesados por un cron job
3. Enviados a una API endpoint

Ver `/board/test` en la app para visualizar cómo se verían los datos.
