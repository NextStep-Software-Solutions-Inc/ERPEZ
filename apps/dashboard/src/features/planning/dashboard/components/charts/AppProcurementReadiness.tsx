/**
 * APP Procurement Readiness by Stage
 *
 * Displays Annual Procurement Plan readiness using a RadialBarChart to
 * distinguish visually from the bar-based UACS Obligation chart.
 * Stages shown as concentric rings; procurement modes as a 2×2 metric grid.
 *
 * @module features/planning/dashboard/components/charts/AppProcurementReadiness
 */

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import type { AppProcurementReadinessData } from '../../types'

interface AppProcurementReadinessProps {
  data: AppProcurementReadinessData | null
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="w-full h-[380px] flex items-center justify-center bg-gray-50 animate-pulse rounded-lg">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )
}

const statusConfig = {
  'on-track': { label: 'On Track', color: 'success' as const },
  'below-target': { label: 'Below target', color: 'destructive' as const },
  'at-risk': { label: 'At Risk', color: 'warning' as const },
}

export function AppProcurementReadiness({
  data,
  isLoading,
}: AppProcurementReadinessProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-violet-500" />
            <CardTitle>APP Procurement Readiness</CardTitle>
          </div>
          <CardDescription>Stage-by-stage readiness overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[data.overallStatus]

  // RadialBarChart renders first item at innermost ring — reverse so highest % is outermost
  const radialData = [...data.stages].reverse().map((stage) => ({
    name: stage.label,
    value: stage.percent,
    fill: stage.color,
  }))

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart className="h-4 w-4 text-violet-500 flex-shrink-0" />
            <CardTitle>APP Procurement Readiness</CardTitle>
          </div>
          <Badge color={status.color} variant="soft" className="text-xs font-semibold flex-shrink-0">
            {status.label}
          </Badge>
        </div>
        <CardDescription>Stage-by-stage readiness overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radial chart + stage legend side by side */}
        <div className="flex items-center gap-4">
          {/* Concentric ring chart */}
          <div className="w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius={18}
                outerRadius={86}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: '#f3f4f6' }}
                  dataKey="value"
                  angleAxisId={0}
                  cornerRadius={3}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage legend */}
          <div className="flex-1 space-y-2.5">
            {data.stages.map((stage) => (
              <div key={stage.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-xs text-gray-700 truncate">{stage.label}</span>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: stage.color }}>
                  {stage.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement mode — 2×2 metric tiles */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2.5">By procurement mode (RA 9184)</p>
          <div className="grid grid-cols-2 gap-2">
            {data.byMode.map((mode) => (
              <div
                key={mode.mode}
                className="rounded-xl p-3 border border-gray-100 bg-gray-50 hover:bg-white transition-colors"
              >
                <p className="text-[11px] font-medium text-gray-600 leading-tight mb-2">
                  {mode.mode}
                </p>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${mode.percent}%`, backgroundColor: mode.color }}
                    />
                  </div>
                </div>
                <span className="text-base font-bold" style={{ color: mode.color }}>
                  {mode.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
