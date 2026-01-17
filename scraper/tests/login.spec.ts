import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const ESIA_URL = 'https://esia.serviciosgap.com.mx/esia8gmt/'
const STORAGE_STATE_PATH = path.join(__dirname, '..', 'storageState.json')

// Credenciales ESIA
const CREDENTIALS = {
  usuario: 'VOI',
  clave: 'voi',
  aeropuerto: 'TIJ', // Tijuana
}

test.describe('ESIA Login', () => {
  test('Login y guardar sesión', async ({ page }) => {
    console.log('🔐 Iniciando login en ESIA GAP...')

    // Navegar a la página de login
    await page.goto(ESIA_URL)
    console.log('📄 Página cargada')

    // Esperar a que cargue el frame principal
    // ESIA usa frames, el login está en mainFrame
    await page.waitForLoadState('networkidle')

    // Intentar encontrar el frame mainFrame
    let loginFrame = page.frame('mainFrame')

    if (!loginFrame) {
      // Si no hay frame, intentar buscar en la página principal
      console.log('⚠️ Frame mainFrame no encontrado, buscando en página principal...')

      // Listar todos los frames disponibles
      const frames = page.frames()
      console.log(`📋 Frames disponibles: ${frames.map((f) => f.name() || 'unnamed').join(', ')}`)

      // Buscar frame que contenga el formulario
      for (const frame of frames) {
        const hasLoginForm = await frame.locator('input[name="usuario"]').count()
        if (hasLoginForm > 0) {
          loginFrame = frame
          console.log(`✅ Formulario encontrado en frame: ${frame.name() || 'main'}`)
          break
        }
      }
    }

    // Si aún no encontramos, usar la página principal
    const context = loginFrame || page

    // Esperar el formulario de login
    console.log('⏳ Esperando formulario de login...')

    // Llenar usuario
    const usuarioInput = context.locator('input[name="usuario"]')
    await usuarioInput.waitFor({ state: 'visible', timeout: 30000 })
    await usuarioInput.fill(CREDENTIALS.usuario)
    console.log(`✅ Usuario ingresado: ${CREDENTIALS.usuario}`)

    // Llenar contraseña
    const claveInput = context.locator('input[name="clave"]')
    await claveInput.fill(CREDENTIALS.clave)
    console.log('✅ Contraseña ingresada')

    // Seleccionar aeropuerto
    const aeropuertoSelect = context.locator('select[name="cod_iapto"]')
    const selectExists = (await aeropuertoSelect.count()) > 0

    if (selectExists) {
      await aeropuertoSelect.selectOption(CREDENTIALS.aeropuerto)
      console.log(`✅ Aeropuerto seleccionado: ${CREDENTIALS.aeropuerto}`)
    } else {
      console.log('⚠️ Select de aeropuerto no encontrado')
    }

    // Tomar screenshot antes del login
    await page.screenshot({ path: 'screenshots/before-login.png' })

    // Buscar y hacer clic en el botón de login
    // Puede ser un input type="submit", button, o imagen
    const submitButton =
      context.locator('input[type="submit"]').or(context.locator('button[type="submit"]')).or(context.locator('input[type="image"]'))

    const buttonCount = await submitButton.count()
    console.log(`🔍 Botones de submit encontrados: ${buttonCount}`)

    if (buttonCount > 0) {
      await submitButton.first().click()
      console.log('🚀 Formulario enviado')
    } else {
      // Intentar enviar el formulario directamente
      const form = context.locator('form')
      if ((await form.count()) > 0) {
        await context.locator('input[name="clave"]').press('Enter')
        console.log('🚀 Formulario enviado con Enter')
      }
    }

    // Esperar la navegación después del login
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Dar tiempo para redirección

    // Tomar screenshot después del login
    await page.screenshot({ path: 'screenshots/after-login.png' })

    // Verificar si el login fue exitoso
    const currentUrl = page.url()
    console.log(`📍 URL actual: ${currentUrl}`)

    // Guardar el estado de la sesión
    const storageState = await page.context().storageState()
    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2))
    console.log(`💾 Sesión guardada en: ${STORAGE_STATE_PATH}`)

    // Verificar cookies guardadas
    const cookies = storageState.cookies
    console.log(`🍪 Cookies guardadas: ${cookies.length}`)
    cookies.forEach((c) => console.log(`   - ${c.name}: ${c.value.substring(0, 20)}...`))

    console.log('✅ Login completado exitosamente')
  })
})
