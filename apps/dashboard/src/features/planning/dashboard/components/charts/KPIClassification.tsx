/**
 * KPI Classification — Strategic, Core & Support
 *
 * Displays active KPI distribution across standard civil service categories
 * (Strategic / Core / Support) with a clear visual hierarchy:
 * 1. Primary: Category breakdown & share of total KPIs
 * 2. Secondary: Office assignment distribution
 *
 * @module features/planning/dashboard/components/charts/KPIClassification
 */

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltipRow, ChartTooltipShell, useChartTheme } from '@/components/ui/chart-tooltip'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import type { KPIClassificationData } from '../../types'

interface KPIClassificationProps {
  data: KPIClassificationData | null
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="animate-pulse p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="h-36 w-36 rounded-full bg-muted mx-auto" />
          <div className="space-y-2">
            <div className="h-7 bg-muted rounded" />
            <div className="h-7 bg-muted rounded" />
            <div className="h-7 bg-muted rounded" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="h-3 w-28 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <ChartTooltipShell className="min-w-[160px]">
        <p className="font-semibold text-popover-foreground pb-1 mb-1 border-b border-border/60">
          {data.name} KPIs
        </p>
        <ChartTooltipRow
          color={data.payload?.fill}
          label="Indicators"
          value={`${data.value} KPIs (${data.payload.percent}%)`}
        />
      </ChartTooltipShell>
    )
  }
  return null
}

export function KPIClassification({ data, isLoading }: KPIClassificationProps) {
  const { isDark } = useChartTheme()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (type: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })

  if (isLoading || !data) {
    return (
      <Card className="h-full border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">KPI Classification</CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">Strategic, Core &amp; Support distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const ROWS_INITIAL = 3

  const pieData = data.items.map((item) => ({
    name: item.label,
    value: item.count,
    percent: item.percent,
    fill: item.color,
  }))

  const hasKPIs = data.total > 0

  return (
    <Card className="h-full flex flex-col justify-between border border-border/80 shadow-xs bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              KPI Classification &amp; Office Allocation
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal mt-0.5">
              Distribution of institutional indicators across Strategic, Core, and Support functions
            </CardDescription>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1.5 text-xs">
              <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-400/25 px-2 py-0.5 rounded text-[11px]">
                {data.total} Active KPIs
              </span>
              <span className="text-muted-foreground font-medium text-[11px]">
                FY {data.fiscalYear}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground font-normal mt-1">
              Institutional distribution
            </div>
          </div>
        </div>

        {/* ── Classification Category Chips sub-bar matching OPCR header line ─── */}
        <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1.5 pt-2 text-[11px] text-muted-foreground font-normal border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#2563eb' }} />
            <span>Strategic ({data.items.find((i) => i.label.toLowerCase().includes('strategic'))?.count ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#10b981' }} />
            <span>Core ({data.items.find((i) => i.label.toLowerCase().includes('core'))?.count ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#f59e0b' }} />
            <span>Support ({data.items.find((i) => i.label.toLowerCase().includes('support'))?.count ?? 0})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground ml-auto sm:ml-0 text-[10px]">
            <span>{data.total} Total Indicators</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        {!hasKPIs ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg bg-muted/30">
            <Layers className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
            <p className="text-xs font-medium text-foreground">No active KPIs encoded for FY {data.fiscalYear}</p>
            <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Active KPIs will appear categorized once registered in Master KPI configuration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT PANEL: Primary Classification Breakdown (5 Cols) ────────────────── */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Donut Chart */}
              <div className="relative w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="75%"
                      dataKey="value"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                      stroke={isDark ? 'hsl(var(--card))' : '#ffffff'}
                      strokeWidth={1.5}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground tabular-nums leading-none">{data.total}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mt-0.5">KPIs</span>
                </div>
              </div>

              {/* Classification Category Cards */}
              <div className="w-full space-y-1.5 mt-3">
                {data.items.map((item) => (
                  <div
                    key={item.type}
                    className="p-2.5 rounded-lg border border-border/70 bg-secondary/50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs tabular-nums">
                      <span className="font-semibold text-foreground">
                        {item.count}
                      </span>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="text-muted-foreground font-normal text-[11px]">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: Secondary Office Allocation Breakdown (7 Cols) ───────────── */}
            <div className="lg:col-span-7 space-y-3 border-t lg:border-t-0 lg:border-l border-border/60 lg:pl-5 pt-3 lg:pt-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Office Assignment Distribution
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Share within category
                </span>
              </div>

              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {data.items.map((item) => {
                  const sorted = [...item.divisions].sort((a, b) => b.count - a.count)
                  const maxCount = sorted[0]?.count || 1
                  const isExpanded = expanded.has(item.type)
                  const displayRows = isExpanded ? sorted : sorted.slice(0, ROWS_INITIAL)
                  const hasMore = sorted.length > ROWS_INITIAL
                  const totalAssignments = sorted.reduce((sum, d) => sum + d.count, 0)

                  return (
                    <div key={item.type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-border/50">
                        <span className="font-medium text-foreground">
                          {item.label} ({totalAssignments} assigned)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {sorted.length} {sorted.length === 1 ? 'office' : 'offices'}
                        </span>
                      </div>

                      {displayRows.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic py-0.5 font-normal">No office assignments recorded.</p>
                      ) : (
                        <div className="space-y-1.5 pt-0.5">
                          {displayRows.map((div, rankIdx) => {
                            const rank = rankIdx + 1
                            const fillPct = (div.count / maxCount) * 100
                            const divPct = div.sharePercentage ?? (totalAssignments > 0 ? Math.round((div.count / totalAssignments) * 100) : 0)

                            return (
                              <div key={div.name} className="flex items-center gap-2">
                                <span
                                  className="text-[9px] font-semibold w-4 h-4 rounded flex items-center justify-center flex-shrink-0 leading-none bg-muted text-muted-foreground"
                                >
                                  {rank}
                                </span>
                                <span className="text-[11px] text-foreground/85 w-28 flex-shrink-0 truncate font-normal" title={div.name}>
                                  {div.name}
                                </span>
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${fillPct}%`,
                                      backgroundColor: item.color,
                                    }}
                                  />
                                </div>
                                <div className="flex items-baseline gap-1 flex-shrink-0 w-14 justify-end text-xs tabular-nums">
                                  <span className="text-[11px] font-semibold text-foreground">{div.count}</span>
                                  <span className="text-[10px] text-muted-foreground font-normal">({divPct}%)</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.type)}
                          className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              Show all {sorted.length} offices
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
