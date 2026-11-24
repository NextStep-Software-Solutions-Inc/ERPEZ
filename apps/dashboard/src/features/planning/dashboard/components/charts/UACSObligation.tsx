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
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
            <div className="h-3 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full" />
        </div>
      ))}
      <div className="h-44 w-full bg-gray-200 rounded-lg mt-4" />
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
      pillClass: 'bg-gray-50 text-gray-500 border-gray-200',
    }
  }
  if (pct > 100) {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Over-Programmed',
      pillClass: 'bg-red-50 text-red-700 border-red-200',
    }
  }
  if (pct >= 85) {
    return {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'On Track',
      pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
  }
  if (pct >= 50) {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Moderate',
      pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  }
  return {
    icon: null,
    label: 'Low',
    pillClass: 'bg-gray-50 text-gray-600 border-gray-200',
  }
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-md p-2.5 text-xs min-w-[160px]">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.fill }} />
              <span className="text-gray-500 font-normal">{p.name}:</span>
            </div>
            <span className="font-semibold" style={{ color: p.fill }}>
              {formatCurrencyPHP(p.value)}
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-normal">Programming Rate:</span>
            <span className="font-semibold text-gray-800">
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
  if (isLoading || !data) {
    return (
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">
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

  const { icon: summaryIcon, label: summaryLabel, pillClass: summaryClass } = rowStatus(overallPct, totalAllot > 0)

  return (
    <Card className="h-full border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Expense Class — Programmed vs Allotment
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-normal">
              Programming progress by expense classification (PS, MOOE, CO, FE)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${summaryClass}`}>
              {summaryIcon}
              <span>Overall {overallPct.toFixed(1)}%</span>
            </span>
            <span className="text-xs text-gray-500 font-normal bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              Total: <span className="font-semibold text-gray-800">{formatCurrencyAbbr(totalProg)}</span> / {formatCurrencyAbbr(totalAllot)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Progress rows ─────────────────────────────────────── */}
        <div className="space-y-3.5">
          {data.rows.map((row) => {
            const hasAllotment = row.allotmentAmount > 0 || (row.obligationPercent > 0 && row.allotmentLabel !== 'P 0')
            const isOver = row.obligationPercent > 100

            return (
              <div key={row.code}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white leading-none"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.code}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{row.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold" style={{ color: isOver ? '#dc2626' : '#1f2937' }}>
                      {row.obligationPercent.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 font-normal">/ {row.allotmentLabel}</span>
                  </div>
                </div>

                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Programmed vs Allotment by Department</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data.barChartData}
                margin={{ top: 12, right: 8, left: -10, bottom: 20 }}
                barCategoryGap="28%"
                barGap={3}
              >
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={{ stroke: '#f3f4f6' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₱${(v / 1_000_000).toFixed(0)}M`}
                  width={38}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={22}
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                />
                <Bar
                  dataKey="allotment"
                  name="Allotment Ceiling"
                  fill="#dbeafe"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="obligated"
                  name="Programmed Budget"
                  fill="#3b82f6"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
