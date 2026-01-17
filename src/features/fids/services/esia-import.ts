'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'
import type { FlightStatus } from '@/shared/types'

// ESIA status mapping
const ESIA_STATUS_MAP: Record<string, FlightStatus> = {
  SCH: 'ON_TIME',      // Scheduled
  IBK: 'ON_TIME',      // In Block (arrived)
  OBK: 'BOARDING',     // Out Block (boarding/departed)
  DEP: 'DEPARTED',
  ARR: 'ARRIVED',
  CNL: 'CANCELED',
  DLY: 'DELAY',
}

// Airline codes mapping
const AIRLINE_MAP: Record<string, string> = {
  VOI: 'Volaris',
  AM: 'Aeromexico',
  Y4: 'Volaris',
  VB: 'VivaAerobus',
  UA: 'United',
  AA: 'American Airlines',
  DL: 'Delta',
}

interface ESIAArrival {
  flightNumber: string
  origin: string
  aircraft: string
  hall: string
  belt: string
  scheduledDate: string
  scheduledTime: string
  estimatedTime: string
  stand: string
  registration: string
  status: string
}

interface ESIADeparture {
  flightNumber: string
  destination: string
  aircraft: string
  gate: string
  scheduledDate: string
  scheduledTime: string
  estimatedTime: string
  counterFrom: string
  counterTo: string
  registration: string
  stand: string
  status: string
  terminal: string
}

interface ESIAData {
  timestamp: string
  airport: string
  totalArrivals: number
  totalDepartures: number
  arrivals: ESIAArrival[]
  departures: ESIADeparture[]
}

function parseESIADate(date: string, time: string): string {
  // Date format: "16/01/2026" Time format: "14:51"
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}T${time}:00`
}

function extractAirlineCode(flightNumber: string): string {
  // VOI 3121 -> VOI, AM0178 -> AM
  const match = flightNumber.match(/^([A-Z]+)\s?/)
  return match ? match[1] : 'UNK'
}

function getAirlineName(code: string): string {
  return AIRLINE_MAP[code] || code
}

function mapESIAStatus(status: string): FlightStatus {
  return ESIA_STATUS_MAP[status] || 'ON_TIME'
}

function calculateDelayMinutes(scheduled: string, estimated: string): number {
  if (!scheduled || !estimated) return 0

  const [schHour, schMin] = scheduled.split(':').map(Number)
  const [estHour, estMin] = estimated.split(':').map(Number)

  const schMinutes = schHour * 60 + schMin
  const estMinutes = estHour * 60 + estMin

  const diff = estMinutes - schMinutes
  return diff > 0 ? diff : 0
}

export async function importESIAData(
  data: ESIAData
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createServerSupabaseClient()
  const errors: string[] = []
  let imported = 0

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { imported: 0, errors: ['No autenticado'] }
  }

  // Process arrivals
  for (const arrival of data.arrivals) {
    try {
      const airlineCode = extractAirlineCode(arrival.flightNumber)
      const std = parseESIADate(arrival.scheduledDate, arrival.scheduledTime)
      const eta = arrival.estimatedTime ? parseESIADate(arrival.scheduledDate, arrival.estimatedTime) : null
      const delayMinutes = calculateDelayMinutes(arrival.scheduledTime, arrival.estimatedTime)

      const flightData = {
        flight_number: arrival.flightNumber.replace(/\s+/g, ''),
        airline: getAirlineName(airlineCode),
        origin: arrival.origin,
        destination: data.airport,
        std,
        sta: std,
        etd: null,
        eta,
        status: mapESIAStatus(arrival.status),
        gate: arrival.stand || null,
        aircraft_type: arrival.aircraft || null,
        aircraft_registration: arrival.registration || null,
        delay_minutes: delayMinutes,
        created_by: user.id,
        source: 'ESIA',
      }

      // Upsert by flight_number and scheduled date
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('flights') as any)
        .upsert(flightData, {
          onConflict: 'flight_number,std',
          ignoreDuplicates: false,
        })

      if (error) {
        errors.push(`Arrival ${arrival.flightNumber}: ${error.message}`)
      } else {
        imported++
      }
    } catch (e) {
      errors.push(`Arrival ${arrival.flightNumber}: ${e}`)
    }
  }

  // Process departures
  for (const departure of data.departures) {
    try {
      const airlineCode = extractAirlineCode(departure.flightNumber)
      const std = parseESIADate(departure.scheduledDate, departure.scheduledTime)
      const etd = departure.estimatedTime ? parseESIADate(departure.scheduledDate, departure.estimatedTime) : null
      const delayMinutes = calculateDelayMinutes(departure.scheduledTime, departure.estimatedTime)

      const flightData = {
        flight_number: departure.flightNumber.replace(/\s+/g, ''),
        airline: getAirlineName(airlineCode),
        origin: data.airport,
        destination: departure.destination,
        std,
        sta: std,
        etd,
        eta: null,
        status: mapESIAStatus(departure.status),
        gate: departure.gate || null,
        aircraft_type: departure.aircraft || null,
        aircraft_registration: departure.registration || null,
        delay_minutes: delayMinutes,
        created_by: user.id,
        source: 'ESIA',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('flights') as any)
        .upsert(flightData, {
          onConflict: 'flight_number,std',
          ignoreDuplicates: false,
        })

      if (error) {
        errors.push(`Departure ${departure.flightNumber}: ${error.message}`)
      } else {
        imported++
      }
    } catch (e) {
      errors.push(`Departure ${departure.flightNumber}: ${e}`)
    }
  }

  return { imported, errors }
}

// Export function to convert ESIA data to our Flight format (for preview)
export function convertESIAToFlights(data: ESIAData) {
  const arrivals = data.arrivals.map((arrival, index) => {
    const airlineCode = extractAirlineCode(arrival.flightNumber)
    const std = parseESIADate(arrival.scheduledDate, arrival.scheduledTime)
    const delayMinutes = calculateDelayMinutes(arrival.scheduledTime, arrival.estimatedTime)

    return {
      id: `arr-${index}`,
      flight_number: arrival.flightNumber.replace(/\s+/g, ''),
      airline: getAirlineName(airlineCode),
      origin: arrival.origin,
      destination: data.airport,
      std,
      sta: std,
      etd: null,
      eta: arrival.estimatedTime ? parseESIADate(arrival.scheduledDate, arrival.estimatedTime) : null,
      atd: null,
      ata: null,
      status: mapESIAStatus(arrival.status),
      gate: arrival.stand || null,
      aircraft_type: arrival.aircraft || null,
      aircraft_registration: arrival.registration || null,
      delay_minutes: delayMinutes,
      delay_reason: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    }
  })

  const departures = data.departures.map((departure, index) => {
    const airlineCode = extractAirlineCode(departure.flightNumber)
    const std = parseESIADate(departure.scheduledDate, departure.scheduledTime)
    const delayMinutes = calculateDelayMinutes(departure.scheduledTime, departure.estimatedTime)

    return {
      id: `dep-${index}`,
      flight_number: departure.flightNumber.replace(/\s+/g, ''),
      airline: getAirlineName(airlineCode),
      origin: data.airport,
      destination: departure.destination,
      std,
      sta: std,
      etd: departure.estimatedTime ? parseESIADate(departure.scheduledDate, departure.estimatedTime) : null,
      eta: null,
      atd: null,
      ata: null,
      status: mapESIAStatus(departure.status),
      gate: departure.gate || null,
      aircraft_type: departure.aircraft || null,
      aircraft_registration: departure.registration || null,
      delay_minutes: delayMinutes,
      delay_reason: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    }
  })

  return { arrivals, departures }
}
