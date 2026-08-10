/**
 * PPMP Progress Widget
 * 
 * Displays PPMP/APP consolidation progress with donut-style
 * progress indicator for Procurement-related tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/PpmpProgress
 */

import { Progress } from '@/components/ui/progress'
import { Package } from 'lucide-react'
import type { ProcurementTaskMetadata } from '../../types'

interface PpmpProgressProps {
  metadata: ProcurementTaskMetadata
}

export function PpmpProgress({ metadata }: PpmpProgressProps) {
  const { ppmpTitle, progressPercent, totalItems, consolidatedItems } = metadata

  const remainingItems = totalItems - consolidatedItems

  const statusColor =
    progressPercent >= 80 ? 'text-green-600' : progressPercent >= 50 ? 'text-blue-600' : 'text-yellow-600'

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* PPMP Title */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-600 mb-1">PPMP Title</div>
        <div className="text-sm font-semibold text-gray-900 line-clamp-2">
          {ppmpTitle}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            Consolidation Progress
          </span>
        </div>
        <div className={`text-lg font-bold ${statusColor}`}>
          {progressPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-3 mb-3" />

      {/* Item Counts */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-white rounded border border-gray-200">
          <div className="text-lg font-bold text-gray-900">{totalItems}</div>
          <div className="text-gray-600">Total Items</div>
        </div>
        <div className="text-center p-2 bg-white rounded border border-green-200">
          <div className="text-lg font-bold text-green-600">{consolidatedItems}</div>
          <div className="text-gray-600">Consolidated</div>
        </div>
        <div className="text-center p-2 bg-white rounded border border-yellow-200">
          <div className="text-lg font-bold text-yellow-600">{remainingItems}</div>
          <div className="text-gray-600">Remaining</div>
        </div>
      </div>
    </div>
  )
}
