// METAR data from aviationweather.gov API
export interface MetarData {
  icaoId: string
  rawOb: string
  reportTime: string
  temp: number | null
  dewp: number | null
  wdir: number | string | null // can be "VRB" for variable
  wspd: number | null
  wgst: number | null
  visib: string | number | null
  altim: number | null
  clouds: { cover: string; base: number | null }[]
  fltcat: string // VFR, MVFR, IFR, LIFR
  wxString: string | null
  name: string
  lat: number
  lon: number
  elev: number
}

// TAF forecast period
export interface TafForecast {
  timeFrom: number
  timeTo: number
  changeIndicator: string | null
  wdir: number | string | null
  wspd: number | null
  wgst: number | null
  visib: string | number | null
  clouds: { cover: string; base: number | null }[]
  wxString: string | null
}

// TAF data
export interface TafData {
  icaoId: string
  rawTAF: string
  issueTime: string
  validTimeFrom: number
  validTimeTo: number
  fcsts: TafForecast[]
  name: string
  lat: number
  lon: number
}

// Current weather from Open-Meteo API
export interface CurrentWeather {
  temperature: number
  humidity: number
  weatherCode: number
  weatherDesc: string
  cloudCover: number
  pressure: number
  windSpeed: number
  windDirection: number
  windGusts: number
  time: string
}

// WMO Weather interpretation codes
export const WMO_CODES: Record<number, string> = {
  0: 'Cielo despejado',
  1: 'Principalmente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada densa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada fuerte',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada fuerte',
  77: 'Granizo fino',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Nieve ligera',
  86: 'Nieve fuerte',
  95: 'Tormenta electrica',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo fuerte',
}

// ADS-B aircraft state
export interface AircraftState {
  icao24: string
  callsign: string
  registration: string
  aircraftType: string
  latitude: number | null
  longitude: number | null
  baroAltitude: number | null // feet
  geoAltitude: number | null // feet
  onGround: boolean
  groundSpeed: number | null // knots
  trueTrack: number | null // degrees
  verticalRate: number | null // ft/min
  squawk: string | null
  lastSeen: number // seconds ago
}

// Runway info for diagram
export interface RunwayInfo {
  label1: string
  label2: string
  heading: number // magnetic heading of label1 end
}

export interface AirportRunwayData {
  icao: string
  name: string
  runways: RunwayInfo[]
}

// Flight category colors
export const FLTCAT_COLORS: Record<string, string> = {
  VFR: '#22c55e',
  MVFR: '#3b82f6',
  IFR: '#ef4444',
  LIFR: '#f59e0b',
}

export const FLTCAT_BG: Record<string, string> = {
  VFR: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
  MVFR: 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30',
  IFR: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  LIFR: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30',
}

// Cloud cover abbreviations
export const CLOUD_COVER: Record<string, string> = {
  SKC: 'Sky Clear',
  CLR: 'Clear',
  FEW: 'Few (1-2 octas)',
  SCT: 'Scattered (3-4)',
  BKN: 'Broken (5-7)',
  OVC: 'Overcast (8)',
}
