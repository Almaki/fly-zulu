import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const ESIA_URL = 'https://esia.serviciosgap.com.mx/esia8gmt/'
const STORAGE_STATE_PATH = path.join(__dirname, '..', 'storageState.json')
const OUTPUT_PATH = path.join(__dirname, '..', 'flights-data.json')

interface FlightData {
  flightNumber: string
  airline: string
  origin: string
  destination: string
  scheduledTime: string
  estimatedTime: string
  actualTime: string
  status: string
  gate: string
  aircraft: string
  type: 'departure' | 'arrival'
}

test.describe('ESIA Flight Scraper', () => {
  // Usar sesión guardada si existe
  test.use({
    storageState: fs.existsSync(STORAGE_STATE_PATH) ? STORAGE_STATE_PATH : undefined,
  })

  test('Extraer datos de vuelos', async ({ page }) => {
    console.log('✈️ Iniciando extracción de vuelos...')

    // Verificar si tenemos sesión
    if (!fs.existsSync(STORAGE_STATE_PATH)) {
      console.log('⚠️ No hay sesión guardada. Ejecuta primero: npm run login')
      test.skip()
      return
    }

    // Navegar a ESIA
    await page.goto(ESIA_URL)
    await page.waitForLoadState('networkidle')
    console.log('📄 Página cargada')

    // Tomar screenshot del estado actual
    await page.screenshot({ path: 'screenshots/flights-page.png' })

    // Buscar en todos los frames
    const frames = page.frames()
    console.log(`📋 Frames: ${frames.map((f) => f.name() || 'main').join(', ')}`)

    const flights: FlightData[] = []

    // Buscar tablas de vuelos en cada frame
    for (const frame of frames) {
      const frameName = frame.name() || 'main'

      // Buscar tablas que puedan contener vuelos
      const tables = frame.locator('table')
      const tableCount = await tables.count()

      if (tableCount > 0) {
        console.log(`🔍 Frame "${frameName}" tiene ${tableCount} tablas`)

        for (let i = 0; i < tableCount; i++) {
          const table = tables.nth(i)
          const rows = table.locator('tr')
          const rowCount = await rows.count()

          if (rowCount > 2) {
            // Tabla con datos
            console.log(`   📊 Tabla ${i + 1}: ${rowCount} filas`)

            // Extraer headers si existen
            const headers = await table.locator('th').allTextContents()
            console.log(`   📝 Headers: ${headers.join(', ')}`)

            // Intentar extraer datos de vuelos
            for (let j = 1; j < rowCount; j++) {
              // Skip header row
              const row = rows.nth(j)
              const cells = row.locator('td')
              const cellCount = await cells.count()

              if (cellCount >= 4) {
                // Probablemente datos de vuelo
                const cellTexts = await cells.allTextContents()

                // Intentar parsear como vuelo (ajustar según estructura real)
                const flight: Partial<FlightData> = {
                  flightNumber: cellTexts[0]?.trim() || '',
                  origin: cellTexts[1]?.trim() || '',
                  destination: cellTexts[2]?.trim() || '',
                  scheduledTime: cellTexts[3]?.trim() || '',
                  status: cellTexts[cellCount - 1]?.trim() || '',
                  type: 'departure',
                }

                if (flight.flightNumber && flight.flightNumber.match(/[A-Z]{2,3}\d+/)) {
                  flights.push(flight as FlightData)
                  console.log(`   ✈️ Vuelo: ${flight.flightNumber} - ${flight.origin} → ${flight.destination}`)
                }
              }
            }
          }
        }
      }

      // También buscar elementos con clase específica de vuelos
      const flightElements = frame.locator('[class*="vuelo"], [class*="flight"], [id*="vuelo"], [id*="flight"]')
      const elementCount = await flightElements.count()

      if (elementCount > 0) {
        console.log(`🔍 Frame "${frameName}" tiene ${elementCount} elementos de vuelo`)
      }
    }

    // Guardar datos extraídos
    const output = {
      timestamp: new Date().toISOString(),
      airport: 'TIJ',
      totalFlights: flights.length,
      flights: flights,
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
    console.log(`💾 Datos guardados en: ${OUTPUT_PATH}`)
    console.log(`📊 Total vuelos extraídos: ${flights.length}`)

    // Screenshot final
    await page.screenshot({ path: 'screenshots/scrape-complete.png', fullPage: true })

    console.log('✅ Extracción completada')
  })

  test('Explorar estructura de página', async ({ page }) => {
    console.log('🔍 Explorando estructura de ESIA...')

    if (!fs.existsSync(STORAGE_STATE_PATH)) {
      console.log('⚠️ No hay sesión guardada. Ejecuta primero: npm run login')
      test.skip()
      return
    }

    await page.goto(ESIA_URL)
    await page.waitForLoadState('networkidle')

    // Explorar todos los frames
    const frames = page.frames()
    console.log(`\n📋 Total frames: ${frames.length}`)

    for (const frame of frames) {
      const frameName = frame.name() || 'unnamed'
      const frameUrl = frame.url()
      console.log(`\n🖼️ Frame: "${frameName}"`)
      console.log(`   URL: ${frameUrl}`)

      // Buscar elementos importantes
      const inputs = await frame.locator('input').count()
      const selects = await frame.locator('select').count()
      const tables = await frame.locator('table').count()
      const links = await frame.locator('a').count()
      const buttons = await frame.locator('button, input[type="button"], input[type="submit"]').count()

      console.log(`   Inputs: ${inputs}`)
      console.log(`   Selects: ${selects}`)
      console.log(`   Tables: ${tables}`)
      console.log(`   Links: ${links}`)
      console.log(`   Buttons: ${buttons}`)

      // Listar links importantes
      if (links > 0 && links < 20) {
        const linkTexts = await frame.locator('a').allTextContents()
        console.log(`   Links: ${linkTexts.filter((t) => t.trim()).join(', ')}`)
      }
    }

    // Guardar HTML completo para análisis
    const html = await page.content()
    fs.writeFileSync('screenshots/page-structure.html', html)
    console.log('\n💾 HTML guardado en: screenshots/page-structure.html')

    await page.screenshot({ path: 'screenshots/structure-exploration.png', fullPage: true })
    console.log('✅ Exploración completada')
  })
})
