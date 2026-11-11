/**
 * OPCR Mini Chart Widget
 * 
 * Displays a mini line chart showing planned vs actual completion rates
 * for OPCR-related tasks in the Smart Task Card.
 * 
 * @module features/planning/dashboard/components/task-widgets/OpcrMiniChart
 */

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { OPCRTaskMetadata } from '../../types'

interface OpcrMiniChartProps {
  metadata: OPCRTaskMetadata
}

export function OpcrMiniChart({ metadata }: OpcrMiniChartProps) {
  const { plannedCompletion, actualCompletion, chartData } = metadata

  const gap = plannedCompletion - actualCompletion
  const gapColor =
    gap > 5
      ? 'text-red-600 dark:text-red-400'
      : gap > 0
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="mt-3 p-3 bg-muted/40 dark:bg-slate-800/55 rounded-lg border border-border/70">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-muted-foreground">Completion Rate</div>
        <div className="flex items-center gap-3 tabular-nums">
          <div className="text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{plannedCompletion}%</span>
            <span className="text-muted-foreground ml-1">Planned</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{actualCompletion}%</span>
            <span className="text-muted-foreground ml-1">Actual</span>
          </div>
        </div>
      </div>

      {/* Mini Line Chart */}
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gap Indicator */}
      <div className="mt-2 text-xs tabular-nums">
        <span className="text-muted-foreground">Gap: </span>
        <span className={`font-semibold ${gapColor}`}>
          {gap > 0 ? `${gap.toFixed(1)}% behind` : gap < 0 ? `${Math.abs(gap).toFixed(1)}% ahead` : 'On track'}
        </span>
      </div>
    </div>
  )
}
