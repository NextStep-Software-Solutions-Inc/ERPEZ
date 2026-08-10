import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppMaster } from '../types'

interface QuickActionsPanelProps {
  app: AppMaster
  onTabChange: (tab: string) => void
  isDraft: boolean
}

/**
 * Quick navigation panel for APP detail page
 * Shows workflow progress and suggested next actions
 */
export function QuickActionsPanel({ app, onTabChange, isDraft }: QuickActionsPanelProps) {
  const itemCount = app.aggregationResults?.items?.reduce((sum, item) => sum + item.items.length, 0) || 0
  const hasSignatories = app.signatories && (
    (app.signatories.preparedBy?.length ?? 0) > 0 ||
    (app.signatories.reviewedBy?.length ?? 0) > 0 ||
    (app.signatories.approvedBy?.length ?? 0) > 0 ||
    (app.signatories.certifiedBy?.length ?? 0) > 0
  )

  const steps = [
    { id: 'overview', label: 'Select PPMPs', complete: (app.ppmpIds?.length ?? 0) > 0 || (app.appPpmps?.length ?? 0) > 0 },
    { id: 'bac', label: 'Configure BAC', complete: (app.bac?.lineItems?.length ?? 0) > 0 },
    { id: 'aggregations', label: 'Review Items', complete: (app.aggregationResults?.items?.length ?? 0) > 0 },
    { id: 'signatories', label: 'Add Signatories', complete: hasSignatories },
  ]

  const nextIncompleteStep = steps.find((s) => !s.complete)
  const completedCount = steps.filter((s) => s.complete).length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="hidden lg:block sticky top-4 space-y-4">
      {/* Progress Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{completedCount} of {steps.length} steps</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step list */}
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => onTabChange(step.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className={`flex-shrink-0 ${step.complete ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.complete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1 group-hover:text-gray-900">
                  {step.label}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Step Suggestion */}
      {isDraft && nextIncompleteStep && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-900">Next Step</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => onTabChange(nextIncompleteStep.id)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2"
              size="sm"
            >
              <ArrowRight className="w-4 h-4" />
              {nextIncompleteStep.label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Items Added:</span>
            <span className="font-semibold text-gray-900">{itemCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Budget:</span>
            <span className="font-semibold text-gray-900">
              ₱{(app.bac?.totalBudget || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Signatories:</span>
            <span className="font-semibold text-gray-900">
              {(app.signatories?.preparedBy?.length ?? 0) + 
               (app.signatories?.reviewedBy?.length ?? 0) + 
               (app.signatories?.approvedBy?.length ?? 0) + 
               (app.signatories?.certifiedBy?.length ?? 0)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
