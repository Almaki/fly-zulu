'use server'

import type { MetarData, TafData, SmnStation } from '../types'

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

// Haversine distance in km
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getSmnConditions(
  lat: number,
  lon: number
): Promise<{ data: SmnStation | null; error: string | null }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(
      'https://smn.conagua.gob.mx/tools/GUI/webservices/index.php?method=1',
      { cache: 'no-store', signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!res.ok) {
      return { data: null, error: `SMN responded with ${res.status}` }
    }

    const text = await res.text()

    // Try to parse as JSON - SMN sometimes returns non-standard JSON
    let stations: SmnStation[]
    try {
      stations = JSON.parse(text)
    } catch {
      return { data: null, error: 'Formato de respuesta SMN invalido' }
    }

    if (!Array.isArray(stations) || stations.length === 0) {
      return { data: null, error: 'Sin datos de estaciones SMN' }
    }

    // Find nearest station to the given lat/lon
    let nearest: SmnStation | null = null
    let minDist = Infinity

    for (const station of stations) {
      const sLat = parseFloat(station.lat)
      const sLon = parseFloat(station.lon)
      if (isNaN(sLat) || isNaN(sLon)) continue

      const dist = haversineDistance(lat, lon, sLat, sLon)
      if (dist < minDist) {
        minDist = dist
        nearest = station
      }
    }

    if (!nearest || minDist > 150) {
      return { data: null, error: 'No hay estacion SMN cercana' }
    }

    return { data: nearest, error: null }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'Timeout al consultar SMN' }
    }
    return { data: null, error: 'Error de conexion con SMN' }
  }
}
