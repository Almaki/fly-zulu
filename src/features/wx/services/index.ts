'use server'

import type { MetarData, TafData, CurrentWeather } from '../types'
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
