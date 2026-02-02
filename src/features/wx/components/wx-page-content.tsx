'use client'

import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, Wind, Eye, Thermometer, Gauge, CloudSun,
  Droplets, ExternalLink, Plane, ArrowUp, ArrowDown, Minus,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { getMetar, getTaf, getCurrentWeather, searchAircraft } from '../services'
import { resolveIcao } from '../data/airports'
import { AIRPORT_RUNWAYS } from '../data/airports'
import { AirportDiagram } from './airport-diagram'
import type { MetarData, TafData, CurrentWeather, AircraftState } from '../types'
import { FLTCAT_COLORS, FLTCAT_BG, CLOUD_COVER } from '../types'

function ZuluClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s}Z`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 py-1.5">
      <span className="text-[10px] text-[#71717a] uppercase">Zulu</span>
      <span className="font-mono text-sm font-bold text-[#00ff88]">{time}</span>
    </div>
  )
}

export function WxPageContent() {
  const [tab, setTab] = useState<'wx' | 'adsb'>('wx')

  // === WX state ===
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [metar, setMetar] = useState<MetarData | null>(null)
  const [taf, setTaf] = useState<TafData | null>(null)
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // === ADS-B state ===
  const [adsbInput, setAdsbInput] = useState('')
  const [adsbLoading, setAdsbLoading] = useState(false)
  const [aircraft, setAircraft] = useState<AircraftState[]>([])
  const [adsbError, setAdsbError] = useState<string | null>(null)

  const handleSearch = async () => {
    const code = input.trim()
    if (!code) return

    const icao = resolveIcao(code)
    setLoading(true)
    setError(null)
    setWeather(null)
    setWeatherError(null)

    const [metarResult, tafResult] = await Promise.all([
      getMetar(icao),
      getTaf(icao),
    ])

    if (metarResult.error && tafResult.error) {
      setError(metarResult.error)
      setMetar(null)
      setTaf(null)
      setLoading(false)
      return
    }

    setMetar(metarResult.data)
    setTaf(tafResult.data)

    if (metarResult.data?.lat && metarResult.data?.lon) {
      const wxResult = await getCurrentWeather(metarResult.data.lat, metarResult.data.lon)
      if (wxResult.data) {
        setWeather(wxResult.data)
      } else {
        setWeatherError(wxResult.error)
      }
    }

    setLoading(false)
  }

  const handleAdsbSearch = async () => {
    const query = adsbInput.trim()
    if (!query) return

    setAdsbLoading(true)
    setAdsbError(null)
    setAircraft([])

    const result = await searchAircraft(query)

    if (result.error) {
      setAdsbError(result.error)
    }
    setAircraft(result.data)
    setAdsbLoading(false)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000)
    return d.toUTCString().slice(17, 22) + 'Z'
  }

  return (
    <div className="space-y-4">
      {/* Zulu Clock */}
      <ZuluClock />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#141414] rounded-lg border border-[#27272a]">
        <button
          onClick={() => setTab('wx')}
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-medium transition-colors',
            tab === 'wx'
              ? 'bg-[#0066CC] text-white'
              : 'text-[#71717a] hover:text-[#a1a1aa]'
          )}
        >
          METAR / TAF
        </button>
        <button
          onClick={() => setTab('adsb')}
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
            tab === 'adsb'
              ? 'bg-[#0066CC] text-white'
              : 'text-[#71717a] hover:text-[#a1a1aa]'
          )}
        >
          <Plane className="w-3.5 h-3.5" /> ADS-B
        </button>
      </div>

      {/* === WX TAB === */}
      {tab === 'wx' && (
        <>
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="MMTJ, MMMX, TIJ, MEX..."
                maxLength={4}
                className="pl-9 bg-[#141414] border-[#27272a] uppercase font-mono text-center"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !input.trim()}
              className="bg-[#0066CC] hover:bg-[#0066CC]/90 text-white px-6"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-1.5">
            {['MMTJ', 'MMMX', 'MMMY', 'MMGL', 'MMLO', 'MMUN'].map(code => (
              <button
                key={code}
                onClick={() => { setInput(code); }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#141414] border border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa] transition-colors"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Results */}
          {metar && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#fafafa]">{metar.icaoId}</h2>
                <p className="text-xs text-[#71717a]">
                  {AIRPORT_RUNWAYS[metar.icaoId]?.name || metar.name}
                </p>
              </div>

              <AirportDiagram metar={metar} />

              {/* METAR Raw */}
              <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                <h3 className="text-xs font-bold text-[#71717a] mb-2">METAR</h3>
                <p className="font-mono text-xs text-[#22c55e] break-all leading-relaxed">
                  {metar.rawOb}
                </p>
              </div>

              {/* Parsed METAR data */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] mb-1">
                    <Wind className="w-3 h-3" /> Viento
                  </div>
                  <p className="text-sm font-mono text-[#fafafa]">
                    {metar.wdir === 'VRB' ? 'VRB' : `${String(metar.wdir || 0).padStart(3, '0')}°`}
                    {' '}{metar.wspd || 0}kt
                    {metar.wgst ? ` G${metar.wgst}kt` : ''}
                  </p>
                </div>

                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] mb-1">
                    <Eye className="w-3 h-3" /> Visibilidad
                  </div>
                  <p className="text-sm font-mono text-[#fafafa]">
                    {metar.visib || 'N/A'} SM
                  </p>
                </div>

                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] mb-1">
                    <Thermometer className="w-3 h-3" /> Temp / Dew
                  </div>
                  <p className="text-sm font-mono text-[#fafafa]">
                    {metar.temp !== null ? `${metar.temp}°C` : 'N/A'}
                    {' / '}
                    {metar.dewp !== null ? `${metar.dewp}°C` : 'N/A'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] mb-1">
                    <Gauge className="w-3 h-3" /> Altimetro
                  </div>
                  <p className="text-sm font-mono text-[#fafafa]">
                    {metar.altim ? `${metar.altim.toFixed(2)} inHg` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Clouds */}
              {metar.clouds && metar.clouds.length > 0 && (
                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#71717a] mb-2">
                    <CloudSun className="w-3 h-3" /> Nubes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metar.clouds.map((cloud, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg text-xs font-mono bg-[#27272a] text-[#a1a1aa]">
                        {cloud.cover} {cloud.base ? `${cloud.base}ft` : ''}
                        <span className="text-[#52525b] ml-1 text-[10px]">
                          {CLOUD_COVER[cloud.cover] || ''}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather phenomena */}
              {metar.wxString && (
                <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-3">
                  <p className="text-xs font-mono text-[#f59e0b]">WX: {metar.wxString}</p>
                </div>
              )}

              {/* Flight Category */}
              <div className={cn(
                'rounded-xl border p-3 text-center',
                FLTCAT_BG[metar.fltcat] || 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
              )}>
                <p className="text-lg font-bold">{metar.fltcat}</p>
                <p className="text-xs opacity-70">
                  {metar.fltcat === 'VFR' && 'Visual Flight Rules'}
                  {metar.fltcat === 'MVFR' && 'Marginal VFR'}
                  {metar.fltcat === 'IFR' && 'Instrument Flight Rules'}
                  {metar.fltcat === 'LIFR' && 'Low IFR'}
                </p>
              </div>

              {/* TAF */}
              {taf && (
                <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                  <h3 className="text-xs font-bold text-[#71717a] mb-2">TAF</h3>
                  <p className="font-mono text-xs text-[#3b82f6] break-all leading-relaxed">
                    {taf.rawTAF}
                  </p>

                  {taf.fcsts && taf.fcsts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-[10px] text-[#52525b] uppercase">Periodos</h4>
                      {taf.fcsts.map((fcst, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-[#71717a] whitespace-nowrap">
                            {formatTime(fcst.timeFrom)}-{formatTime(fcst.timeTo)}
                          </span>
                          {fcst.changeIndicator && (
                            <span className="text-[#f59e0b]">{fcst.changeIndicator}</span>
                          )}
                          <span className="text-[#a1a1aa]">
                            {fcst.wdir !== null ? `${fcst.wdir}°` : ''}{fcst.wspd ? `${fcst.wspd}kt` : ''}
                            {fcst.wgst ? ` G${fcst.wgst}` : ''}
                          </span>
                          <span className="text-[#a1a1aa]">
                            Vis:{fcst.visib || '?'}
                          </span>
                          {fcst.wxString && (
                            <span className="text-[#f59e0b]">{fcst.wxString}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Weather Section */}
              <div className="rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#06b6d4] flex items-center gap-1.5">
                    <CloudSun className="w-3.5 h-3.5" />
                    Condiciones Actuales
                  </h3>
                  <a
                    href="https://smn.conagua.gob.mx/es/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#06b6d4] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> smn.conagua.gob.mx
                  </a>
                </div>

                {weather ? (
                  <div className="space-y-2">
                    <p className="text-xs text-[#fafafa] font-medium">
                      {weather.weatherDesc}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Thermometer className="w-3 h-3 text-[#ef4444]" />
                        <span className="text-[#71717a]">Temp:</span>
                        <span className="text-[#fafafa] font-mono">{weather.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Droplets className="w-3 h-3 text-[#3b82f6]" />
                        <span className="text-[#71717a]">Hum:</span>
                        <span className="text-[#fafafa] font-mono">{weather.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Wind className="w-3 h-3 text-[#22c55e]" />
                        <span className="text-[#71717a]">Viento:</span>
                        <span className="text-[#fafafa] font-mono">{weather.windDirection}° {weather.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Gauge className="w-3 h-3 text-[#f59e0b]" />
                        <span className="text-[#71717a]">Presion:</span>
                        <span className="text-[#fafafa] font-mono">{weather.pressure} hPa</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <CloudSun className="w-3 h-3 text-[#06b6d4]" />
                      <span className="text-[#71717a]">Nubosidad:</span>
                      <span className="text-[#fafafa]">{weather.cloudCover}%</span>
                    </div>
                    {weather.windGusts > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Wind className="w-3 h-3 text-[#f59e0b]" />
                        <span className="text-[#71717a]">Rachas:</span>
                        <span className="text-[#fafafa] font-mono">{weather.windGusts} km/h</span>
                      </div>
                    )}
                    {weather.time && (
                      <p className="text-[10px] text-[#52525b]">
                        Actualizado: {weather.time}
                      </p>
                    )}
                  </div>
                ) : weatherError ? (
                  <p className="text-xs text-[#52525b]">{weatherError}</p>
                ) : (
                  <p className="text-xs text-[#52525b]">Cargando condiciones actuales...</p>
                )}
              </div>

              {/* Legend */}
              <div className="rounded-xl border border-[#27272a] bg-[#141414] p-3">
                <h3 className="text-[10px] text-[#52525b] uppercase mb-2">Categorias de Vuelo</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(FLTCAT_COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-2 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[#a1a1aa] font-mono">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Initial state */}
          {!metar && !loading && !error && (
            <div className="text-center py-12 border border-dashed border-[#27272a] rounded-xl">
              <CloudSun className="w-10 h-10 text-[#52525b] mx-auto" />
              <p className="text-sm text-[#71717a] mt-3">
                Ingresa un codigo ICAO o IATA
              </p>
              <p className="text-xs text-[#52525b] mt-1">
                Ej: MMTJ, MMMX, TIJ, MEX
              </p>
            </div>
          )}
        </>
      )}

      {/* === ADS-B TAB === */}
      {tab === 'adsb' && (
        <>
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <Input
                value={adsbInput}
                onChange={(e) => setAdsbInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAdsbSearch()}
                placeholder="VOI123, AMX001, UAL..."
                className="pl-9 bg-[#141414] border-[#27272a] uppercase font-mono text-center"
              />
            </div>
            <Button
              onClick={handleAdsbSearch}
              disabled={adsbLoading || !adsbInput.trim()}
              className="bg-[#0066CC] hover:bg-[#0066CC]/90 text-white px-6"
            >
              {adsbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>

          {/* Quick airline prefixes */}
          <div className="flex flex-wrap gap-1.5">
            {['VOI', 'AMX', 'VIV', 'MAG', 'SWA', 'UAL', 'AAL', 'DAL'].map(code => (
              <button
                key={code}
                onClick={() => { setAdsbInput(code); }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#141414] border border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#fafafa] transition-colors"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Error */}
          {adsbError && (
            <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-sm text-[#ef4444]">
              {adsbError}
            </div>
          )}

          {/* Aircraft Results */}
          {aircraft.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-[#52525b]">{aircraft.length} aeronave(s) encontrada(s)</p>
              {aircraft.map((ac, i) => (
                <div key={i} className="rounded-xl border border-[#27272a] bg-[#141414] p-3 space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#0066CC]" />
                      <span className="font-mono font-bold text-[#fafafa]">{ac.callsign}</span>
                      {ac.registration && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] font-mono">
                          {ac.registration}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      ac.onGround
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                        : 'bg-[#22c55e]/20 text-[#22c55e]'
                    )}>
                      {ac.onGround ? 'En tierra' : 'En vuelo'}
                    </span>
                  </div>

                  {/* Aircraft type */}
                  {ac.aircraftType && (
                    <p className="text-[10px] text-[#71717a]">Tipo: {ac.aircraftType}</p>
                  )}

                  {/* Data grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Altitude */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="text-[#71717a]">
                        {ac.verticalRate && ac.verticalRate > 100 ? (
                          <ArrowUp className="w-3 h-3 text-[#22c55e]" />
                        ) : ac.verticalRate && ac.verticalRate < -100 ? (
                          <ArrowDown className="w-3 h-3 text-[#ef4444]" />
                        ) : (
                          <Minus className="w-3 h-3 text-[#71717a]" />
                        )}
                      </div>
                      <span className="text-[#71717a]">Alt:</span>
                      <span className="text-[#fafafa] font-mono">
                        {ac.baroAltitude !== null ? `${Math.round(ac.baroAltitude)} ft` : 'N/A'}
                      </span>
                    </div>

                    {/* Ground Speed */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Wind className="w-3 h-3 text-[#71717a]" />
                      <span className="text-[#71717a]">GS:</span>
                      <span className="text-[#fafafa] font-mono">
                        {ac.groundSpeed !== null ? `${Math.round(ac.groundSpeed)} kt` : 'N/A'}
                      </span>
                    </div>

                    {/* Track */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Plane className="w-3 h-3 text-[#71717a]" style={{
                        transform: `rotate(${ac.trueTrack || 0}deg)`
                      }} />
                      <span className="text-[#71717a]">HDG:</span>
                      <span className="text-[#fafafa] font-mono">
                        {ac.trueTrack !== null ? `${Math.round(ac.trueTrack)}°` : 'N/A'}
                      </span>
                    </div>

                    {/* Vertical Rate */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {ac.verticalRate && ac.verticalRate > 100 ? (
                        <ArrowUp className="w-3 h-3 text-[#22c55e]" />
                      ) : ac.verticalRate && ac.verticalRate < -100 ? (
                        <ArrowDown className="w-3 h-3 text-[#ef4444]" />
                      ) : (
                        <Minus className="w-3 h-3 text-[#71717a]" />
                      )}
                      <span className="text-[#71717a]">VS:</span>
                      <span className="text-[#fafafa] font-mono">
                        {ac.verticalRate !== null ? `${Math.round(ac.verticalRate)} fpm` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Squawk + Position */}
                  <div className="flex items-center justify-between text-[10px]">
                    {ac.squawk && (
                      <span className={cn(
                        'font-mono px-1.5 py-0.5 rounded',
                        ac.squawk === '7700' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        ac.squawk === '7600' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        ac.squawk === '7500' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        'bg-[#27272a] text-[#71717a]'
                      )}>
                        SQ {ac.squawk}
                      </span>
                    )}
                    {ac.latitude && ac.longitude && (
                      <span className="text-[#52525b] font-mono">
                        {ac.latitude.toFixed(2)}N {Math.abs(ac.longitude).toFixed(2)}{ac.longitude < 0 ? 'W' : 'E'}
                      </span>
                    )}
                    <span className="text-[#52525b]">
                      {ac.lastSeen < 5 ? 'Live' : `${Math.round(ac.lastSeen)}s ago`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Initial state */}
          {aircraft.length === 0 && !adsbLoading && !adsbError && (
            <div className="text-center py-12 border border-dashed border-[#27272a] rounded-xl">
              <Plane className="w-10 h-10 text-[#52525b] mx-auto" />
              <p className="text-sm text-[#71717a] mt-3">
                Busca por callsign / numero de vuelo
              </p>
              <p className="text-xs text-[#52525b] mt-1">
                Ej: VOI123, AMX001, UAL1234
              </p>
              <p className="text-[10px] text-[#3f3f46] mt-3">
                Datos ADS-B en tiempo real via adsb.lol
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
