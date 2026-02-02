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

// SMN (conagua) current conditions
export interface SmnStation {
  nmun: string
  nent: string
  lat: string
  lon: string
  tempc: string
  velvien: string
  dirvien: string
  pression: string
  cc: string
  hr: string
  dtefecha: string
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
