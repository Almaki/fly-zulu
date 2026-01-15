import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  whatsapp: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'WhatsApp inválido'),
  categoria: z.enum(['FLIGHT', 'GROUND']),
  posicion: z.enum(['PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO']),
  terminos: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos',
  }),
  privacidad: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar la política de privacidad',
  }),
  cookies: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar las cookies',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => {
  // Validate position matches category
  const flightPositions = ['PILOT', 'FA']
  const groundPositions = ['OPS', 'TRAFICO', 'MANTTO']

  if (data.categoria === 'FLIGHT') {
    return flightPositions.includes(data.posicion)
  }
  return groundPositions.includes(data.posicion)
}, {
  message: 'La posición no corresponde a la categoría',
  path: ['posicion'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
