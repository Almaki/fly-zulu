'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/register">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-[#00ff41] mb-6">Política de Privacidad</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-[#a1a1aa]">
          <p className="text-sm text-[#71717a]">Última actualización: Enero 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">1. Información que Recopilamos</h2>
            <p>Recopilamos la siguiente información cuando utilizas FLY-ZULU:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Información de registro:</strong> nombre, email, número de WhatsApp, categoría y posición laboral</li>
              <li><strong>Datos de vuelo:</strong> bitácoras de vuelo, registros de operaciones y reportes</li>
              <li><strong>Información del dispositivo:</strong> tipo de navegador, sistema operativo y dirección IP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">2. Uso de la Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar y mantener el servicio de FLY-ZULU</li>
              <li>Personalizar tu experiencia en la aplicación</li>
              <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
              <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
              <li>Garantizar la seguridad de la plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">3. Almacenamiento y Seguridad</h2>
            <p>
              Tu información se almacena en servidores seguros de Supabase con encriptación de datos.
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales
              contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">4. Compartir Información</h2>
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros,
              excepto en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Con tu consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Para proteger nuestros derechos y los de otros usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">5. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar información incorrecta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Exportar tus datos en formato legible</li>
              <li>Oponerte al procesamiento de tus datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">6. Retención de Datos</h2>
            <p>
              Conservamos tu información mientras mantengas una cuenta activa en FLY-ZULU.
              Si eliminas tu cuenta, eliminaremos tu información personal dentro de los 30 días siguientes,
              excepto cuando sea necesario retenerla por obligaciones legales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">7. Cambios en esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente.
              Te notificaremos sobre cambios significativos a través de la aplicación o por email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">8. Contacto</h2>
            <p>
              Para ejercer tus derechos o consultas sobre privacidad, contáctanos en: privacidad@fly-zulu.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
