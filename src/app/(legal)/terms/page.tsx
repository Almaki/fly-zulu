'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/register">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-[#00ff41] mb-6">Términos y Condiciones</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-[#a1a1aa]">
          <p className="text-sm text-[#71717a]">Última actualización: Enero 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar FLY-ZULU, aceptas estar legalmente vinculado por estos términos y condiciones.
              Si no estás de acuerdo con alguno de estos términos, no debes usar la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">2. Descripción del Servicio</h2>
            <p>
              FLY-ZULU es una aplicación web progresiva (PWA) diseñada para tripulaciones de aviación mexicanas.
              Proporciona herramientas para el registro de vuelos, bitácoras, directorio de servicios y gestión de información operativa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">3. Registro y Cuenta</h2>
            <p>
              Para utilizar FLY-ZULU debes crear una cuenta proporcionando información veraz y actualizada.
              Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas bajo tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">4. Uso Aceptable</h2>
            <p>Te comprometes a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar la aplicación únicamente para fines legítimos relacionados con la aviación</li>
              <li>No compartir información confidencial de operaciones</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
              <li>No usar la aplicación para actividades ilegales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">5. Propiedad Intelectual</h2>
            <p>
              Todo el contenido de FLY-ZULU, incluyendo diseño, código, logos y textos,
              es propiedad exclusiva de FLY-ZULU y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">6. Limitación de Responsabilidad</h2>
            <p>
              FLY-ZULU se proporciona "tal cual" sin garantías de ningún tipo.
              No somos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso de la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación en la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#fafafa]">8. Contacto</h2>
            <p>
              Para cualquier pregunta sobre estos términos, contáctanos en: soporte@fly-zulu.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
