/**
 * PPMP / APP Consolidation — Stacked Progress Bar
 *
 * Redesigned from a donut chart to a single thick stacked horizontal bar
 * sitting above three metric tiles. The bar reads instantly as a "loading
 * bar" for the consolidation pipeline:
 *   • Green   = Consolidated (done)
 *   • Blue    = In Progress  (work ongoing)
 *   • Orange  = Pending      (not started)
 *
 * Features:
 *  - Animated CSS width transition on mount (each segment fills sequentially)
 *  - Hover dimming on non-hovered segments + tooltip
 *  - A 75% target milestone marker above the bar
 *  - White separators between segments
 *  - Friendly summary sentence at the bottom
 *
 * @module features/planning/dashboard/components/charts/PPMPConsolidationChart
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag } from 'lucide-react'
import type { PPMPConsolidationData } from '../../types'

interface PPMPConsolidationChartProps {
  data: PPMPConsolidationData
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-xl" />
      <div className="flex gap-3 justify-between">
        {[1, 2, 3].map((i) => <div key={i} className="h-4 w-24 bg-gray-200 rounded" />)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-200" />)}
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

  if (isLoading || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>PPMP / APP Consolidation</CardTitle>
          <CardDescription>Procurement plan rollup status</CardDescription>
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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>PPMP / APP Consolidation</CardTitle>
            <CardDescription>Procurement plan rollup status</CardDescription>
          </div>
          {/* Total count pill */}
          <div className="flex-shrink-0 text-right">
            <span className="text-2xl font-bold text-gray-900 leading-none">{total}</span>
            <p className="text-[11px] text-gray-400 mt-0.5">PPMPs</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4 pb-6">

        {/* ── Section title + completion label ──────────────────── */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-700">Progress to Full Consolidation</span>
          <span className="font-bold text-gray-500">{consolidatedPct}% complete</span>
        </div>

        {/* ── Stacked bar container (relative for milestone marker) ── */}
        <div className="relative pt-6">

          {/* 75% target milestone marker — above the bar */}
          <div
            className="absolute top-0 flex flex-col items-center gap-px"
            style={{ left: '75%', transform: 'translateX(-50%)' }}
          >
            <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              <Flag className="h-2.5 w-2.5 text-amber-500" />
              <span className="text-[9px] font-bold text-amber-600">Target</span>
            </div>
            <div className="w-px h-2 bg-amber-300" />
          </div>

          {/* The stacked bar */}
          <div
            className="flex h-10 w-full rounded-xl overflow-hidden shadow-sm ring-1 ring-black/[0.06]"
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
                    borderRight: i < segments.length - 1 ? '2px solid rgba(255,255,255,0.35)' : undefined,
                    filter: isDimmed ? 'brightness(0.78)' : undefined,
                    transition: [
                      `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`,
                      'filter 0.15s ease',
                    ].join(', '),
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {seg.pct > 12 && (
                    <span className="text-white text-xs font-bold pointer-events-none">
                      {Math.round(seg.pct)}%
                    </span>
                  )}
                  {isHovered && (
                    <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-xl pointer-events-none">
                      {seg.name}: {seg.value} ({Math.round(seg.pct)}%)
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 75% dashed marker line */}
          <div
            className="absolute inset-y-6 bottom-0 w-px pointer-events-none"
            style={{
              left: '75%',
              background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 4px, transparent 4px, transparent 7px)',
            }}
          />
        </div>

        {/* ── Legend chips ──────────────────────────────────────── */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
          {segments.map((seg, i) => (
            <button
              key={seg.name}
              type="button"
              className="flex items-center gap-1.5 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="h-3 w-3 rounded-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-gray-600 font-medium">{seg.name}</span>
              <span className="text-xs font-bold text-gray-400">{Math.round(seg.pct)}%</span>
            </button>
          ))}
        </div>

        {/*
         * mt-auto pushes this block to the card bottom so the metric tiles
         * visually align with the 4-tile row in the adjacent KPI Health card.
         */}
        <div className="mt-auto space-y-3">
          {/* ── Summary sentence — sits directly above the tiles ─── */}
          <p className="text-[11px] text-center text-gray-400 border-t border-gray-100 pt-3">
            <span className="font-semibold" style={{ color: consolidated?.color }}>
              {consolidated?.value ?? 0} PPMPs
            </span>{' '}
            consolidated —{' '}
            <span className="font-semibold" style={{ color: pending?.color }}>
              {pending?.value ?? 0} pending
            </span>{' '}
            to go
          </p>

          {/* ── Metric tiles ───────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            {segments.map((seg, i) => (
              <div
                key={seg.name}
                className="rounded-xl p-3 text-center border cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: hoveredIndex === i ? `${seg.color}1e` : `${seg.color}10`,
                  borderColor: hoveredIndex === i ? `${seg.color}50` : `${seg.color}30`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <p className="text-2xl font-bold leading-none" style={{ color: seg.color }}>
                  {seg.value}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">{seg.name}</p>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
