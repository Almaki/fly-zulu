'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/register">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-[#00ff41] mb-6">Política de Cookies</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-[#a1a1aa]">
          <p className="text-sm text-[#71717a]">Última actualización: Enero 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo
              cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web
              funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">2. Cookies que Utilizamos</h2>
            <p>FLY-ZULU utiliza los siguientes tipos de cookies:</p>

            <h3 className="text-lg font-medium text-[#fafafa] mt-4">Cookies Esenciales</h3>
            <p>
              Son necesarias para el funcionamiento de la aplicación. Incluyen cookies de autenticación
              y sesión que te permiten iniciar sesión y mantener tu sesión activa.
            </p>

            <h3 className="text-lg font-medium text-[#fafafa] mt-4">Cookies de Preferencias</h3>
            <p>
              Almacenan tus preferencias como tema de la interfaz, idioma y configuraciones personalizadas.
            </p>

            <h3 className="text-lg font-medium text-[#fafafa] mt-4">Cookies de Análisis</h3>
            <p>
              Nos ayudan a entender cómo los usuarios interactúan con FLY-ZULU para mejorar la experiencia.
              Utilizamos estas cookies de forma anónima.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">3. Cookies de Terceros</h2>
            <p>Utilizamos servicios de terceros que pueden establecer sus propias cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Para autenticación y gestión de sesiones</li>
              <li><strong>Vercel:</strong> Para optimización del rendimiento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">4. Gestión de Cookies</h2>
            <p>
              Puedes controlar y eliminar las cookies a través de la configuración de tu navegador.
              Ten en cuenta que deshabilitar cookies esenciales puede afectar el funcionamiento de FLY-ZULU.
            </p>
            <p className="mt-2">
              Para más información sobre cómo gestionar cookies en tu navegador:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
              <li>Firefox: Opciones → Privacidad y seguridad → Cookies</li>
              <li>Safari: Preferencias → Privacidad → Cookies</li>
              <li>Edge: Configuración → Cookies y permisos del sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">5. Almacenamiento Local</h2>
            <p>
              Además de cookies, FLY-ZULU utiliza el almacenamiento local del navegador
              para guardar datos de la aplicación y permitir funcionalidad offline.
              Esto incluye tus registros de vuelo pendientes de sincronización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">6. Actualizaciones</h2>
            <p>
              Podemos actualizar esta política de cookies periódicamente.
              Te recomendamos revisarla ocasionalmente para estar informado sobre cómo usamos las cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">7. Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra política de cookies, contáctanos en: soporte@fly-zulu.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
