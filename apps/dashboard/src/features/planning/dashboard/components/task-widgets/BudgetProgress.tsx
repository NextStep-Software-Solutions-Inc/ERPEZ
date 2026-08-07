/**
 * Budget Progress Widget
 * 
 * Displays UACS utilization percentage with progress bar
 * for Budget-related tasks (Line-Item Budgeting).
 * 
 * @module features/planning/dashboard/components/task-widgets/BudgetProgress
 */

import type { BudgetTaskMetadata } from '../../types'
import { Progress } from '@/components/ui/progress'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface BudgetProgressProps {
  metadata: BudgetTaskMetadata
}

export function BudgetProgress({ metadata }: BudgetProgressProps) {
  const { uacsCode, uacsDescription, utilizationPercent, utilizedAmount, allocatedAmount } = metadata

  const statusColor =
    utilizationPercent > 90 ? 'text-red-600' : utilizationPercent > 75 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* UACS Code and Description */}
      <div className="mb-2">
        <div className="text-xs font-mono font-bold text-gray-900">{uacsCode}</div>
        <div className="text-xs text-gray-600 truncate">{uacsDescription}</div>
      </div>

      {/* Utilization Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-600">Utilization</div>
        <div className={`text-sm font-bold ${statusColor}`}>
          {utilizationPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={utilizationPercent} className="h-2 mb-3" />

      {/* Budget Amounts */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500">Utilized: </span>
          <span className="font-semibold text-blue-600">
            {formatCurrencyAbbr(utilizedAmount)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Allocated: </span>
          <span className="font-semibold text-gray-900">
            {formatCurrencyAbbr(allocatedAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}
