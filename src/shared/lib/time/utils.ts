import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { addDays, format } from 'date-fns'

// Airport timezones mapping
export const AIRPORT_TIMEZONES: Record<string, string> = {
  // ===== MEXICO =====
  // Central Time
  MEX: 'America/Mexico_City',
  GDL: 'America/Mexico_City',
  PVR: 'America/Mexico_City',
  MID: 'America/Mexico_City',
  MTY: 'America/Mexico_City',
  BJX: 'America/Mexico_City',
  CUU: 'America/Mexico_City',
  VER: 'America/Mexico_City',
  OAX: 'America/Mexico_City',
  ZCL: 'America/Mexico_City',
  SLP: 'America/Mexico_City',
  AGU: 'America/Mexico_City',
  TAM: 'America/Mexico_City',
  CME: 'America/Mexico_City',
  QRO: 'America/Mexico_City',
  PBC: 'America/Mexico_City',
  ZIH: 'America/Mexico_City',
  ACA: 'America/Mexico_City',
  VSA: 'America/Mexico_City',
  TGZ: 'America/Mexico_City',
  TLC: 'America/Mexico_City',
  MLM: 'America/Mexico_City',
  // Cancun Time (no DST)
  CUN: 'America/Cancun',
  CZM: 'America/Cancun',
  // Pacific Time (Baja California)
  TIJ: 'America/Tijuana',
  MXL: 'America/Tijuana',
  // Mountain Time (no DST - Sonora)
  HMO: 'America/Hermosillo',
  SJD: 'America/Hermosillo',
  LAP: 'America/Hermosillo',
  CUL: 'America/Hermosillo',
  MZT: 'America/Hermosillo',

  // ===== USA =====
  // Pacific Time
  LAX: 'America/Los_Angeles',
  SFO: 'America/Los_Angeles',
  SAN: 'America/Los_Angeles',
  SJC: 'America/Los_Angeles',
  OAK: 'America/Los_Angeles',
  PDX: 'America/Los_Angeles',
  SEA: 'America/Los_Angeles',
  LAS: 'America/Los_Angeles',
  // Mountain Time
  PHX: 'America/Phoenix', // Arizona no DST
  DEN: 'America/Denver',
  SLC: 'America/Denver',
  ABQ: 'America/Denver',
  // Central Time
  DFW: 'America/Chicago',
  IAH: 'America/Chicago',
  ORD: 'America/Chicago',
  MSP: 'America/Chicago',
  STL: 'America/Chicago',
  MCI: 'America/Chicago',
  SAT: 'America/Chicago',
  AUS: 'America/Chicago',
  MSY: 'America/Chicago',
  // Eastern Time
  MIA: 'America/New_York',
  FLL: 'America/New_York',
  MCO: 'America/New_York',
  TPA: 'America/New_York',
  ATL: 'America/New_York',
  CLT: 'America/New_York',
  DCA: 'America/New_York',
  IAD: 'America/New_York',
  BWI: 'America/New_York',
  PHL: 'America/New_York',
  EWR: 'America/New_York',
  JFK: 'America/New_York',
  LGA: 'America/New_York',
  BOS: 'America/New_York',
  DTW: 'America/New_York',

  // ===== GUATEMALA =====
  GUA: 'America/Guatemala',

  // ===== EL SALVADOR =====
  SAL: 'America/El_Salvador',

  // ===== COSTA RICA =====
  SJO: 'America/Costa_Rica',
  LIR: 'America/Costa_Rica',

  // ===== HONDURAS =====
  TGU: 'America/Tegucigalpa',
  SAP: 'America/Tegucigalpa',
  RTB: 'America/Tegucigalpa',

  // ===== NICARAGUA =====
  MGA: 'America/Managua',

  // ===== PANAMA =====
  PTY: 'America/Panama',

  // ===== BELIZE =====
  BZE: 'America/Belize',

  // ===== COLOMBIA =====
  BOG: 'America/Bogota',
  MDE: 'America/Bogota',
  CLO: 'America/Bogota',
  CTG: 'America/Bogota',

  // ===== CUBA =====
  HAV: 'America/Havana',
}

/**
 * Convert HH:MM string to total minutes
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Convert total minutes to HH:MM string
 */
export function minutesToTime(minutes: number): string {
  // Handle negative or overflow
  while (minutes < 0) minutes += 24 * 60
  while (minutes >= 24 * 60) minutes -= 24 * 60

  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Calculate minutes between two times, handling midnight crossing
 * Assumes endTime is AFTER startTime (may be next day)
 */
export function calculateMinutesBetween(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  let diff = endMinutes - startMinutes

  // If negative, crossed midnight - add 24 hours
  if (diff < 0) {
    diff += 24 * 60
  }

  return diff
}

/**
 * Calculate duty end time (IN + 30 minutes)
 */
export function calculateDutyEnd(inTime: string): string {
  const inMinutes = timeToMinutes(inTime)
  return minutesToTime(inMinutes + 30)
}

/**
 * Determine duty status based on elapsed minutes
 */
export type DutyStatus = 'inactive' | 'active' | 'warning' | 'critical' | 'completed'

export function getDutyStatus(elapsedMinutes: number): DutyStatus {
  const CRITICAL_THRESHOLD = 14 * 60 // 14 hours
  const WARNING_THRESHOLD = 12 * 60 // 12 hours

  if (elapsedMinutes >= CRITICAL_THRESHOLD) return 'critical'
  if (elapsedMinutes >= WARNING_THRESHOLD) return 'warning'
  return 'active'
}

/**
 * Get color for duty status
 */
export function getDutyStatusColor(status: DutyStatus): string {
  switch (status) {
    case 'critical':
      return '#FF3B30' // Red
    case 'warning':
      return '#FF9500' // Amber
    case 'active':
      return '#00ff88' // Green
    case 'completed':
      return '#71717a' // Gray
    default:
      return '#71717a'
  }
}

/**
 * Auto-detect if a time belongs to the previous day
 * Based on duty start time and current context
 *
 * Logic: If user enters a time significantly less than duty start,
 * and duty start is late in the day (after 18:00), assume next day
 */
export function detectTimeDate(
  time: string,
  dutyStart: string,
  referenceDate: string
): { date: string; isNextDay: boolean } {
  const timeMinutes = timeToMinutes(time)
  const dutyStartMinutes = timeToMinutes(dutyStart)

  // If duty starts after 18:00 (6 PM) and entered time is before 12:00 (noon)
  // it's likely the next day
  const isLateStart = dutyStartMinutes >= 18 * 60
  const isEarlyTime = timeMinutes < 12 * 60
  const isNextDay = isLateStart && isEarlyTime && timeMinutes < dutyStartMinutes

  if (isNextDay) {
    const nextDay = addDays(new Date(referenceDate), 1)
    return {
      date: format(nextDay, 'yyyy-MM-dd'),
      isNextDay: true,
    }
  }

  return {
    date: referenceDate,
    isNextDay: false,
  }
}

/**
 * Validate that flight times are in logical order
 * OUT < OFF < ON < IN (considering overnight)
 */
export function validateFlightTimes(
  outTime: string,
  offTime: string,
  onTime: string,
  inTime: string
): { valid: boolean; error?: string } {
  const out = timeToMinutes(outTime)
  const off = timeToMinutes(offTime)
  const on = timeToMinutes(onTime)
  const inT = timeToMinutes(inTime)

  // Calculate differences (handling overnight)
  const outToOff = calculateMinutesBetween(outTime, offTime)
  const offToOn = calculateMinutesBetween(offTime, onTime)
  const onToIn = calculateMinutesBetween(onTime, inTime)

  // Each phase should be positive and reasonable
  // OUT to OFF: typically 5-60 minutes (taxi out)
  if (outToOff < 1) {
    return { valid: false, error: 'OFF debe ser después de OUT' }
  }
  if (outToOff > 120) {
    return { valid: false, error: 'Tiempo de taxi muy largo (>2h)' }
  }

  // OFF to ON: flight time, typically 30 min to 8 hours
  if (offToOn < 15) {
    return { valid: false, error: 'Tiempo de vuelo muy corto (<15min)' }
  }
  if (offToOn > 12 * 60) {
    return { valid: false, error: 'Tiempo de vuelo muy largo (>12h)' }
  }

  // ON to IN: typically 5-30 minutes (taxi in)
  if (onToIn < 1) {
    return { valid: false, error: 'IN debe ser después de ON' }
  }
  if (onToIn > 60) {
    return { valid: false, error: 'Tiempo de taxi muy largo (>1h)' }
  }

  return { valid: true }
}

/**
 * Get current ZULU time
 */
export function getCurrentZuluTime(): string {
  return formatInTimeZone(new Date(), 'UTC', 'HH:mm:ss')
}

/**
 * Get current ZULU date
 */
export function getCurrentZuluDate(): string {
  return formatInTimeZone(new Date(), 'UTC', 'yyyy-MM-dd')
}

/**
 * Get local time for an airport
 */
export function getAirportLocalTime(airportCode: string): {
  time: string
  offset: string
  timezone: string
} {
  const timezone = AIRPORT_TIMEZONES[airportCode.toUpperCase()] || 'America/Mexico_City'
  const now = new Date()
  const zonedTime = toZonedTime(now, timezone)

  // Calculate offset from UTC
  const utcTime = new Date(now.toISOString())
  const localTime = new Date(formatInTimeZone(now, timezone, "yyyy-MM-dd'T'HH:mm:ss"))
  const diffMs = localTime.getTime() - utcTime.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const offsetStr = diffHours >= 0 ? `+${diffHours}:00` : `${diffHours}:00`

  return {
    time: formatInTimeZone(now, timezone, 'HH:mm:ss'),
    offset: offsetStr,
    timezone,
  }
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

/**
 * Format duration as HH:MM
 */
export function formatDurationHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Suggest itinerary time based on duty start
 * Returns estimated block time (1 hour after duty start typically)
 */
export function suggestItineraryTime(dutyStart: string): string {
  const dutyMinutes = timeToMinutes(dutyStart)
  return minutesToTime(dutyMinutes + 60) // 1 hour after duty start
}
