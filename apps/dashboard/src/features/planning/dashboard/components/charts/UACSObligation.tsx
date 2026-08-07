/**
 * UACS Object Class — Obligation vs Allotment Chart
 *
 * Shows obligation progress per UACS object class (PS, MOOE, CO, FE) as
 * dual-layer tracks (grey = allotment, colour = obligation) with a status
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { UACSObligationData } from '../../types'

interface UACSOblicationProps {
  data: UACSObligationData | null
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-full bg-gray-200 rounded-full" />
        </div>
      ))}
      <div className="h-48 w-full bg-gray-200 rounded-lg mt-6" />
    </div>
  )
}

/** Status config based on obligation % */
function rowStatus(pct: number): {
  icon: React.ReactNode
  label: string
  bg: string
} {
  if (pct >= 75) {
    return {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'On Track',
      bg: '#10b981',
    }
  }
  if (pct >= 50) {
    return {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: 'Warning',
      bg: '#f59e0b',
    }
  }
  return {
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: 'Below Target',
    bg: '#ef4444',
  }
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[150px]">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.fill }} />
              <span className="text-gray-600">{p.name}:</span>
            </div>
            <span className="font-bold" style={{ color: p.fill }}>
              ₱{(p.value / 1_000_000).toFixed(1)}M
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500">Utilization:</span>
            <span className="font-bold text-gray-800">
              {((payload[0].value / payload[1].value) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export function UACSObligation({ data, isLoading }: UACSOblicationProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UACS Object Class — Obligation vs Allotment</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Compute overall obligation % for the header summary
  const totalObligation = data.barChartData.reduce((s, d) => s + d.obligated, 0)
  const totalAllotment = data.barChartData.reduce((s, d) => s + d.allotment, 0)
  const overallPct = totalAllotment > 0
    ? Math.round((totalObligation / totalAllotment) * 100)
    : 0

  const { icon: summaryIcon, bg: summaryBg } = rowStatus(overallPct)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-gray-900">
            UACS Object Class — Obligation vs Allotment
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Overall utilization chip */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: summaryBg }}
            >
              {summaryIcon}
              <span>Overall {overallPct}%</span>
            </div>
            <Badge color="warning" variant="soft" className="text-xs font-semibold">
              {data.quarter} {data.year}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Progress rows ─────────────────────────────────────── */}
        <div className="space-y-4">
          {data.rows.map((row) => {
            const status = rowStatus(row.obligationPercent)
            return (
              <div key={row.code}>
                {/* Row header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Code pill */}
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded text-white leading-none"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.code}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{row.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status icon */}
                    <span style={{ color: status.bg }}>{status.icon}</span>
                    <span className="text-xs font-bold" style={{ color: row.color }}>
                      {row.obligationPercent}%
                    </span>
                    <span className="text-xs text-gray-400">/ {row.allotmentLabel}</span>
                  </div>
                </div>

                {/* Dual-layer track: grey = allotment context, colored = obligation */}
                <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${row.obligationPercent}%`,
                      backgroundColor: row.color,
                    }}
                  />
                  {/* Percentage label inside bar if wide enough, else right of bar */}
                  {row.obligationPercent > 18 && (
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-black text-white">
                      {row.obligationPercent}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Grouped bar chart ──────────────────────────────────── */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-3">Obligation vs Allotment by Department</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.barChartData}
              margin={{ top: 16, right: 8, left: 0, bottom: 24 }}
              barCategoryGap="28%"
              barGap={3}
            >
              <XAxis
                dataKey="department"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₱${(v / 1_000_000).toFixed(0)}M`}
                width={44}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={24}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              />
              {/* Allotment bar (background context) */}
              <Bar
                dataKey="allotment"
                name="Allotment"
                fill="#bfdbfe"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="allotment"
                  position="top"
                  formatter={(v: any) => `₱${(Number(v) / 1_000_000).toFixed(0)}M`}
                  style={{ fontSize: 9, fill: '#93c5fd', fontWeight: 700 }}
                />
              </Bar>
              {/* Obligation bar (foreground) */}
              <Bar
                dataKey="obligated"
                name="Obligated"
                radius={[4, 4, 0, 0]}
              >
                {data.barChartData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={idx % 5 === 0 ? '#2563eb' : idx % 5 === 1 ? '#3b82f6' : idx % 5 === 2 ? '#1d4ed8' : idx % 5 === 3 ? '#1e40af' : '#2563eb'}
                  />
                ))}
                <LabelList
                  dataKey="obligated"
                  position="top"
                  formatter={(v: any) => `₱${(Number(v) / 1_000_000).toFixed(0)}M`}
                  style={{ fontSize: 9, fill: '#2563eb', fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
