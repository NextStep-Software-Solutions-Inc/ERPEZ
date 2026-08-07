/**
 * MFO Status Chips Widget
 * 
 * Displays status chips showing MFO output counts
 * (Completed, Ongoing, Delayed) for Strategy-related tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/MfoStatusChips
 */

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { StrategyTaskMetadata } from '../../types'

interface MfoStatusChipsProps {
  metadata: StrategyTaskMetadata
}

export function MfoStatusChips({ metadata }: MfoStatusChipsProps) {
  const { mfoName, status, completedCount, ongoingCount, delayedCount } = metadata

  const totalOutputs = completedCount + ongoingCount + delayedCount

  // Overall status styling
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800 border-green-300', label: 'On Track' },
    ongoing: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Progress' },
    delayed: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Delayed' },
  }

  const currentStatus = statusConfig[status]

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* MFO Name */}
      <div className="mb-2">
        <div className="text-xs font-medium text-gray-600">MFO Reference</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{mfoName}</div>
      </div>

      {/* Overall Status Badge */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className={`${currentStatus.color} border`}
        >
          {currentStatus.label}
        </Badge>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {/* Completed */}
        <div className="flex flex-col items-center p-2 bg-white rounded border border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600 mb-1" />
          <div className="text-lg font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>

        {/* Ongoing */}
        <div className="flex flex-col items-center p-2 bg-white rounded border border-blue-200">
          <Clock className="h-4 w-4 text-blue-600 mb-1" />
          <div className="text-lg font-bold text-blue-600">{ongoingCount}</div>
          <div className="text-xs text-gray-600">Ongoing</div>
        </div>

        {/* Delayed */}
        <div className="flex flex-col items-center p-2 bg-white rounded border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 mb-1" />
          <div className="text-lg font-bold text-red-600">{delayedCount}</div>
          <div className="text-xs text-gray-600">Delayed</div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-2 text-xs text-center text-gray-600">
        Total Outputs: <span className="font-semibold">{totalOutputs}</span>
      </div>
    </div>
  )
}
