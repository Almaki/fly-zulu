'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, UserPlus, Link2, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { inviteUser, generateMagicLink } from '../services'

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().optional(),
  categoria: z.enum(['FLIGHT', 'GROUND']),
  posicion: z.string().min(1, 'Selecciona una posición')
})

type InviteFormData = z.infer<typeof inviteSchema>

const POSITIONS = {
  FLIGHT: [
    { value: 'PILOT', label: 'Piloto' },
    { value: 'FA', label: 'Sobrecargo/FA' }
  ],
  GROUND: [
    { value: 'OPS', label: 'Operaciones' },
    { value: 'TRAFICO', label: 'Tráfico' },
    { value: 'MANTTO', label: 'Mantenimiento' }
  ]
}

export function InviteUserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      categoria: 'FLIGHT',
      posicion: ''
    }
  })

  const selectedCategoria = watch('categoria')

  const onSubmit = async (data: InviteFormData) => {
    setIsSubmitting(true)
    try {
      const result = await inviteUser({
        email: data.email,
        nombre: data.nombre,
        categoria: data.categoria,
        posicion: data.posicion
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Invitación enviada a ${data.email}`)
        reset()
      }
    } catch {
      toast.error('Error al enviar invitación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateMagicLink = async () => {
    if (!magicLinkEmail) {
      toast.error('Ingresa un email')
      return
    }

    setIsGeneratingLink(true)
    setGeneratedLink(null)

    try {
      const result = await generateMagicLink(magicLinkEmail)

      if (result.error) {
        toast.error(result.error)
      } else if (result.link) {
        setGeneratedLink(result.link)
        toast.success('Magic link generado')
      }
    } catch {
      toast.error('Error generando magic link')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invitar nuevo usuario */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-green-400" />
            Invitar Nuevo Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                {...register('email')}
                className="bg-zinc-800 border-zinc-700"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre (opcional)</Label>
              <Input
                id="nombre"
                placeholder="Juan Pérez"
                {...register('nombre')}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={selectedCategoria}
                  onValueChange={(value: 'FLIGHT' | 'GROUND') => {
                    setValue('categoria', value)
                    setValue('posicion', '')
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLIGHT">Vuelo</SelectItem>
                    <SelectItem value="GROUND">Tierra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Posición *</Label>
                <Select
                  value={watch('posicion')}
                  onValueChange={(value) => setValue('posicion', value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Posición" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS[selectedCategoria].map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.posicion && (
                  <p className="text-sm text-red-400">{errors.posicion.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-zinc-500">
            Se enviará un email con un enlace para que el usuario complete su registro.
          </p>
        </CardContent>
      </Card>

      {/* Generar Magic Link para usuario existente */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-purple-400" />
            Generar Magic Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            Para usuarios ya registrados que necesiten un enlace de acceso rápido.
          </p>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@usuario.com"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
            <Button
              onClick={handleGenerateMagicLink}
              disabled={isGeneratingLink || !magicLinkEmail}
              variant="outline"
            >
              {isGeneratingLink ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Generar'
              )}
            </Button>
          </div>

          {generatedLink && (
            <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-green-400">Link generado:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-zinc-400 break-all font-mono">
                {generatedLink}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Este link expira en 1 hora y solo puede usarse una vez.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
