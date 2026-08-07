/**
 * GAA Utilization Card — Radial Gauge
 *
 * Displays General Appropriations Act budget utilization as a premium
 * SVG radial gauge (speedometer-style arc). No Recharts required — the
 * gauge is built from two SVG arc paths plus a glow-effect indicator dot.
 *
 * Arc spans 270° (7 o'clock → 5 o'clock, clockwise). The fill arc is
 * animated via CSS stroke-dasharray transition on mount.
 *
 * Color thresholds: blue (<75%) · amber (75-89%) · red (≥90%)
 *
 * @module features/planning/dashboard/components/charts/GAAUtilization
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Banknote, TrendingUp } from 'lucide-react'
import type { GAAUtilizationData } from '../../types'

interface GAAUtilizationProps {
  data: GAAUtilizationData | null
  isLoading?: boolean
}

// ── Gauge geometry constants ──────────────────────────────────────────────────
const CX = 100
const CY = 108
const R = 74
const STROKE = 16
const GAUGE_START_COMPASS = 225   // 7 o'clock (compass: 0° = North, CW positive)
const GAUGE_SWEEP = 270           // total arc degrees

/** Convert compass angle to SVG {x, y} on circle of given radius */
const compassToXY = (deg: number, r: number = R) => {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: +(CX + r * Math.cos(rad)).toFixed(3), y: +(CY + r * Math.sin(rad)).toFixed(3) }
}

/**
 * Build a clockwise SVG arc path.
 * @param startCompass   Starting angle in compass degrees
 * @param sweepDeg       How far to sweep (clockwise)
 */
const buildArcPath = (startCompass: number, sweepDeg: number, r: number = R): string => {
  if (sweepDeg <= 0.01) {
    const p = compassToXY(startCompass, r)
    return `M ${p.x} ${p.y}`
  }
  const clampedSweep = Math.min(sweepDeg, 359.99)
  const s = compassToXY(startCompass, r)
  const e = compassToXY(startCompass + clampedSweep, r)
  const largeArc = clampedSweep > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

/** Stroke-dasharray length for the 270° gauge arc (CSS transition target) */
const TOTAL_ARC_LEN = R * (GAUGE_SWEEP * Math.PI / 180)

/** Color based on utilization — blue → amber → red */
const utilizationColor = (pct: number): string => {
  if (pct >= 90) return '#ef4444'
  if (pct >= 75) return '#f59e0b'
  return '#3b82f6'
}

/** Meter tick positions (compass degrees for 0%, 25%, 50%, 75%, 100%) */
const TICKS = [0, 25, 50, 75, 100] as const

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-5 py-6 animate-pulse">
      <div className="h-48 w-52 rounded-xl bg-gray-200" />
      <div className="h-4 w-36 rounded bg-gray-200" />
      <div className="h-3 w-24 rounded bg-gray-200" />
    </div>
  )
}

export function GAAUtilization({ data, isLoading }: GAAUtilizationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Slight delay so the CSS transition fires after first paint
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [data])

  if (isLoading || !data) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-blue-500" />
            <CardTitle>GAA Utilization</CardTitle>
          </div>
          <CardDescription>Fiscal year budget utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const color = utilizationColor(data.percent)
  const remaining = data.total - data.utilized

  // Arc fill length — starts at 0, animates to full on mount
  const fillArcLen = TOTAL_ARC_LEN * (data.percent / 100)
  const dashArray = `${mounted ? fillArcLen.toFixed(2) : 0} ${(TOTAL_ARC_LEN * 2).toFixed(2)}`

  // Dot position at the tip of the progress arc
  const dotAngle = GAUGE_START_COMPASS + (data.percent / 100) * GAUGE_SWEEP
  const dotPt = compassToXY(dotAngle)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-blue-500" />
            <CardTitle>GAA Utilization</CardTitle>
          </div>
          {/* On Track badge — lives in the header, close to the title */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            <TrendingUp className="h-3 w-3" />
            <span>On Track</span>
          </div>
        </div>
        <CardDescription>Fiscal year budget utilization</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center flex-1 py-2 gap-3">
        {/* SVG Radial Gauge */}
        <div className="relative w-full max-w-[220px]">
          <svg
            viewBox="0 0 200 175"
            className="w-full"
            aria-label={`GAA Utilization: ${data.percent}%`}
          >
            <defs>
              {/* Glow filter for the indicator dot */}
              <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Background track ─────────────────────── */}
            <path
              d={buildArcPath(GAUGE_START_COMPASS, GAUGE_SWEEP)}
              fill="none"
              stroke="#e9ecef"
              strokeWidth={STROKE}
              strokeLinecap="round"
            />

            {/* ── Progress fill (animates via stroke-dasharray) ─────── */}
            <path
              d={buildArcPath(GAUGE_START_COMPASS, GAUGE_SWEEP)}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' }}
            />

            {/* ── Zone tick marks (white lines at 25 / 50 / 75 %) ───── */}
            {TICKS.filter((t) => t > 0 && t < 100).map((t) => {
              const deg = GAUGE_START_COMPASS + (t / 100) * GAUGE_SWEEP
              const inner = compassToXY(deg, R - STROKE / 2 - 1)
              const outer = compassToXY(deg, R + STROKE / 2 + 1)
              return (
                <line
                  key={t}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              )
            })}

            {/* ── End-cap dot with glow at the progress tip ─────────── */}
            {mounted && data.percent > 2 && (
              <circle
                cx={dotPt.x}
                cy={dotPt.y}
                r={8}
                fill={color}
                stroke="white"
                strokeWidth={2.5}
                filter="url(#gaugeGlow)"
              />
            )}

            {/* ── Arc endpoint labels (0 / 100) ─────────────────────── */}
            {(() => {
              const startPt = compassToXY(GAUGE_START_COMPASS, R + STROKE / 2 + 10)
              const endPt = compassToXY(GAUGE_START_COMPASS + GAUGE_SWEEP, R + STROKE / 2 + 10)
              return (
                <>
                  <text
                    x={startPt.x}
                    y={startPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#9ca3af"
                    fontWeight="600"
                  >
                    0%
                  </text>
                  <text
                    x={endPt.x}
                    y={endPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#9ca3af"
                    fontWeight="600"
                  >
                    100%
                  </text>
                </>
              )
            })()}

            {/* ── Centre label ──────────────────────────────────────── */}
            <text
              x={CX}
              y={CY - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={34}
              fontWeight="800"
              fill={color}
              letterSpacing="-1"
            >
              {data.percent}%
            </text>
            <text
              x={CX}
              y={CY + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#9ca3af"
              fontWeight="500"
            >
              utilized
            </text>
          </svg>
        </div>

        {/* Peso breakdown */}
        <div className="text-center">
          <p className="text-base font-extrabold text-gray-900 tracking-tight">
            ₱{data.utilized}
            <span className="text-gray-400 font-normal text-sm">{data.unit}</span>
            <span className="text-gray-400 font-light text-sm"> of </span>
            ₱{data.total}
            <span className="text-gray-400 font-normal text-sm">{data.unit}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Fiscal Year GAA Budget</p>
        </div>

        {/* Mini legend */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100 w-full justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <div>
              <p className="text-[10px] font-semibold text-gray-400">Utilized</p>
              <p className="text-sm font-bold text-gray-800">₱{data.utilized}{data.unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            <div>
              <p className="text-[10px] font-semibold text-gray-400">Remaining</p>
              <p className="text-sm font-bold text-gray-800">₱{remaining}{data.unit}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
