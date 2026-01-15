import { z } from 'zod'
import type { SyncStatus } from '@/shared/types'
import { SPECIAL_PAX_CODES } from '@/shared/constants'

export interface FALog {
  id: string
  user_id: string
  date: string
  flight_number: string
  aircraft_type: string
  aircraft_registration: string
  origin: string
  destination: string
  captain: string | null
  copilot: string | null
  entry_time: string | null
  release_time: string | null
  boarding_time: string | null
  first_pax_time: string | null
  last_pax_time: string | null
  door_close_time: string | null
  bar_set_number: string | null
  fleje_color: string | null
  cash_folio: string | null
  sales_mxn: number
  sales_usd: number
  sales_card: number
  sync_status: SyncStatus
  created_at: string
  updated_at: string
}

export const faLogSchema = z.object({
  date: z.string(),
  flight_number: z.string().min(2, 'Número de vuelo requerido'),
  aircraft_type: z.string().min(1, 'Tipo de avión requerido'),
  aircraft_registration: z.string().min(1, 'Matrícula requerida'),
  origin: z.string().length(3, 'Código IATA de 3 letras'),
  destination: z.string().length(3, 'Código IATA de 3 letras'),
  captain: z.string().optional(),
  copilot: z.string().optional(),
  entry_time: z.string().optional(),
  release_time: z.string().optional(),
  boarding_time: z.string().optional(),
  first_pax_time: z.string().optional(),
  last_pax_time: z.string().optional(),
  door_close_time: z.string().optional(),
  bar_set_number: z.string().optional(),
  fleje_color: z.string().optional(),
  cash_folio: z.string().optional(),
  sales_mxn: z.number().min(0),
  sales_usd: z.number().min(0),
  sales_card: z.number().min(0),
})

export type FALogFormData = z.infer<typeof faLogSchema>

export interface SpecialPax {
  code: typeof SPECIAL_PAX_CODES[number]
  seat: string
  notes?: string
}

export interface Incident {
  id: string
  user_id: string
  flight_id: string | null
  type: IncidentType
  description: string
  actions_taken: string | null
  witnesses: string | null
  photos: string[] | null
  created_at: string
  updated_at: string
}

export type IncidentType =
  | 'MEDICAL'
  | 'CONFLICTIVE'
  | 'INTOXICATION'
  | 'SMOKING'
  | 'ELECTRONIC_DEVICE'
  | 'SEATBELT'
  | 'LUGGAGE'
  | 'OTHER'

export const incidentSchema = z.object({
  type: z.enum(['MEDICAL', 'CONFLICTIVE', 'INTOXICATION', 'SMOKING', 'ELECTRONIC_DEVICE', 'SEATBELT', 'LUGGAGE', 'OTHER']),
  description: z.string().min(10, 'Descripción mínima de 10 caracteres'),
  actions_taken: z.string().optional(),
  witnesses: z.string().optional(),
})

export type IncidentFormData = z.infer<typeof incidentSchema>

export const FLEJE_COLORS = [
  { value: 'red', label: 'Rojo', color: '#ef4444' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'green', label: 'Verde', color: '#22c55e' },
  { value: 'yellow', label: 'Amarillo', color: '#eab308' },
  { value: 'orange', label: 'Naranja', color: '#f97316' },
  { value: 'purple', label: 'Morado', color: '#a855f7' },
  { value: 'pink', label: 'Rosa', color: '#ec4899' },
  { value: 'white', label: 'Blanco', color: '#ffffff' },
] as const

export const INCIDENT_TYPES = [
  { value: 'MEDICAL', label: 'Médico' },
  { value: 'CONFLICTIVE', label: 'Pasajero conflictivo' },
  { value: 'INTOXICATION', label: 'Intoxicación' },
  { value: 'SMOKING', label: 'Fumar' },
  { value: 'ELECTRONIC_DEVICE', label: 'Dispositivo electrónico' },
  { value: 'SEATBELT', label: 'Cinturón de seguridad' },
  { value: 'LUGGAGE', label: 'Equipaje' },
  { value: 'OTHER', label: 'Otro' },
] as const
