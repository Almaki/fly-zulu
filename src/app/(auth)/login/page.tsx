import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'

export const metadata: Metadata = {
  title: 'Iniciar Sesion',
  description: 'Inicia sesion en FLY-ZULU para acceder a FIDS, Directorio, Logbook y mas.',
}

export default function LoginPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-center">Iniciar sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-zinc-400">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
