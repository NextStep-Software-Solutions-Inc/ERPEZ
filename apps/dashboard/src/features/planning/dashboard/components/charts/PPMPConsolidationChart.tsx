/**
 * PPMP / APP Consolidation — Stacked Progress & Metrics
 *
 * Displays procurement plan rollup status with a clean stacked progress bar,
 * status breakdown (Consolidated, In Progress, Pending), and metric summary.
 *
 * @module features/planning/dashboard/components/charts/PPMPConsolidationChart
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, Package, Layers } from 'lucide-react'
import type { PPMPConsolidationData } from '../../types'

interface PPMPConsolidationChartProps {
  data: PPMPConsolidationData
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-2">
      <div className="flex justify-between">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded-full" />
      </div>
      <div className="h-8 w-full bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-200" />)}
      </div>
    </div>
  )
}

export function PPMPConsolidationChart({ data, isLoading }: PPMPConsolidationChartProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [data])

  if (isLoading || !data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">PPMP / APP Consolidation</CardTitle>
          <CardDescription className="text-xs text-gray-500 font-normal">Procurement plan rollup status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const segments = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: item.color,
    pct: total > 0 ? (item.count / total) * 100 : 0,
  }))

  const consolidated = segments[0]
  const pending = segments[segments.length - 1]
  const consolidatedPct = Math.round(consolidated?.pct ?? 0)
  const hasPPMPs = total > 0

  return (
    <Card className="flex flex-col h-full justify-between border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              PPMP / APP Consolidation
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-normal">
              Department procurement plan rollup status
            </CardDescription>
          </div>
          {hasPPMPs && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {consolidated?.value ?? 0} / {total} Consolidated ({consolidatedPct}%)
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4 pb-4 pt-1">
        {!hasPPMPs ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/40">
            <Layers className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs font-medium text-gray-600">No PPMPs submitted for this fiscal year</p>
            <p className="text-[11px] text-gray-400 font-normal mt-0.5">
              Consolidation progress will track here as departments submit their PPMPs.
            </p>
          </div>
        ) : (
          <>
            {/* ── Section title + completion label ──────────────────── */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500 font-normal">Consolidation Progress</span>
              <span className="font-semibold text-gray-800">{consolidatedPct}% complete</span>
            </div>

            {/* ── Stacked bar container ── */}
            <div className="relative pt-5">
              {/* 75% target milestone marker */}
              <div
                className="absolute top-0 flex flex-col items-center gap-px"
                style={{ left: '75%', transform: 'translateX(-50%)' }}
              >
                <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/70 rounded px-1.5 py-0.2">
                  <Flag className="h-2 w-2 text-amber-500" />
                  <span className="text-[8px] font-medium text-amber-700">Target</span>
                </div>
                <div className="w-px h-1.5 bg-amber-300" />
              </div>

              {/* The stacked bar */}
              <div
                className="flex h-7 w-full rounded-lg overflow-hidden ring-1 ring-black/[0.04]"
                role="progressbar"
                aria-valuenow={consolidatedPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {segments.map((seg, i) => {
                  const isHovered = hoveredIndex === i
                  const isDimmed = hoveredIndex !== null && !isHovered
                  return (
                    <div
                      key={seg.name}
                      className="relative flex items-center justify-center cursor-pointer select-none"
                      style={{
                        width: mounted ? `${seg.pct}%` : '0%',
                        backgroundColor: seg.color,
                        borderRight: i < segments.length - 1 ? '1.5px solid rgba(255,255,255,0.4)' : undefined,
                        filter: isDimmed ? 'brightness(0.85)' : undefined,
                        transition: [
                          `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
                          'filter 0.15s ease',
                        ].join(', '),
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {seg.pct > 14 && (
                        <span className="text-white text-[11px] font-semibold pointer-events-none">
                          {Math.round(seg.pct)}%
                        </span>
                      )}
                      {isHovered && (
                        <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 bg-gray-900 text-white rounded px-2 py-1 text-[10px] font-medium whitespace-nowrap shadow-md pointer-events-none">
                          {seg.name}: {seg.value} ({Math.round(seg.pct)}%)
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Legend chips ──────────────────────────────────────── */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
              {segments.map((seg, i) => (
                <button
                  key={seg.name}
                  type="button"
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-gray-500 font-normal">{seg.name}</span>
                  <span className="text-xs text-gray-400 font-normal">({Math.round(seg.pct)}%)</span>
                </button>
              ))}
            </div>

            {/* ── Metric tiles ───────────────────────────────────── */}
            <div className="mt-auto pt-2">
              <div className="grid grid-cols-3 gap-2">
                {segments.map((seg, i) => (
                  <div
                    key={seg.name}
                    className="rounded-lg p-2 text-center border border-gray-100 bg-gray-50/40 cursor-pointer transition-colors hover:bg-gray-50"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <p className="text-lg font-bold leading-none text-gray-900">
                      {seg.value}
                    </p>
                    <p className="text-[11px] text-gray-500 font-normal mt-1 leading-tight">{seg.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
