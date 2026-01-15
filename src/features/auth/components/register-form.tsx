'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { registerSchema, type RegisterFormData } from '../types'
import { register } from '../services'
import { useAuthStore } from '../store'
import type { User } from '@/shared/types'

const STEPS = [
  { id: 'personal', title: 'Datos Personales' },
  { id: 'credentials', title: 'Credenciales' },
  { id: 'role', title: 'Rol' },
  { id: 'terms', title: 'Términos' },
]

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      whatsapp: '',
      categoria: undefined,
      posicion: undefined,
      terminos: false,
      privacidad: false,
      cookies: false,
    },
    mode: 'onChange',
  })

  const categoria = form.watch('categoria')

  const canProceed = () => {
    const values = form.getValues()
    switch (step) {
      case 0:
        return values.nombre.length >= 2 && values.whatsapp.length >= 10
      case 1:
        return (
          values.email.includes('@') &&
          values.password.length >= 8 &&
          values.password === values.confirmPassword
        )
      case 2:
        return values.categoria && values.posicion
      case 3:
        return values.terminos && values.privacidad && values.cookies
      default:
        return false
    }
  }

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)

    try {
      const result = await register({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        whatsapp: data.whatsapp,
        categoria: data.categoria,
        posicion: data.posicion,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setUser(result.data as User)
        toast.success('Cuenta creada exitosamente')
        router.push('/board')
        router.refresh()
      }
    } catch {
      toast.error('Error al crear cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i <= step
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 transition-colors ${
                  i < step ? 'bg-[#00ff88]' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-center">{STEPS[step].title}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 0: Personal */}
          {step === 0 && (
            <>
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+521234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 1: Credentials */}
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FLIGHT">FLIGHT (Tripulación de vuelo)</SelectItem>
                        <SelectItem value="GROUND">GROUND (Personal de tierra)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="posicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!categoria}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu posición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoria === 'FLIGHT' ? (
                          <>
                            <SelectItem value="PILOT">Piloto</SelectItem>
                            <SelectItem value="FA">Sobrecargo (FA)</SelectItem>
                          </>
                        ) : categoria === 'GROUND' ? (
                          <>
                            <SelectItem value="OPS">Operaciones (OPS)</SelectItem>
                            <SelectItem value="TRAFICO">Tráfico</SelectItem>
                            <SelectItem value="MANTTO">Mantenimiento</SelectItem>
                          </>
                        ) : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-xs text-zinc-500 mt-2">
                ⚠️ La posición no se puede cambiar después del registro
              </p>
            </>
          )}

          {/* Step 3: Terms */}
          {step === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="terminos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto los términos y condiciones
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacidad"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto la política de privacidad
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookies"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto el uso de cookies
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !canProceed()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
