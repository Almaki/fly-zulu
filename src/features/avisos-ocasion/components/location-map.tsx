'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface LocationMapProps {
  lat: number
  lng: number
  address?: string
  className?: string
  height?: number
}

export function LocationMap({ lat, lng, address, className, height = 200 }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Check if coordinates are valid
  const hasValidCoords = lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)

  useEffect(() => {
    if (!hasValidCoords || !mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // If no API key, show a static map link instead
    if (!apiKey) {
      setError(true)
      return
    }

    // Load Google Maps script if not already loaded
    if (!window.google?.maps) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => initMap()
      script.onerror = () => setError(true)
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      if (!mapRef.current || !window.google?.maps) return

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            // Dark mode style
            { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          ]
        })

        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        })

        setMapLoaded(true)
      } catch (err) {
        console.error('Map init error:', err)
        setError(true)
      }
    }
  }, [lat, lng, hasValidCoords])

  // No valid coordinates
  if (!hasValidCoords) {
    return null
  }

  // Google Maps link for opening in external app
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  // Fallback: show a static image or link if no API key
  if (error) {
    return (
      <div className={cn('rounded-lg overflow-hidden border border-[#27272a]', className)}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative"
          style={{ height }}
        >
          {/* Static map image from Google */}
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x${height}&markers=color:green%7C${lat},${lng}&style=feature:all|element:geometry|color:0x1a1a1a&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`}
            alt="Ubicación en mapa"
            className="w-full h-full object-cover"
            onError={(e) => {
              // If static map also fails, show a placeholder
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-[#141414]/80 flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-[#22c55e]" />
            <p className="text-sm text-[#a1a1aa]">Ver ubicación en Google Maps</p>
            <ExternalLink className="w-4 h-4 text-[#71717a]" />
          </div>
        </a>
        {address && (
          <div className="p-2 bg-[#141414] border-t border-[#27272a]">
            <p className="text-xs text-[#a1a1aa] truncate">{address}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg overflow-hidden border border-[#27272a]', className)}>
      <div ref={mapRef} style={{ height }} className="w-full bg-[#1a1a1a]" />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-[#141414] border-t border-[#27272a] hover:bg-[#1a1a1a] transition-colors"
      >
        <MapPin className="w-4 h-4 text-[#22c55e]" />
        <p className="text-xs text-[#a1a1aa] truncate flex-1">
          {address || 'Ver en Google Maps'}
        </p>
        <ExternalLink className="w-3 h-3 text-[#71717a]" />
      </a>
    </div>
  )
}

// Add Google Maps types
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: object) => object
        Marker: new (options: object) => object
        SymbolPath: {
          CIRCLE: number
        }
      }
    }
  }
}
