/**
 * WFP Budget Bar Widget
 * 
 * Displays budget utilization progress bar and remaining balance
 * for WFP (Externally Funded Projects) tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/WfpBudgetBar
 */

import type { WFPTaskMetadata } from '../../types'
import { Progress } from '@/components/ui/progress'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface WfpBudgetBarProps {
  metadata: WFPTaskMetadata
}

export function WfpBudgetBar({ metadata }: WfpBudgetBarProps) {
  const { totalBudget, utilizedBudget, remainingBudget, utilizationPercent } = metadata

  const statusColor =
    utilizationPercent > 85 ? 'text-red-600' : utilizationPercent > 70 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-600">Budget Utilization</div>
        <div className={`text-sm font-bold ${statusColor}`}>
          {utilizationPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={utilizationPercent} className="h-2 mb-3" />

      {/* Budget Details */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500">Total Budget</div>
          <div className="font-semibold text-gray-900">
            {formatCurrencyAbbr(totalBudget)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Utilized</div>
          <div className="font-semibold text-blue-600">
            {formatCurrencyAbbr(utilizedBudget)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Remaining</div>
          <div className="font-semibold text-green-600">
            {formatCurrencyAbbr(remainingBudget)}
          </div>
        </div>
      </div>
    </div>
  )
}
