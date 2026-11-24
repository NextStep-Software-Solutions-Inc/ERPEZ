import { CheckCircle2, Circle, ArrowRight, Check } from 'lucide-react'
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
  const itemCount = app.aggregationResults?.items?.reduce((sum, item) => sum + item.items.length, 0) || app.bac?.lineItems?.length || 0
  const ppmpSourceCount = app.ppmpIds?.length || app.appPpmps?.length || 0
  const totalBudget = app.aggregationResults?.totalAmount ?? app.bac?.totalBudget ?? 0

  const hasSignatories = app.signatories && (
    (app.signatories.preparedBy?.length ?? 0) > 0 ||
    (app.signatories.reviewedBy?.length ?? 0) > 0 ||
    (app.signatories.approvedBy?.length ?? 0) > 0 ||
    (app.signatories.certifiedBy?.length ?? 0) > 0
  )

  const signatoryCount = (app.signatories?.preparedBy?.length ?? 0) + 
    (app.signatories?.reviewedBy?.length ?? 0) + 
    (app.signatories?.approvedBy?.length ?? 0) + 
    (app.signatories?.certifiedBy?.length ?? 0)

  // 3-Step Representative Workflow
  const steps = [
    {
      id: 'overview',
      label: 'Select PPMPs',
      complete: ppmpSourceCount > 0,
    },
    {
      id: 'bac',
      label: 'Configure APP Items',
      complete: (app.bac?.lineItems?.length ?? 0) > 0,
    },
    {
      id: 'signatories',
      label: 'Add Signatories',
      complete: hasSignatories,
    },
  ]

  const nextIncompleteStep = steps.find((s) => !s.complete)
  const completedCount = steps.filter((s) => s.complete).length
  
  // Status-aware progress consistency
  const isPostDraft = app.status === 'Submitted' || app.status === 'Approved' || app.status === 'Locked'
  const progress = isPostDraft ? 100 : Math.round((completedCount / steps.length) * 100)
  const isFullyComplete = progress === 100 || completedCount === steps.length

  return (
    <div className="hidden lg:block sticky top-4 space-y-4">
      {/* Workflow Progress Summary Card */}
      <Card className="border border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/80">
          <CardTitle className="text-sm font-semibold text-slate-900">
            {isPostDraft ? 'Workflow Complete' : 'Workflow Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">
                {isFullyComplete ? '3 of 3 steps complete' : `${completedCount} of ${steps.length} steps complete`}
              </span>
              <span className="font-bold text-purple-700">{progress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step list */}
          <div className="space-y-1.5 pt-1">
            {steps.map((step) => {
              const isStepDone = isPostDraft || step.complete
              return (
                <button
                  key={step.id}
                  onClick={() => onTabChange(step.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50/60 transition-colors text-left group"
                >
                  <div className={`flex-shrink-0 ${isStepDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isStepDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 flex-1 group-hover:text-purple-900">
                    {step.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            })}
          </div>

          {/* Completion Confirmation Callout */}
          {isFullyComplete && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>APP setup complete</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Step Suggestion (Draft only if incomplete) */}
      {isDraft && nextIncompleteStep && (
        <Card className="border-purple-200 bg-purple-50/50 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Next Action</CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4">
            <Button
              onClick={() => onTabChange(nextIncompleteStep.id)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white gap-2 text-xs font-semibold shadow-xs"
              size="sm"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Go to {nextIncompleteStep.label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Clear Summary Panel */}
      <Card className="border border-slate-200 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/80">
          <CardTitle className="text-sm font-semibold text-slate-900">Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">APP Items:</span>
            <span className="font-bold text-slate-900">{itemCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">PPMP Sources:</span>
            <span className="font-bold text-slate-900">{ppmpSourceCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">Total Budget:</span>
            <span className="font-bold text-emerald-800">
              ₱{totalBudget.toLocaleString('en-PH')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-semibold">Signatories:</span>
            <span className="font-bold text-slate-900">{signatoryCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
