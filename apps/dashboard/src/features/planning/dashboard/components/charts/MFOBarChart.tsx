/**
 * MFO Reference Status Bar Chart
 * 
 * Displays stacked bar chart showing quarterly MFO output status
 * (Completed, Ongoing, Pending) using Recharts.
 * 
 * @module features/planning/dashboard/components/charts/MFOBarChart
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MFOStatusData } from '../../types'

interface MFOBarChartProps {
  data: MFOStatusData[]
  isLoading?: boolean
}

/**
 * Loading skeleton for chart
 */
function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 animate-pulse rounded-lg">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  )
}

/**
 * Custom tooltip for MFO status breakdown
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, item: any) => sum + item.value, 0)
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
          </p>
        ))}
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
          Total: {total} outputs
        </p>
      </div>
    )
  }
  return null
}

export function MFOBarChart({ data, isLoading }: MFOBarChartProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MFO Reference Status</CardTitle>
          <CardDescription>Strategic output completion by quarter</CardDescription>
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
        <CardTitle>MFO Reference Status</CardTitle>
        <CardDescription>Strategic output completion by quarter</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="category"
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="completed"
              fill="#10b981"
              name="Completed"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="ongoing"
              fill="#3b82f6"
              name="Ongoing"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="pending"
              fill="#f59e0b"
              name="Pending"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
