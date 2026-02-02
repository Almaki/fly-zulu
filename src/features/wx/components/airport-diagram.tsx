'use client'

import type { MetarData, RunwayInfo } from '../types'
import { FLTCAT_COLORS } from '../types'
import { AIRPORT_RUNWAYS } from '../data/airports'

interface AirportDiagramProps {
  metar: MetarData
}

const CX = 150
const CY = 150
const RWY_LEN = 100
const WIND_OUTER = 130
const WIND_INNER = 55

function headingToXY(heading: number, radius: number) {
  const rad = (heading * Math.PI) / 180
  return {
    x: CX + radius * Math.sin(rad),
    y: CY - radius * Math.cos(rad),
  }
}

function RunwayLine({ runway, index, total }: { runway: RunwayInfo; index: number; total: number }) {
  // Offset parallel runways slightly
  const offset = total > 1 ? (index - (total - 1) / 2) * 8 : 0
  const perpRad = ((runway.heading + 90) * Math.PI) / 180
  const dx = offset * Math.sin(perpRad)
  const dy = -offset * Math.cos(perpRad)

  const end1 = headingToXY(runway.heading, RWY_LEN)
  const end2 = headingToXY(runway.heading + 180, RWY_LEN)
  const lbl1 = headingToXY(runway.heading, RWY_LEN + 16)
  const lbl2 = headingToXY(runway.heading + 180, RWY_LEN + 16)

  return (
    <g>
      {/* Runway line */}
      <line
        x1={end1.x + dx} y1={end1.y + dy}
        x2={end2.x + dx} y2={end2.y + dy}
        stroke="#52525b" strokeWidth="6" strokeLinecap="round"
      />
      {/* Center line dashes */}
      <line
        x1={end1.x + dx} y1={end1.y + dy}
        x2={end2.x + dx} y2={end2.y + dy}
        stroke="#a1a1aa" strokeWidth="1"
        strokeDasharray="6 4"
      />
      {/* Labels */}
      <text
        x={lbl1.x + dx} y={lbl1.y + dy}
        textAnchor="middle" dominantBaseline="central"
        fill="#fafafa" fontSize="11" fontWeight="bold" fontFamily="monospace"
      >
        {runway.label1}
      </text>
      <text
        x={lbl2.x + dx} y={lbl2.y + dy}
        textAnchor="middle" dominantBaseline="central"
        fill="#fafafa" fontSize="11" fontWeight="bold" fontFamily="monospace"
      >
        {runway.label2}
      </text>
    </g>
  )
}

function WindArrow({ wdir, wspd }: { wdir: number; wspd: number }) {
  // Arrow from outer edge toward center (wind comes FROM this direction)
  const tip = headingToXY(wdir, WIND_INNER)
  const tail = headingToXY(wdir, WIND_OUTER)

  // Arrowhead
  const headSize = 10
  const headAngle = 25
  const headRad = (wdir * Math.PI) / 180
  const left = {
    x: tip.x + headSize * Math.sin(headRad + (headAngle * Math.PI) / 180),
    y: tip.y - headSize * Math.cos(headRad + (headAngle * Math.PI) / 180),
  }
  const right = {
    x: tip.x + headSize * Math.sin(headRad - (headAngle * Math.PI) / 180),
    y: tip.y - headSize * Math.cos(headRad - (headAngle * Math.PI) / 180),
  }

  // Color by speed
  let color = '#22c55e' // < 15kt green
  if (wspd >= 25) color = '#ef4444' // >= 25kt red
  else if (wspd >= 15) color = '#f59e0b' // 15-24kt amber

  return (
    <g>
      {/* Arrow shaft */}
      <line
        x1={tail.x} y1={tail.y}
        x2={tip.x} y2={tip.y}
        stroke={color} strokeWidth="3" strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon
        points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill={color}
      />
      {/* Speed label near tail */}
      <text
        x={tail.x} y={tail.y - 8}
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace"
      >
        {wspd}kt
      </text>
      {/* Direction label */}
      <text
        x={tail.x} y={tail.y + 10}
        textAnchor="middle" dominantBaseline="central"
        fill="#71717a" fontSize="9" fontFamily="monospace"
      >
        {String(wdir).padStart(3, '0')}°
      </text>
    </g>
  )
}

export function AirportDiagram({ metar }: AirportDiagramProps) {
  const airport = AIRPORT_RUNWAYS[metar.icaoId]
  const fltcatColor = FLTCAT_COLORS[metar.fltcat] || '#71717a'
  const wdir = typeof metar.wdir === 'number' ? metar.wdir : null
  const wspd = metar.wspd || 0

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        {/* Background */}
        <rect width="300" height="300" fill="#0a0a0a" rx="12" />

        {/* Compass ring */}
        <circle cx={CX} cy={CY} r="140" fill="none" stroke="#1f1f1f" strokeWidth="1" />
        <circle cx={CX} cy={CY} r="100" fill="none" stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="4 4" />

        {/* Compass labels */}
        <text x={CX} y="18" textAnchor="middle" fill="#3f3f46" fontSize="11" fontWeight="bold">N</text>
        <text x={CX} y="290" textAnchor="middle" fill="#3f3f46" fontSize="11" fontWeight="bold">S</text>
        <text x="10" y={CY + 4} textAnchor="middle" fill="#3f3f46" fontSize="11" fontWeight="bold">W</text>
        <text x="290" y={CY + 4} textAnchor="middle" fill="#3f3f46" fontSize="11" fontWeight="bold">E</text>

        {/* Runways */}
        {airport ? (
          airport.runways.map((rwy, i) => (
            <RunwayLine key={i} runway={rwy} index={i} total={airport.runways.length} />
          ))
        ) : (
          // No runway data - show crosshair
          <>
            <line x1={CX - 30} y1={CY} x2={CX + 30} y2={CY} stroke="#27272a" strokeWidth="2" />
            <line x1={CX} y1={CY - 30} x2={CX} y2={CY + 30} stroke="#27272a" strokeWidth="2" />
          </>
        )}

        {/* Wind arrow */}
        {wdir !== null && wspd > 0 && (
          <WindArrow wdir={wdir} wspd={wspd} />
        )}

        {/* Flight category dot */}
        <circle cx={CX} cy={CY} r="14" fill={fltcatColor} opacity="0.3" />
        <circle cx={CX} cy={CY} r="8" fill={fltcatColor} />

        {/* Variable wind indicator */}
        {metar.wdir === 'VRB' && (
          <text
            x={CX} y={CY - 25}
            textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold"
          >
            VRB {wspd}kt
          </text>
        )}

        {/* Calm wind */}
        {(wspd === 0 || wdir === null) && metar.wdir !== 'VRB' && (
          <text
            x={CX} y={CY - 25}
            textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold"
          >
            CALM
          </text>
        )}

        {/* ICAO label */}
        <text
          x={CX} y={CY + 28}
          textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace"
        >
          {metar.icaoId}
        </text>

        {/* Gust indicator */}
        {metar.wgst && (
          <text
            x={CX} y="296"
            textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold"
          >
            GUSTS {metar.wgst}kt
          </text>
        )}
      </svg>

      {/* Flight category badge */}
      <div className="absolute top-2 right-2">
        <span
          className="px-2 py-1 rounded-lg text-xs font-bold border"
          style={{
            backgroundColor: `${fltcatColor}20`,
            color: fltcatColor,
            borderColor: `${fltcatColor}50`,
          }}
        >
          {metar.fltcat}
        </span>
      </div>
    </div>
  )
}
