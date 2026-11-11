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
import { ChartTooltipRow, ChartTooltipShell } from '@/components/ui/chart-tooltip'
import { Flag, Layers } from 'lucide-react'
import type { PPMPConsolidationData } from '../../types'

interface PPMPConsolidationChartProps {
  data: PPMPConsolidationData
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-2">
      <div className="flex justify-between">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-4 w-12 bg-muted rounded-full" />
      </div>
      <div className="h-8 w-full bg-muted rounded-lg" />
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted" />)}
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
      <Card className="flex flex-col h-full border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">PPMP / APP Consolidation</CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">Procurement plan rollup status</CardDescription>
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
  const consolidatedPct = Math.round(consolidated?.pct ?? 0)
  const hasPPMPs = total > 0

  return (
    <Card className="flex flex-col h-full justify-between border border-border/80 shadow-xs bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              PPMP / APP Consolidation
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Department procurement plan rollup status
            </CardDescription>
          </div>
          {hasPPMPs && (
            <span className="text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
              {consolidated?.value ?? 0} / {total} Consolidated ({consolidatedPct}%)
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4 pb-4 pt-1">
        {!hasPPMPs ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg bg-muted/30">
            <Layers className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
            <p className="text-xs font-medium text-foreground">No PPMPs submitted for this fiscal year</p>
            <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Consolidation progress will track here as departments submit their PPMPs.
            </p>
          </div>
        ) : (
          <>
            {/* ── Section title + completion label ──────────────────── */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground font-normal">Consolidation Progress</span>
              <span className="font-semibold text-foreground tabular-nums">{consolidatedPct}% complete</span>
            </div>

            {/* ── Stacked bar container ── */}
            <div className="relative pt-5">
              {/* 75% target milestone marker */}
              <div
                className="absolute top-0 flex flex-col items-center gap-px"
                style={{ left: '75%', transform: 'translateX(-50%)' }}
              >
                <div className="flex items-center gap-0.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 rounded px-1.5 py-0.5">
                  <Flag className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 leading-none">75% Target</span>
                </div>
                <div className="w-px h-1.5 bg-amber-500/60" />
              </div>

              {/* The stacked bar */}
              <div
                className="flex h-7 w-full rounded-lg overflow-hidden bg-secondary ring-1 ring-inset ring-border/60"
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
                        borderRight:
                          i < segments.length - 1 && seg.pct > 0
                            ? '1.5px solid hsl(var(--card))'
                            : undefined,
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
                        <span className="text-white text-[11px] font-semibold tabular-nums pointer-events-none drop-shadow-2xs">
                          {Math.round(seg.pct)}%
                        </span>
                      )}
                      {isHovered && (
                        <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 pointer-events-none">
                          <ChartTooltipShell className="min-w-[140px] px-2.5 py-1.5">
                            <ChartTooltipRow
                              color={seg.color}
                              label={seg.name}
                              value={`${seg.value} (${Math.round(seg.pct)}%)`}
                            />
                          </ChartTooltipShell>
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
                    className="h-2.5 w-2.5 rounded-xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-foreground/85 group-hover:text-foreground font-normal transition-colors">{seg.name}</span>
                  <span className="text-xs text-muted-foreground font-normal tabular-nums">({Math.round(seg.pct)}%)</span>
                </button>
              ))}
            </div>

            {/* ── Metric tiles ───────────────────────────────────── */}
            <div className="mt-auto pt-2">
              <div className="grid grid-cols-3 gap-2.5">
                {segments.map((seg, i) => (
                  <div
                    key={seg.name}
                    className="rounded-lg p-2.5 text-center border border-border/70 bg-secondary/50 cursor-pointer transition-colors hover:bg-secondary"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <p className="text-lg font-bold leading-none text-foreground tabular-nums">
                      {seg.value}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <p className="text-[11px] text-muted-foreground font-normal leading-tight">{seg.name}</p>
                    </div>
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
