/**
 * OPCR Planned vs Actual Chart
 *
 * Displays monthly comparison of planned vs actual OPCR completion rates
 * using a ComposedChart with Area fills and prominent scatter-style dots.
 * Blue = Planned (solid), Green = Actual (dashed).
 *
 * @module features/planning/dashboard/components/charts/OPCRLineChart
 */

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { OPCRChartData } from '../../types'

/** Explicit colors — avoids CSS-var resolution failures in SVG context */
const PLANNED_COLOR = '#3b82f6' // blue-500
const ACTUAL_COLOR = '#10b981'  // emerald-500

interface OPCRLineChartProps {
  data: OPCRChartData
  isLoading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 animate-pulse rounded-lg">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const planned = payload.find((p: any) => p.dataKey === 'planned')
    const actual = payload.find((p: any) => p.dataKey === 'actual')
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[140px]">
        <p className="font-semibold text-gray-900 mb-1.5">{label}</p>
        {planned && (
          <p className="text-sm flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLANNED_COLOR }} />
            <span className="text-gray-600">Planned:</span>
            <span className="font-bold" style={{ color: PLANNED_COLOR }}>{planned.value}%</span>
          </p>
        )}
        {actual && (
          <p className="text-sm flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACTUAL_COLOR }} />
            <span className="text-gray-600">Actual:</span>
            <span className="font-bold" style={{ color: ACTUAL_COLOR }}>{actual.value}%</span>
          </p>
        )}
        {planned && actual && (
          <p className="text-xs text-gray-400 mt-1.5 pt-1.5 border-t border-gray-100">
            Gap: {(planned.value - actual.value).toFixed(1)}%
          </p>
        )}
      </div>
    )
  }
  return null
}

export function OPCRLineChart({ data, isLoading }: OPCRLineChartProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OPCR Planned vs Actual</CardTitle>
          <CardDescription>Monthly commitment completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OPCR Planned vs Actual</CardTitle>
        <CardDescription>
          Monthly commitment completion rates (%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PLANNED_COLOR} stopOpacity={0.15} />
                <stop offset="95%" stopColor={PLANNED_COLOR} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACTUAL_COLOR} stopOpacity={0.15} />
                <stop offset="95%" stopColor={ACTUAL_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs font-medium text-gray-700">{value}</span>
              )}
            />
            {/* Planned — solid blue line + fill */}
            <Area
              type="monotone"
              dataKey="planned"
              stroke={PLANNED_COLOR}
              strokeWidth={2.5}
              fill="url(#plannedGradient)"
              dot={{ r: 5, fill: PLANNED_COLOR, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: PLANNED_COLOR, stroke: '#fff', strokeWidth: 2 }}
              name="Planned"
            />
            {/* Actual — dashed green line + fill */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke={ACTUAL_COLOR}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              fill="url(#actualGradient)"
              dot={{ r: 5, fill: ACTUAL_COLOR, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: ACTUAL_COLOR, stroke: '#fff', strokeWidth: 2 }}
              name="Actual"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
