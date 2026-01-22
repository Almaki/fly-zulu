import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ error: 'place_id required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ lat: 0, lng: 0 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.result?.geometry?.location) {
      return NextResponse.json({
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng
      })
    }

    return NextResponse.json({ lat: 0, lng: 0 })
  } catch (error) {
    console.error('Place details API error:', error)
    return NextResponse.json({ lat: 0, lng: 0 })
  }
}
