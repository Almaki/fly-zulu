import { NextResponse } from 'next/server'

// ESIA credentials and config
const ESIA_URL = 'https://esia.serviciosgap.com.mx/esia8gmt/'
const CREDENTIALS = {
  usuario: 'VOI',
  clave: 'voi',
  aeropuerto: 'TIJ',
}

// Cache for storing scraped data
let cachedData: ESIAData | null = null
let lastFetchTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface ESIAArrival {
  flightNumber: string
  origin: string
  aircraft: string
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
  scheduledTime: string
  estimatedTime: string
  registration: string
  status: string
}

interface ESIAData {
  timestamp: string
  airport: string
  arrivals: ESIAArrival[]
  departures: ESIADeparture[]
}

// For now, return static data that was scraped
// In production, this would use Puppeteer/Playwright on a server
const SCRAPED_DATA: ESIAData = {
  timestamp: new Date().toISOString(),
  airport: 'TIJ',
  arrivals: [
    { flightNumber: 'VOI 3121', origin: 'PVR', aircraft: 'A321', scheduledTime: '14:51', estimatedTime: '15:18', stand: '07', registration: 'XA-VRC', status: 'IBK' },
    { flightNumber: 'VOI 3191', origin: 'MZT', aircraft: 'A20N', scheduledTime: '15:19', estimatedTime: '15:49', stand: '04', registration: 'XAVSG', status: 'IBK' },
    { flightNumber: 'VOI 3221', origin: 'PBC', aircraft: 'A20N', scheduledTime: '15:44', estimatedTime: '15:37', stand: '11', registration: 'XAVRT', status: 'IBK' },
    { flightNumber: 'VOI 3043', origin: 'BJX', aircraft: 'A20N', scheduledTime: '15:45', estimatedTime: '15:45', stand: '05', registration: 'XA-VSI', status: 'IBK' },
    { flightNumber: 'VOI 3257', origin: 'LMM', aircraft: 'A20N', scheduledTime: '15:57', estimatedTime: '15:44', stand: '08', registration: 'XAVSA', status: 'IBK' },
    { flightNumber: 'VOI 3061', origin: 'MLM', aircraft: 'A20N', scheduledTime: '16:09', estimatedTime: '16:06', stand: '06', registration: 'N532VL', status: 'IBK' },
    { flightNumber: 'VOI 3005', origin: 'CUL', aircraft: 'A21N', scheduledTime: '16:36', estimatedTime: '16:41', stand: '01', registration: 'XAVUO', status: 'IBK' },
    { flightNumber: 'VOI 3235', origin: 'LAP', aircraft: 'A20N', scheduledTime: '16:48', estimatedTime: '16:26', stand: '18', registration: 'XA-VSJ', status: 'IBK' },
    { flightNumber: 'VOI 3103', origin: 'SJD', aircraft: 'A21N', scheduledTime: '17:10', estimatedTime: '17:21', stand: '05', registration: 'XA-VSB', status: 'IBK' },
    { flightNumber: 'VOI 3081', origin: 'CUN', aircraft: 'A21N', scheduledTime: '17:12', estimatedTime: '17:18', stand: '08', registration: 'N537VL', status: 'IBK' },
    { flightNumber: 'VOI 3123', origin: 'PVR', aircraft: 'A21N', scheduledTime: '17:26', estimatedTime: '17:52', stand: '14', registration: 'XAVSK', status: 'IBK' },
    { flightNumber: 'VOI 3323', origin: 'TLC', aircraft: 'A320', scheduledTime: '18:05', estimatedTime: '18:07', stand: '09', registration: 'N522VL', status: 'IBK' },
    { flightNumber: 'VOI 1006', origin: 'GDL', aircraft: 'A321', scheduledTime: '18:17', estimatedTime: '18:06', stand: '22', registration: 'XA-VRB', status: 'IBK' },
    { flightNumber: 'VOI 3009', origin: 'CUL', aircraft: 'A321', scheduledTime: '19:26', estimatedTime: '19:04', stand: '14', registration: 'XA-VLH', status: 'IBK' },
    { flightNumber: 'VOI 3185', origin: 'HMO', aircraft: 'A20N', scheduledTime: '20:05', estimatedTime: '20:05', stand: '23', registration: 'XA-VSI', status: 'SCH' },
    { flightNumber: 'VOI 1008', origin: 'GDL', aircraft: 'A20N', scheduledTime: '20:07', estimatedTime: '20:07', stand: '13', registration: 'XA-VRX', status: 'SCH' },
    { flightNumber: 'VOI 3275', origin: 'UPN', aircraft: 'A20N', scheduledTime: '20:09', estimatedTime: '20:09', stand: '08', registration: 'XA-VRP', status: 'SCH' },
    { flightNumber: 'VOI 3085', origin: 'CUN', aircraft: 'A320', scheduledTime: '20:11', estimatedTime: '20:11', stand: '11', registration: 'XA-VOZ', status: 'SCH' },
    { flightNumber: 'VOI 3223', origin: 'PBC', aircraft: 'A320', scheduledTime: '20:16', estimatedTime: '20:16', stand: '10', registration: 'XA-TVE', status: 'SCH' },
    { flightNumber: 'VOI 184', origin: 'MEX', aircraft: 'A320', scheduledTime: '20:45', estimatedTime: '20:45', stand: '19', registration: 'N527VL', status: 'SCH' },
  ],
  departures: [
    { flightNumber: 'VOI 3376', destination: 'SLP', aircraft: 'A321', gate: '18', scheduledTime: '15:56', estimatedTime: '16:07', registration: 'XA-VRC', status: 'OBK' },
    { flightNumber: 'VOI 5611', destination: 'MTY', aircraft: 'A20N', gate: '5', scheduledTime: '16:34', estimatedTime: '16:34', registration: 'XAVSG', status: 'OBK' },
    { flightNumber: 'VOI 3060', destination: 'MLM', aircraft: 'A20N', gate: '12', scheduledTime: '17:02', estimatedTime: '16:47', registration: 'XAVRT', status: 'OBK' },
    { flightNumber: 'VOI 3184', destination: 'HMO', aircraft: 'A20N', gate: '3', scheduledTime: '16:37', estimatedTime: '16:41', registration: 'XA-VSI', status: 'OBK' },
    { flightNumber: 'VOI 3046', destination: 'BJX', aircraft: 'A20N', gate: '11', scheduledTime: '16:34', estimatedTime: '16:37', registration: 'XAVSA', status: 'OBK' },
    { flightNumber: 'VOI 3258', destination: 'LMM', aircraft: 'A20N', gate: '1', scheduledTime: '17:36', estimatedTime: '17:25', registration: 'N532VL', status: 'OBK' },
    { flightNumber: 'VOI 3296', destination: 'NLU', aircraft: 'A21N', gate: '9', scheduledTime: '17:26', estimatedTime: '17:29', registration: 'XAVUO', status: 'OBK' },
    { flightNumber: 'VOI 3282', destination: 'CJS', aircraft: 'A21N', gate: '3', scheduledTime: '18:05', estimatedTime: '18:00', registration: 'XA-VSB', status: 'OBK' },
    { flightNumber: 'VOI 3316', destination: 'CEN', aircraft: 'A21N', gate: '11', scheduledTime: '18:00', estimatedTime: '18:07', registration: 'N537VL', status: 'OBK' },
    { flightNumber: 'VOI 1011', destination: 'GDL', aircraft: 'A21N', gate: '19', scheduledTime: '18:11', estimatedTime: '18:46', registration: 'XAVSK', status: 'OBK' },
    { flightNumber: 'VOI 3324', destination: 'TLC', aircraft: 'A320', gate: '13', scheduledTime: '18:55', estimatedTime: '18:57', registration: 'N522VL', status: 'OBK' },
    { flightNumber: 'VOI 1017', destination: 'GDL', aircraft: 'A321', gate: '19', scheduledTime: '23:47', estimatedTime: '23:47', registration: 'XA-VLH', status: 'SCH' },
    { flightNumber: 'VOI 3040', destination: 'BJX', aircraft: 'A20N', gate: '20', scheduledTime: '00:57', estimatedTime: '00:57', registration: 'XA-VRX', status: 'SCH' },
    { flightNumber: 'VOI 185', destination: 'MEX', aircraft: 'A320', gate: '12', scheduledTime: '21:30', estimatedTime: '21:30', registration: 'XA-VOZ', status: 'SCH' },
    { flightNumber: 'VOI 3142', destination: 'OAX', aircraft: 'A320', gate: '14', scheduledTime: '23:59', estimatedTime: '23:59', registration: 'XA-TVE', status: 'SCH' },
  ],
}

export async function GET() {
  const now = Date.now()

  // Return cached data if still fresh
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      nextRefresh: new Date(lastFetchTime + CACHE_DURATION).toISOString(),
    })
  }

  // Update cache with fresh data
  // In production, this would actually scrape ESIA
  cachedData = {
    ...SCRAPED_DATA,
    timestamp: new Date().toISOString(),
  }
  lastFetchTime = now

  return NextResponse.json({
    ...cachedData,
    cached: false,
    nextRefresh: new Date(now + CACHE_DURATION).toISOString(),
  })
}
