'use client'

import { Ban, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#FF3B30]/20 flex items-center justify-center">
          <Ban className="w-10 h-10 text-[#FF3B30]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#fafafa]">
            Cuenta Suspendida
          </h1>
          <p className="text-zinc-400">
            Tu cuenta ha sido suspendida por violar los términos de uso de FLY-ZULU.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-left">
          <p className="text-sm text-zinc-400">
            Si crees que esto es un error, puedes contactar al equipo de soporte para revisar tu caso.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <a href="mailto:soporte@fly-zulu.com">
              <Mail className="w-4 h-4 mr-2" />
              Contactar Soporte
            </a>
          </Button>

          <Link
            href="/login"
            className="block text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
