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
import { Target, ChevronDown, ChevronUp, Layers } from 'lucide-react'
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
          <div className="h-36 w-36 rounded-full bg-gray-200 mx-auto" />
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded" />
            <div className="h-7 bg-gray-200 rounded" />
            <div className="h-7 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-3">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-md p-2.5 text-xs">
        <p className="font-semibold text-gray-800">{data.name} KPIs</p>
        <p className="text-gray-500 mt-0.5 font-normal">
          <span className="font-semibold text-gray-900">{data.value} KPIs</span> ({data.payload.percent}%)
        </p>
      </div>
    )
  }
  return null
}

export function KPIClassification({ data, isLoading }: KPIClassificationProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (type: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })

  if (isLoading || !data) {
    return (
      <Card className="h-full border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">KPI Classification</CardTitle>
          <CardDescription className="text-xs text-gray-500 font-normal">Strategic, Core &amp; Support distribution</CardDescription>
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
    <Card className="h-full flex flex-col justify-between border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm font-semibold text-gray-900">
            KPI Classification &amp; Office Allocation
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded text-[11px]">
              {data.total} Active KPIs
            </span>
            <span className="text-gray-400 font-normal text-[11px]">
              FY {data.fiscalYear}
            </span>
          </div>
        </div>
        <CardDescription className="text-xs text-gray-500 font-normal">
          Distribution of institutional indicators across Strategic, Core, and Support functions
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        {!hasKPIs ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/40">
            <Layers className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs font-medium text-gray-600">No active KPIs encoded for FY {data.fiscalYear}</p>
            <p className="text-[11px] text-gray-400 font-normal mt-0.5">
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
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-900 leading-none">{data.total}</span>
                  <span className="text-[9px] uppercase tracking-wider font-medium text-gray-400 mt-0.5">KPIs</span>
                </div>
              </div>

              {/* Classification Category Cards */}
              <div className="w-full space-y-1.5 mt-3">
                {data.items.map((item) => (
                  <div
                    key={item.type}
                    className="p-2 rounded-lg border border-gray-100 bg-gray-50/40 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 font-normal text-[11px]">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL: Secondary Office Allocation Breakdown (7 Cols) ───────────── */}
            <div className="lg:col-span-7 space-y-3 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-5 pt-3 lg:pt-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Office Assignment Distribution
                </span>
                <span className="text-[10px] text-gray-400 font-normal">
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
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-50">
                        <span className="font-medium text-gray-800">
                          {item.label} ({totalAssignments} assigned)
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {sorted.length} {sorted.length === 1 ? 'office' : 'offices'}
                        </span>
                      </div>

                      {displayRows.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic py-0.5 font-normal">No office assignments recorded.</p>
                      ) : (
                        <div className="space-y-1.5 pt-0.5">
                          {displayRows.map((div, rankIdx) => {
                            const rank = rankIdx + 1
                            const fillPct = (div.count / maxCount) * 100
                            const divPct = div.sharePercentage ?? (totalAssignments > 0 ? Math.round((div.count / totalAssignments) * 100) : 0)

                            return (
                              <div key={div.name} className="flex items-center gap-2">
                                <span
                                  className="text-[9px] font-semibold w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 leading-none bg-gray-100 text-gray-500"
                                >
                                  {rank}
                                </span>
                                <span className="text-[11px] text-gray-600 w-28 flex-shrink-0 truncate font-normal" title={div.name}>
                                  {div.name}
                                </span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${fillPct}%`,
                                      backgroundColor: item.color,
                                    }}
                                  />
                                </div>
                                <div className="flex items-baseline gap-1 flex-shrink-0 w-14 justify-end text-xs">
                                  <span className="text-[11px] font-semibold text-gray-800">{div.count}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">({divPct}%)</span>
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
                          className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
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
