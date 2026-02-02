'use server'

import type { MetarData, TafData, CurrentWeather, AircraftState } from '../types'
import { WMO_CODES } from '../types'

export async function getMetar(
  icao: string
): Promise<{ data: MetarData | null; error: string | null }> {
  try {
    const res = await fetch(
      `https://aviationweather.gov/api/data/metar?ids=${icao.toUpperCase()}&format=json`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return { data: null, error: `Error ${res.status} fetching METAR` }
    }

    const data = await res.json()

    if (!data || !Array.isArray(data) || data.length === 0) {
      return { data: null, error: `No METAR data for ${icao.toUpperCase()}` }
    }

    return { data: data[0] as MetarData, error: null }
  } catch {
    return { data: null, error: 'Error de conexion al obtener METAR' }
  }
}

export async function getTaf(
  icao: string
): Promise<{ data: TafData | null; error: string | null }> {
  try {
    const res = await fetch(
      `https://aviationweather.gov/api/data/taf?ids=${icao.toUpperCase()}&format=json`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return { data: null, error: `Error ${res.status} fetching TAF` }
    }

    const data = await res.json()

    if (!data || !Array.isArray(data) || data.length === 0) {
      return { data: null, error: `No TAF data for ${icao.toUpperCase()}` }
    }

    return { data: data[0] as TafData, error: null }
  } catch {
    return { data: null, error: 'Error de conexion al obtener TAF' }
  }
}

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<{ data: CurrentWeather | null; error: string | null }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`

    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })

    clearTimeout(timeout)

    if (!res.ok) {
      return { data: null, error: `Open-Meteo responded with ${res.status}` }
    }

    const json = await res.json()

    if (!json?.current) {
      return { data: null, error: 'Sin datos meteorologicos actuales' }
    }

    const c = json.current
    const weatherCode = c.weather_code ?? 0

    const weather: CurrentWeather = {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      weatherCode,
      weatherDesc: WMO_CODES[weatherCode] || `Codigo ${weatherCode}`,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      time: c.time || '',
    }

    return { data: weather, error: null }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'Timeout al consultar condiciones actuales' }
    }
    return { data: null, error: 'Error de conexion al obtener condiciones actuales' }
  }
}

export async function searchAircraft(
  callsign: string
): Promise<{ data: AircraftState[]; error: string | null }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const query = callsign.toUpperCase().trim()

    const res = await fetch(
      `https://api.adsb.lol/v2/callsign/${encodeURIComponent(query)}`,
      { cache: 'no-store', signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!res.ok) {
      return { data: [], error: `ADS-B responded with ${res.status}` }
    }

    const json = await res.json()

    if (!json?.ac || !Array.isArray(json.ac) || json.ac.length === 0) {
      return { data: [], error: `No se encontro "${query}" en aire` }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const matches: AircraftState[] = json.ac.map((a: any) => ({
      icao24: a.hex || '',
      callsign: (a.flight || '').trim(),
      registration: a.r || '',
      aircraftType: a.t || '',
      latitude: a.lat ?? null,
      longitude: a.lon ?? null,
      baroAltitude: a.alt_baro === 'ground' ? 0 : (a.alt_baro ?? null),
      geoAltitude: a.alt_geom ?? null,
      onGround: a.alt_baro === 'ground',
      groundSpeed: a.gs ?? null,
      trueTrack: a.track ?? null,
      verticalRate: a.baro_rate ?? null,
      squawk: a.squawk ?? null,
      lastSeen: a.seen ?? 0,
    }))
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return { data: matches.slice(0, 10), error: null }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: [], error: 'Timeout al consultar ADS-B' }
    }
    return { data: [], error: 'Error de conexion con ADS-B' }
  }
}
