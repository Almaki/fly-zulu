import { z } from 'zod'
import type { SyncStatus } from '@/shared/types'

export interface PilotLog {
  id: string
  user_id: string
  date: string
  tail: string
  aircraft_type: string
  dep: string
  dest: string
  out_time: string
  off_time: string
  on_time: string
  in_time: string
  flight_time_minutes: number
  block_time_minutes: number
  duty_start: string | null
  duty_end: string | null
  duty_time_minutes: number | null
  notes: string | null
  sync_status: SyncStatus
  created_at: string
  updated_at: string
}

export const mcduEntrySchema = z.object({
  date: z.string(),
  tail: z.string().min(1, 'Matrícula requerida').max(10),
  aircraft_type: z.string().min(1, 'Tipo de avión requerido'),
  dep: z.string().length(3, 'Código IATA de 3 letras'),
  dest: z.string().length(3, 'Código IATA de 3 letras'),
  out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  off_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  on_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  notes: z.string().optional(),
})

export type MCDUEntryFormData = z.infer<typeof mcduEntrySchema>

export const dutySchema = z.object({
  duty_start: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  duty_end: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional(),
})

export type DutyFormData = z.infer<typeof dutySchema>

// Aircraft types commonly used in Mexico
export const AIRCRAFT_TYPES = [
  'A320',
  'A320neo',
  'A321',
  'A321neo',
  'B737-700',
  'B737-800',
  'B737 MAX 8',
  'B737 MAX 9',
  'E190',
  'E195',
  'CRJ-200',
  'CRJ-700',
  'ATR 42',
  'ATR 72',
] as const
