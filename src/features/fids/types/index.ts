import { z } from 'zod'
import type { FlightStatus } from '@/shared/types'

export interface Flight {
  id: string
  flight_number: string
  airline: string
  origin: string
  destination: string
  std: string // Scheduled Time Departure
  sta: string // Scheduled Time Arrival
  etd: string | null
  eta: string | null
  atd: string | null
  ata: string | null
  status: FlightStatus
  gate: string | null
  aircraft_type: string | null
  aircraft_registration: string | null
  delay_minutes: number
  delay_reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  updated_by_name: string | null
  archived_at: string | null
}

export const flightSchema = z.object({
  flight_number: z.string().min(2, 'Número de vuelo requerido'),
  airline: z.string().min(2, 'Aerolínea requerida'),
  origin: z.string().length(3, 'Código IATA de 3 letras'),
  destination: z.string().length(3, 'Código IATA de 3 letras'),
  std: z.string(),
  sta: z.string(),
  gate: z.string().optional(),
  aircraft_type: z.string().optional(),
  aircraft_registration: z.string().optional(),
})

export type FlightFormData = z.infer<typeof flightSchema>

export interface FIDSFilters {
  airport?: string
  airline?: string
  direction?: 'departures' | 'arrivals' | 'all'
  status?: FlightStatus | 'all'
}
