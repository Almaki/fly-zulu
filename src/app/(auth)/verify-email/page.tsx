'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { createClient } from '@/shared/lib/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // If email is already confirmed, redirect to home
      if (user.email_confirmed_at) {
        router.push('/home')
        return
      }

      setEmail(user.email || null)
    }

    getUser()

    // Listen for email verification
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'USER_UPDATED' && session?.user.email_confirmed_at) {
          toast.success('Email verificado correctamente')
          router.push('/home')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email!,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Email de verificación reenviado')
        setCooldown(60) // 60 seconds cooldown
      }
    } catch {
      toast.error('Error al reenviar el email')
    } finally {
      setIsResending(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold italic text-[#00ff41]">FLY-ZULU</h1>
          <p className="text-[#71717a]">Verificación de email</p>
        </div>

        <div className="rounded-lg border border-[#27272a] bg-[#141414] p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#0066CC]/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-[#0066CC]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#fafafa]">Verifica tu Email</h2>
              <p className="text-sm text-[#71717a]">
                Hemos enviado un enlace de verificación a:
              </p>
              {email && (
                <p className="text-[#00ff41] font-medium">{email}</p>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-zinc-300">
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta
              </p>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-zinc-300">
                Si no lo encuentras, revisa la carpeta de spam
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || cooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : cooldown > 0 ? (
                `Reenviar en ${cooldown}s`
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar email de verificación
                </>
              )}
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-[#71717a] hover:text-[#fafafa]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>

          <p className="text-xs text-center text-[#71717a]">
            Una vez verificado tu email, podrás acceder a FLY-ZULU
          </p>
        </div>
      </div>
    </div>
  )
}
