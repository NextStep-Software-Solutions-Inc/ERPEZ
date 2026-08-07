/**
 * KPI Classification — Strategic, Core & Support
 *
 * Full-width dashboard card showing KPI breakdown by classification type
 * (Strategic / Core / Support) with a donut chart, health-status badges,
 * and a per-division bar breakdown.
 *
 * Right-panel division lists support agencies with many offices:
 * - Top 5 rows visible by default with rank numbers
 * - "See all X offices" expand button with smooth CSS transition
 * - Compact h-1.5 bars with percentage text flushed right
 *
 * @module features/planning/dashboard/components/charts/KPIClassification
 */

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, ChevronDown, ChevronUp } from 'lucide-react'
import type { KPIClassificationData } from '../../types'

interface KPIClassificationProps {
  data: KPIClassificationData | null
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="flex gap-6">
            <div className="h-40 w-40 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
              <div className="h-3 w-4/5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function KPIClassification({ data, isLoading }: KPIClassificationProps) {
  // Track which classification types have their division list expanded
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (type: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <CardTitle>KPI Classification</CardTitle>
          </div>
          <CardDescription>Strategic, Core &amp; Support — KPIs by division &amp; type</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const ROWS_INITIAL = 5  // default visible rows before expand

  const pieData = data.items.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <CardTitle>KPI Classification</CardTitle>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
            FY {data.fiscalYear}
          </span>
        </div>
        <CardDescription>Strategic, Core &amp; Support — KPIs by division &amp; type</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT PANEL ─────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              KPI breakdown by classification
              <span className="ml-2 text-[11px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {data.total} total
              </span>
            </h3>

            {/* Donut chart + legend — stacked vertically so donut scales to fill available space */}
            <div className="flex flex-col items-center gap-5">
              {/* Responsive donut: grows up to 240px on wide screens */}
              <div className="relative w-full max-w-[240px] aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="58%"
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
                  <span className="text-3xl font-bold text-gray-900">{data.total}</span>
                  <span className="text-[10px] text-gray-400">KPIs</span>
                </div>
              </div>

              {/* Classification legend — horizontal row when donut is stacked */}
              <div className="w-full space-y-2.5">
                {data.items.map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.count}</span>
                      <span className="text-xs text-gray-400">{item.percent}%</span>
                    </div>
                    <p className="text-[11px] text-gray-400 hidden lg:block ml-auto">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health status boxes */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-3">KPI health status per classification</p>
              <div className="grid grid-cols-3 gap-2">
                {data.items.map((item) => (
                  <div
                    key={item.type}
                    className="rounded-xl p-3 text-center border"
                    style={{
                      backgroundColor: `${item.color}12`,
                      borderColor: `${item.color}30`,
                    }}
                  >
                    <p className="text-[11px] font-semibold text-gray-600">{item.label}</p>
                    <p
                      className="text-2xl font-bold mt-1 leading-none"
                      style={{ color: item.color }}
                    >
                      {item.activeCount}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      active / {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Classification detail — KPIs by division &amp; type
            </h3>

            {/*
             * Per-classification division breakdown.
             * Each section shows the top ROWS_INITIAL divisions by default.
             * When there are more, a "See all X offices" button expands to
             * reveal the full list with a smooth max-height transition.
             * Rank pill (#1, #2 …) provides quick visual context for agencies
             * with 15+ offices.
             */}
            <div className="space-y-5">
              {data.items.map((item) => {
                // Sort descending by count so rank #1 = highest
                const sorted = [...item.divisions].sort((a, b) => b.count - a.count)
                const maxCount = sorted[0]?.count || 1
                const isExpanded = expanded.has(item.type)
                const displayRows = isExpanded ? sorted : sorted.slice(0, ROWS_INITIAL)
                const hasMore = sorted.length > ROWS_INITIAL

                return (
                  <div key={item.type}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold" style={{ color: item.color }}>
                        {item.label} KPIs
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {sorted.length} {sorted.length === 1 ? 'office' : 'offices'}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${item.color}18`, color: item.color }}
                        >
                          {item.count} KPIs · {item.percent}%
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">{item.description}</p>

                    {/* Division rows */}
                    <div className="space-y-1.5">
                      {displayRows.map((div, rankIdx) => {
                        const rank = rankIdx + 1
                        const fillPct = (div.count / maxCount) * 100
                        const divPct = item.count > 0 ? Math.round((div.count / item.count) * 100) : 0
                        return (
                          <div key={div.name} className="flex items-center gap-2">
                            {/* Rank pill */}
                            <span
                              className="text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 leading-none"
                              style={{
                                backgroundColor: rank <= 3 ? `${item.color}22` : '#f3f4f6',
                                color: rank <= 3 ? item.color : '#9ca3af',
                              }}
                            >
                              {rank}
                            </span>
                            {/* Office name */}
                            <span className="text-[11px] text-gray-600 w-24 flex-shrink-0 truncate">
                              {div.name}
                            </span>
                            {/* Bar */}
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${fillPct}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                            {/* Count + % */}
                            <div className="flex items-baseline gap-1 flex-shrink-0 w-12 justify-end">
                              <span className="text-[11px] font-bold text-gray-800">{div.count}</span>
                              <span className="text-[9px] text-gray-400 font-medium">{divPct}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Expand / collapse toggle */}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.type)}
                        className="mt-2 flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                        style={{ color: item.color }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            See all {sorted.length} offices
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
      </CardContent>
    </Card>
  )
}
