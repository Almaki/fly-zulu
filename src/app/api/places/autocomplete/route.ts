import { NextRequest, NextResponse } from 'next/server'

// City coordinates for biasing results
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  TIJ: { lat: 32.5149, lng: -117.0382 },
  BJX: { lat: 21.0190, lng: -101.6866 },
  GDL: { lat: 20.6597, lng: -103.3496 },
  MTY: { lat: 25.6866, lng: -100.3161 },
  MEX: { lat: 19.4326, lng: -99.1332 },
  CUN: { lat: 21.1619, lng: -86.8515 },
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get('input')
  const ciudad = searchParams.get('ciudad')

  if (!input) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    // Return manual entry option if no API key
    return NextResponse.json({
      predictions: [{
        place_id: 'manual',
        description: input,
        structured_formatting: {
          main_text: input,
          secondary_text: 'Usar esta dirección'
        }
      }]
    })
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&language=es&components=country:mx|country:us`

    // Add location bias if city is specified
    if (ciudad && CITY_COORDS[ciudad]) {
      const coords = CITY_COORDS[ciudad]
      url += `&location=${coords.lat},${coords.lng}&radius=50000`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return NextResponse.json({
        predictions: data.predictions || []
      })
    }

    // If API error, return manual entry option
    return NextResponse.json({
      predictions: [{
        place_id: 'manual',
        description: input,
        structured_formatting: {
          main_text: input,
          secondary_text: 'Usar esta dirección'
        }
      }]
    })
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json({
      predictions: [{
        place_id: 'manual',
        description: input,
        structured_formatting: {
          main_text: input,
          secondary_text: 'Usar esta dirección'
        }
      }]
    })
  }
}
