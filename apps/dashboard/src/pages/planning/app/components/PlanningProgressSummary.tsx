/**
 * Planning Progress Summary
 * 
 * Displays the current status of the planning workflow.
 * Shows fiscal year, activated KPIs count, and target distribution status.
 */

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AppFiscalYear, ActivatedKPI, KPITarget } from '@/features/planning/annual-performance-planning/appTypes'

interface PlanningProgressSummaryProps {
  selectedFY?: AppFiscalYear
  activatedKPIs: ActivatedKPI[]
  savedTargets: KPITarget[]
  isCompleted: boolean
  expandedTab?: 1 | 2 | 3
}

export function PlanningProgressSummary({
  selectedFY,
  activatedKPIs,
  savedTargets,
  isCompleted,
  expandedTab,
}: PlanningProgressSummaryProps) {
  if (!selectedFY) return null

  return (
    <Card
      className={cn(
        'bg-gradient-to-r border-blue-200',
        isCompleted
          ? 'from-green-50 to-emerald-50 border-green-300'
          : 'from-blue-50 to-purple-50'
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Planning Progress</CardTitle>
          {isCompleted && (
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
              ✅ Workflow Completed
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {/* Fiscal Year Card */}
          <div className="flex flex-col p-3 rounded-lg bg-white bg-opacity-60">
            <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">
              Fiscal Year
            </span>
            <span className="font-semibold text-lg text-blue-600 mt-1">
              FY {selectedFY.year}
            </span>
          </div>

          {/* KPIs Activated Card */}
          <div className="flex flex-col p-3 rounded-lg bg-white bg-opacity-60">
            <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">
              KPIs Activated
            </span>
            <span className="font-semibold text-lg text-purple-600 mt-1">
              {activatedKPIs.length}
            </span>
          </div>

          {/* Targets Status Card */}
          <div className="flex flex-col p-3 rounded-lg bg-white bg-opacity-60">
            <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">
              Targets Status
            </span>
            <span
              className={cn(
                'font-semibold text-lg mt-1',
                isCompleted ? 'text-green-600' : 'text-gray-600'
              )}
            >
              {isCompleted
                ? '✅ Completed'
                : expandedTab === 3
                  ? '⏳ In Progress'
                  : '⏱️ Pending'}
            </span>
          </div>
        </div>

        {/* Completion Summary */}
        {isCompleted && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">
              Workflow Summary
            </h4>
            <div className="space-y-2 text-sm text-green-800">
              <p>✓ Fiscal Year FY {selectedFY.year} selected</p>
              <p>✓ {activatedKPIs.length} KPIs activated</p>
              <p>✓ {savedTargets.length} target values configured</p>
              <p className="mt-3 font-medium text-green-900">
                Planning workflow is ready for submission. All steps completed
                successfully!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
