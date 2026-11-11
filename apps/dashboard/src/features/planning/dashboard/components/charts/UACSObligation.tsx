/**
 * Expense Class — Programmed vs Allotment Chart
 *
 * Shows programming progress per expense class (PS, MOOE, CO, FE) as
 * dual-layer tracks (grey = allotment ceiling, colour = programmed budget) with a status
 * indicator, plus a grouped BarChart with labelled bars by department.
 *
 * @module features/planning/dashboard/components/charts/UACSObligation
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { UACSObligationData } from '../../types'
import { formatCurrencyPHP, formatCurrencyAbbr } from '@/utils/formatters'

interface UACSObligationProps {
  data: UACSObligationData | null
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-36 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="h-3 w-full bg-muted rounded-full" />
        </div>
      ))}
      <div className="h-44 w-full bg-muted rounded-lg mt-4" />
    </div>
  )
}

function rowStatus(pct: number, hasAllotment: boolean): {
  icon: React.ReactNode
  label: string
  pillClass: string
} {
  if (!hasAllotment) {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'No Allotment',
      pillClass: 'bg-muted text-muted-foreground border-border',
    }
  }
  if (pct > 100) {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Over-Programmed',
      pillClass: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/20',
    }
  }
  if (pct >= 85) {
    return {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'On Track',
      pillClass: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20',
    }
  }
  if (pct >= 50) {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Moderate',
      pillClass: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20',
    }
  }
  return {
    icon: null,
    label: 'Low',
    pillClass: 'bg-muted/70 text-foreground/80 border-border',
  }
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 text-xs min-w-[190px]">
        <p className="font-semibold text-popover-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-xs border border-black/10 dark:border-white/15"
                style={{ backgroundColor: p.fill }}
              />
              <span className="text-muted-foreground font-normal">{p.name}:</span>
            </div>
            <span
              className={`font-semibold tabular-nums ${
                p.dataKey === 'obligated'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-popover-foreground'
              }`}
            >
              {formatCurrencyPHP(p.value)}
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-1.5 pt-1.5 border-t border-border/70 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-normal">Programming Rate:</span>
            <span className="font-semibold text-popover-foreground tabular-nums">
              {payload[0].value > 0 ? ((payload[1].value / payload[0].value) * 100).toFixed(1) : 0}%
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export function UACSObligation({ data, isLoading }: UACSObligationProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (isLoading || !data) {
    return (
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Expense Class — Programmed vs Allotment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  const totalProg = data.totalProgrammed ?? data.rows.reduce((s, r) => s + (r.programmedAmount || 0), 0)
  const totalAllot = data.totalAllotment ?? data.rows.reduce((s, r) => s + (r.allotmentAmount || 0), 0)
  const overallPct = data.overallProgrammingPercentage ?? (totalAllot > 0 ? (totalProg / totalAllot) * 100 : 0)

  const { icon: summaryIcon, pillClass: summaryClass } = rowStatus(overallPct, totalAllot > 0)

  const shouldTiltTicks = data.barChartData.length > 3
  const ceilingFill = isDark ? '#334155' : '#dbeafe'
  const ceilingStroke = isDark ? '#475569' : '#bfdbfe'
  const programmedFill = isDark ? '#3b82f6' : '#2563eb'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  const gridStroke = isDark ? 'rgba(148, 163, 184, 0.12)' : '#f1f5f9'
  const axisStroke = isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0'
  const cursorFill = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.12)'

  return (
    <Card className="h-full border border-border/80 shadow-xs bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Expense Class — Programmed vs Allotment
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Programming progress by expense classification (PS, MOOE, CO, FE)
            </CardDescription>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tabular-nums border ${summaryClass}`}>
              {summaryIcon}
              <span>Overall {overallPct.toFixed(1)}%</span>
            </span>
            <span className="text-xs text-muted-foreground font-normal bg-muted/60 px-2.5 py-0.5 rounded border border-border tabular-nums">
              Total: <span className="font-semibold text-foreground">{formatCurrencyAbbr(totalProg)}</span> / {formatCurrencyAbbr(totalAllot)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Progress rows ─────────────────────────────────────── */}
        <div className="space-y-3.5">
          {data.rows.map((row) => {
            const isOver = row.obligationPercent > 100

            return (
              <div key={row.code}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white leading-none shrink-0"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.code}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate">{row.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                    <span
                      className={`font-semibold ${
                        isOver ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                      }`}
                    >
                      {row.obligationPercent.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground font-normal">
                      ({formatCurrencyAbbr(row.programmedAmount || 0)} / {row.allotmentLabel})
                    </span>
                  </div>
                </div>

                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, row.obligationPercent))}%`,
                      backgroundColor: isOver ? '#ef4444' : row.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Grouped bar chart ──────────────────────────────────── */}
        {data.barChartData.length > 0 && (
          <div className="pt-4 border-t border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Programmed vs Allotment by Department
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-xs border"
                    style={{ backgroundColor: ceilingFill, borderColor: ceilingStroke }}
                  />
                  <span>Allotment Ceiling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-xs"
                    style={{ backgroundColor: programmedFill }}
                  />
                  <span>Programmed Budget</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={215}>
              <BarChart
                data={data.barChartData}
                margin={{ top: 10, right: 12, left: -4, bottom: shouldTiltTicks ? 26 : 8 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke }}
                  angle={shouldTiltTicks ? -15 : 0}
                  textAnchor={shouldTiltTicks ? 'end' : 'middle'}
                  height={shouldTiltTicks ? 46 : 28}
                  tickFormatter={(val: string) =>
                    val && val.length > 32 ? `${val.slice(0, 30)}…` : val
                  }
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₱${(v / 1_000_000).toFixed(0)}M`}
                  width={42}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: cursorFill }} />
                <Bar
                  dataKey="allotment"
                  name="Allotment Ceiling"
                  fill={ceilingFill}
                  stroke={ceilingStroke}
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={84}
                />
                <Bar
                  dataKey="obligated"
                  name="Programmed Budget"
                  fill={programmedFill}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={84}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
