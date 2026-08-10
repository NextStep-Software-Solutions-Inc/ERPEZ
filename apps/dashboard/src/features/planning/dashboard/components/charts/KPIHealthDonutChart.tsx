/**
 * KPI Library Health Donut Chart
 *
 * Displays KPI distribution by status (Active, Validated, Pending, Inactive).
 * Legend tiles are rendered as a single 4-column row so the bottom aligns
 * with adjacent cards in the same grid row.
 * Hover state is tracked in React — no Recharts Tooltip — so the centre
 * label is never obscured.
 *
 * @module features/planning/dashboard/components/charts/KPIHealthDonutChart
 */

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { KPIHealthData } from '../../types'

interface KPIHealthDonutChartProps {
  data: KPIHealthData
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col flex-1 space-y-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="h-44 w-44 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function KPIHealthDonutChart({ data, isLoading }: KPIHealthDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (isLoading || data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>KPI Library Health</CardTitle>
          <CardDescription>Distribution by status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 pb-6">
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: item.color,
    totalCount: total,
  }))

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>KPI Library Health</CardTitle>
        <CardDescription>Distribution by status</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pb-6 space-y-4">

        {/* Donut — no Tooltip; hover reflected in tiles below */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-44 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex !== null && activeIndex !== index ? 0.35 : 1}
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centre — never obscured */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeIndex !== null ? (
                <>
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{ color: chartData[activeIndex].color }}
                  >
                    {chartData[activeIndex].value}
                  </span>
                  <span
                    className="text-[11px] font-semibold mt-0.5"
                    style={{ color: chartData[activeIndex].color }}
                  >
                    {((chartData[activeIndex].value / total) * 100).toFixed(0)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900 leading-none">{total}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">total KPIs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/*
         * Single 4-column row of legend tiles.
         * mt-auto pins this row to the card bottom so it aligns with the
         * metric tiles in the adjacent PPMP Consolidation card.
         */}
        <div className="grid grid-cols-4 gap-2 mt-auto">
          {chartData.map((item, index) => {
            const pct = ((item.value / total) * 100).toFixed(0)
            const isActive = activeIndex === index
            return (
              <div
                key={item.name}
                className={cn(
                  'flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer',
                  'transition-all duration-150 text-center',
                  isActive ? 'shadow-md scale-[1.04]' : 'hover:scale-[1.02]',
                )}
                style={{
                  backgroundColor: isActive ? `${item.color}1e` : `${item.color}0d`,
                  borderColor: isActive ? `${item.color}55` : `${item.color}28`,
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Colour dot */}
                <div className="h-2 w-2 rounded-full mx-auto mb-1.5" style={{ backgroundColor: item.color }} />
                <p className="text-[10px] text-gray-500 leading-tight truncate w-full text-center font-medium">
                  {item.name}
                </p>
                <div className="flex items-baseline gap-1 justify-center mt-0.5">
                  <span className="text-lg font-bold text-gray-900 leading-none">{item.value}</span>
                  <span className="text-[10px] font-semibold" style={{ color: item.color }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}
