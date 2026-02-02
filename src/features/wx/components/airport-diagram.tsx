'use client'

import type { MetarData, RunwayInfo } from '../types'
import { FLTCAT_COLORS } from '../types'
import { AIRPORT_RUNWAYS } from '../data/airports'

interface AirportDiagramProps {
  metar: MetarData
}

const CX = 100
const CY = 80
const RWY_LEN = 55

function headingToXY(heading: number, radius: number) {
  const rad = (heading * Math.PI) / 180
  return {
    x: CX + radius * Math.sin(rad),
    y: CY - radius * Math.cos(rad),
  }
}

function RunwayLine({ runway, index, total }: { runway: RunwayInfo; index: number; total: number }) {
  const offset = total > 1 ? (index - (total - 1) / 2) * 7 : 0
  const perpRad = ((runway.heading + 90) * Math.PI) / 180
  const dx = offset * Math.sin(perpRad)
  const dy = -offset * Math.cos(perpRad)

  const end1 = headingToXY(runway.heading, RWY_LEN)
  const end2 = headingToXY(runway.heading + 180, RWY_LEN)
  // Labels go at the threshold (approach end): label1 at opposite of its heading
  const lbl1 = headingToXY(runway.heading + 180, RWY_LEN + 12)
  const lbl2 = headingToXY(runway.heading, RWY_LEN + 12)

  return (
    <g>
      <line
        x1={end1.x + dx} y1={end1.y + dy}
        x2={end2.x + dx} y2={end2.y + dy}
        stroke="#3f3f46" strokeWidth="5" strokeLinecap="round"
      />
      <line
        x1={end1.x + dx} y1={end1.y + dy}
        x2={end2.x + dx} y2={end2.y + dy}
        stroke="#71717a" strokeWidth="0.8"
        strokeDasharray="4 3"
      />
      <text
        x={lbl1.x + dx} y={lbl1.y + dy}
        textAnchor="middle" dominantBaseline="central"
        fill="#a1a1aa" fontSize="9" fontWeight="bold" fontFamily="monospace"
      >
        {runway.label1}
      </text>
      <text
        x={lbl2.x + dx} y={lbl2.y + dy}
        textAnchor="middle" dominantBaseline="central"
        fill="#a1a1aa" fontSize="9" fontWeight="bold" fontFamily="monospace"
      >
        {runway.label2}
      </text>
    </g>
  )
}

function AnimatedWindArrow({ wdir, wspd, wgst }: { wdir: number; wspd: number; wgst: number | null }) {
  // Arrowhead points downwind (where wind goes), tail at wind origin
  const arrowLen = 50
  const tip = headingToXY(wdir, -arrowLen / 2)   // tip (arrowhead) at downwind side
  const tail = headingToXY(wdir, arrowLen / 2)    // tail at wind origin

  // Arrowhead wings extend back toward wind origin
  const headSize = 8
  const headAngle = 28
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
  let color = '#22c55e'
  if (wspd >= 25) color = '#ef4444'
  else if (wspd >= 15) color = '#f59e0b'

  // Animation speed based on wind speed
  const animDuration = wspd >= 25 ? '0.8s' : wspd >= 15 ? '1.2s' : '2s'

  return (
    <g>
      {/* Animated wind group */}
      <g>
        {/* Glow pulse behind arrow */}
        <circle cx={CX} cy={CY} r="18" fill={color} opacity="0.08">
          <animate
            attributeName="r"
            values="14;20;14"
            dur={animDuration}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.08;0.18;0.08"
            dur={animDuration}
            repeatCount="indefinite"
          />
        </circle>

        {/* Arrow shaft with pulse animation */}
        <line
          x1={tail.x} y1={tail.y}
          x2={tip.x} y2={tip.y}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur={animDuration}
            repeatCount="indefinite"
          />
        </line>

        {/* Arrowhead */}
        <polygon
          points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
          fill={color}
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur={animDuration}
            repeatCount="indefinite"
          />
        </polygon>

        {/* Wind particles - small dots moving along wind direction */}
        {[0, 1, 2].map((i) => {
          const particleRad = (wdir * Math.PI) / 180
          const startR = arrowLen / 2 + 4
          const endR = -(arrowLen / 2 + 4)
          const sx = CX + startR * Math.sin(particleRad)
          const sy = CY - startR * Math.cos(particleRad)
          const ex = CX + endR * Math.sin(particleRad)
          const ey = CY - endR * Math.cos(particleRad)
          const delay = `${i * 0.5}s`

          return (
            <circle key={i} r="1.5" fill={color} opacity="0">
              <animate
                attributeName="cx"
                values={`${sx};${ex}`}
                dur={animDuration}
                begin={delay}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${sy};${ey}`}
                dur={animDuration}
                begin={delay}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur={animDuration}
                begin={delay}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>

      {/* Speed label */}
      <text
        x={CX} y={CY + RWY_LEN + 22}
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace"
      >
        {String(wdir).padStart(3, '0')}°/{wspd}kt{wgst ? ` G${wgst}` : ''}
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
    <div className="rounded-xl border border-[#27272a] bg-[#0a0a0a] p-2">
      <svg viewBox="0 0 200 160" className="w-full max-w-[200px] mx-auto">
        {/* Runways */}
        {airport ? (
          airport.runways.map((rwy, i) => (
            <RunwayLine key={i} runway={rwy} index={i} total={airport.runways.length} />
          ))
        ) : (
          <g>
            <line x1={CX - 20} y1={CY} x2={CX + 20} y2={CY} stroke="#27272a" strokeWidth="2" />
            <line x1={CX} y1={CY - 20} x2={CX} y2={CY + 20} stroke="#27272a" strokeWidth="2" />
          </g>
        )}

        {/* Wind arrow centered on runway */}
        {wdir !== null && wspd > 0 && (
          <AnimatedWindArrow wdir={wdir} wspd={wspd} wgst={metar.wgst ?? null} />
        )}

        {/* Small flight category dot */}
        <circle cx={CX} cy={CY} r="4" fill={fltcatColor} />

        {/* Variable wind */}
        {metar.wdir === 'VRB' && (
          <text
            x={CX} y={CY + RWY_LEN + 22}
            textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace"
          >
            VRB {wspd}kt
          </text>
        )}

        {/* Calm wind */}
        {(wspd === 0 || wdir === null) && metar.wdir !== 'VRB' && (
          <text
            x={CX} y={CY + RWY_LEN + 22}
            textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold" fontFamily="monospace"
          >
            CALM
          </text>
        )}
      </svg>

      {/* Category badge below */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
          style={{
            backgroundColor: `${fltcatColor}20`,
            color: fltcatColor,
            borderColor: `${fltcatColor}50`,
          }}
        >
          {metar.fltcat}
        </span>
        <span className="text-[10px] text-[#52525b] font-mono">{metar.icaoId}</span>
      </div>
    </div>
  )
}
