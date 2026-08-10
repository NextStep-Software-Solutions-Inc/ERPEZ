/**
 * Budget Utilization Heatmap
 * 
 * Displays budget utilization by department and month in a color-coded heatmap.
 * Color scale: <40% light, 40-70% medium, >70% dark.
 * 
 * @module features/planning/dashboard/components/charts/BudgetHeatmap
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BudgetHeatmapData } from '../../types'

interface BudgetHeatmapProps {
  data: BudgetHeatmapData
  isLoading?: boolean
}

/**
 * Get intensity class for more granular color coding
 */
function getIntensityClass(percent: number): string {
  if (percent < 20) return 'bg-blue-50 text-blue-600'
  if (percent < 40) return 'bg-blue-100 text-blue-700'
  if (percent < 55) return 'bg-yellow-100 text-yellow-700'
  if (percent < 70) return 'bg-yellow-200 text-yellow-800'
  if (percent < 85) return 'bg-green-200 text-green-800'
  return 'bg-green-300 text-green-900'
}

/**
 * Loading skeleton for heatmap
 */
function HeatmapSkeleton() {
  return (
    <div className="w-full h-[350px] flex items-center justify-center bg-gray-50 animate-pulse rounded-lg">
      <div className="text-gray-400">Loading heatmap...</div>
    </div>
  )
}

export function BudgetHeatmap({ data, isLoading }: BudgetHeatmapProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization Heatmap</CardTitle>
          <CardDescription>Department spending by month (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Extract unique departments and months
  const departments = Array.from(new Set(data.map((d) => d.department)))
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Create lookup map for quick access
  const dataMap = new Map<string, number>()
  data.forEach((item) => {
    const key = `${item.department}-${item.month}`
    dataMap.set(key, item.utilizationPercent)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Utilization Heatmap</CardTitle>
        <CardDescription>
          Department spending by month (%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row with months */}
            <div className="flex gap-1 mb-1">
              <div className="w-40 flex-shrink-0" /> {/* Spacer for department column */}
              {months.map((month) => (
                <div
                  key={month}
                  className="flex-1 text-center text-xs font-semibold text-gray-600 min-w-[50px]"
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {departments.map((department) => (
              <div key={department} className="flex gap-1 mb-1">
                {/* Department label */}
                <div className="w-40 flex-shrink-0 text-xs font-medium text-gray-700 flex items-center pr-2">
                  {department}
                </div>

                {/* Utilization cells */}
                {months.map((month) => {
                  const key = `${department}-${month}`
                  const value = dataMap.get(key) || 0
                  const colorClass = getIntensityClass(value)

                  return (
                    <div
                      key={month}
                      className={`flex-1 min-w-[50px] aspect-square flex items-center justify-center rounded text-xs font-semibold ${colorClass} hover:ring-2 hover:ring-gray-400 transition-all cursor-pointer`}
                      title={`${department} - ${month}: ${value.toFixed(1)}%`}
                    >
                      {value.toFixed(0)}
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Color scale legend */}
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600">
                Utilization:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-blue-100 rounded" />
                  <span className="text-xs text-gray-600">&lt;40%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-yellow-200 rounded" />
                  <span className="text-xs text-gray-600">40-70%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-green-300 rounded" />
                  <span className="text-xs text-gray-600">&gt;70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
