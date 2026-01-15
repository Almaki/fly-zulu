import { z } from 'zod'
import { PAX_WEIGHTS } from '@/shared/constants'

export interface OPSControlSheet {
  id: string
  user_id: string
  date: string
  flight_number: string
  aircraft_registration: string
  origin: string
  destination: string
  // Fuel
  fuel_initial: number
  fuel_final: number
  fuel_distribution: FuelDistribution
  // PAX
  pax_male: number
  pax_female: number
  pax_child: number
  pax_infant: number
  total_pax_weight: number
  // Cargo
  cargo_fwd: number
  cargo_aft: number
  cargo_bulk: number
  // Calculated
  total_weight: number
  created_at: string
  updated_at: string
}

export interface FuelDistribution {
  wing_left: number
  wing_right: number
  center: number
  trim?: number
}

export const controlSheetSchema = z.object({
  date: z.string(),
  flight_number: z.string().min(2),
  aircraft_registration: z.string().min(1),
  origin: z.string().length(3),
  destination: z.string().length(3),
  fuel_initial: z.number().min(0),
  fuel_final: z.number().min(0),
  fuel_distribution: z.object({
    wing_left: z.number().min(0),
    wing_right: z.number().min(0),
    center: z.number().min(0),
    trim: z.number().min(0).optional(),
  }),
  pax_male: z.number().min(0),
  pax_female: z.number().min(0),
  pax_child: z.number().min(0),
  pax_infant: z.number().min(0),
  cargo_fwd: z.number().min(0),
  cargo_aft: z.number().min(0),
  cargo_bulk: z.number().min(0),
})

export type ControlSheetFormData = z.infer<typeof controlSheetSchema>

// Calculate total PAX weight
export function calculatePaxWeight(
  male: number,
  female: number,
  child: number
): number {
  return (
    male * PAX_WEIGHTS.H +
    female * PAX_WEIGHTS.M +
    child * PAX_WEIGHTS.Med
  )
}

export interface WalkAroundItem {
  id: string
  zone: string
  item: string
  checked: boolean
  notes?: string
}

export const WALKAROUND_ZONES = [
  {
    id: 'nose',
    name: 'Nariz',
    items: [
      'Pitot tubes',
      'Static ports',
      'Windshield',
      'Landing lights',
      'Nose gear',
      'Tire condition',
      'Brake lines',
    ],
  },
  {
    id: 'left_wing',
    name: 'Ala Izquierda',
    items: [
      'Leading edge',
      'Navigation light',
      'Strobe light',
      'Fuel cap',
      'Flaps',
      'Aileron',
      'Engine cowling',
    ],
  },
  {
    id: 'right_wing',
    name: 'Ala Derecha',
    items: [
      'Leading edge',
      'Navigation light',
      'Strobe light',
      'Fuel cap',
      'Flaps',
      'Aileron',
      'Engine cowling',
    ],
  },
  {
    id: 'tail',
    name: 'Cola',
    items: [
      'Horizontal stabilizer',
      'Elevators',
      'Vertical stabilizer',
      'Rudder',
      'Beacon light',
      'APU exhaust',
    ],
  },
  {
    id: 'fuselage',
    name: 'Fuselaje',
    items: [
      'Doors secure',
      'Emergency exits',
      'Antennas',
      'Static wicks',
      'Service panels',
    ],
  },
] as const

export interface GPUReport {
  id: string
  user_id: string
  flight_id: string | null
  connection_time: string
  disconnection_time: string
  gpu_unit_number: string
  voltage_ok: boolean
  notes: string | null
  created_at: string
}

export const gpuReportSchema = z.object({
  connection_time: z.string(),
  disconnection_time: z.string(),
  gpu_unit_number: z.string().min(1),
  voltage_ok: z.boolean(),
  notes: z.string().optional(),
})

export type GPUReportFormData = z.infer<typeof gpuReportSchema>
