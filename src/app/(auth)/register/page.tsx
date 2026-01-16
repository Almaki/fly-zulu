import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/features/auth/components'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Registrate en FLY-ZULU. La app para tripulaciones de aviacion en Mexico.',
}

export default function RegisterPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-center">Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
