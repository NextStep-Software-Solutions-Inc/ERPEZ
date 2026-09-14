import React from 'react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Send,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OPCR, OPCRDetails } from '../types/type.opcr'
import { evaluateOPCRReadiness } from '../utils/opcrReadinessUtils'
import { formatCurrencyPHP } from '@/utils/formatters'

interface OPCRReadinessCardProps {
  opcr: OPCRDetails | OPCR | undefined
  isLoading?: boolean
  onOpenSubmit?: () => void
  onOpenApprove?: () => void
  onOpenReturn?: () => void
  isSubmitting?: boolean
}

export const OPCRReadinessCard: React.FC<OPCRReadinessCardProps> = ({
  opcr,
  isLoading = false,
  onOpenSubmit,
  onOpenApprove,
  onOpenReturn,
  isSubmitting = false,
}) => {
  if (isLoading || !opcr) {
    return (
      <Card className="border-border/80 bg-muted/20 shadow-xs mb-8">
        <CardContent className="py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Checking OPCR status...
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Loading commitment details, KPI assignments, and activities...
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Loading
          </Badge>
        </CardContent>
      </Card>
    )
  }

  const rawStatus = opcr.commitmentStatus || 'Draft'
  const normalizedStatus =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

  const readiness = evaluateOPCRReadiness(opcr)

  // 1. Submitted State (Pending Review/Approval)
  if (normalizedStatus === 'Submitted') {
    return (
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/40 shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-indigo-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <CardTitle className="text-base font-bold text-indigo-950">
                  Submitted — Pending Review & Approval
                </CardTitle>
                <p className="text-xs text-indigo-700 mt-0.5">
                  This OPCR has been submitted and is currently in the Approval Workflow queue awaiting review and approval by the Planning Office.
                </p>
              </div>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold px-3 py-1 text-xs">
              Pending Approval
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Total Allotted Budget:</span>
              <span>{formatCurrencyPHP(readiness.totalBudget)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Commitment Scope:</span>
              <span>
                {readiness.kpiCount} KPIs • {readiness.activityCount} Activities
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenReturn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenReturn}
                disabled={isSubmitting}
                className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                <X className="w-4 h-4" />
                Return for Revision
              </Button>
            )}
            {onOpenApprove && (
              <Button
                size="sm"
                onClick={onOpenApprove}
                disabled={isSubmitting}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Check className="w-4 h-4" />
                Approve OPCR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 2. Approved State (Finalized)
  if (normalizedStatus === 'Approved') {
    return (
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 shadow-xs mb-8">
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  OPCR Approved & Finalized
                </h4>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-[10px] px-2 py-0.5">
                  Approved
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                This Office Performance Commitment and Review is finalized. Activities and targets are now active for operational monitoring and accomplishment rating.
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs text-emerald-700 font-semibold block">Total Approved Budget</span>
            <span className="text-sm font-bold text-emerald-950">
              {formatCurrencyPHP(readiness.totalBudget)}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 3. Returned State (Needs Revision)
  if (normalizedStatus === 'Returned') {
    return (
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50/70 to-orange-50/40 shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-rose-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <CardTitle className="text-base font-bold text-rose-950">
                  Returned for Revision
                </CardTitle>
                <p className="text-xs text-rose-700 mt-0.5">
                  This OPCR was returned during review. Please make the required adjustments to your targets and activities, then resubmit for approval.
                </p>
              </div>
            </div>
            <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-semibold px-3 py-1 text-xs">
              Returned
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {!readiness.isReady ? (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-rose-900 uppercase tracking-wider">
                Outstanding Issues ({readiness.errors.length})
              </h5>
              <ul className="space-y-1.5 pl-1">
                {readiness.errors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-rose-800 font-medium">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                All requirements have been met. You can now resubmit this OPCR.
              </div>
              {onOpenSubmit && (
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={onOpenSubmit}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isSubmitting ? 'Resubmitting...' : 'Resubmit for Approval'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 4. Draft State: Ready for Submission
  if (readiness.isReady) {
    return (
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-emerald-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base font-bold text-emerald-950">
                  Ready for Submission
                </CardTitle>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Review your assigned KPIs, targets, and activities. When finalized, submit this OPCR to forward it to the Planning Office for review and approval.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold px-3 py-1 text-xs">
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-900">
              {readiness.passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              Total Budget: {formatCurrencyPHP(readiness.totalBudget)}
            </div>
          </div>
          {onOpenSubmit && (
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={onOpenSubmit}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // 5. Draft State: Incomplete (Not Ready)
  return (
    <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/50 to-white shadow-xs mb-8">
      <CardHeader className="pb-3 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <CardTitle className="text-base font-bold text-amber-950">
                Not Ready for Submission
              </CardTitle>
              <p className="text-xs text-amber-800 mt-0.5">
                Complete the items below before submitting this OPCR for approval.
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 bg-amber-50 font-semibold px-3 py-1 text-xs"
          >
            Draft • Incomplete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Missing Requirements List */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            Required Actions ({readiness.errors.length})
          </h5>
          <ul className="space-y-1.5 pl-1">
            {readiness.errors.map((err, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-amber-900 font-medium"
              >
                <span className="text-amber-500 font-bold">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Passed Requirements List */}
        {readiness.passedChecks.length > 0 && (
          <div className="pt-2 border-t border-amber-100/80">
            <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Completed Checks ({readiness.passedChecks.length})
            </h5>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              {readiness.passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-amber-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Commitment Scope: {readiness.kpiCount} KPIs • {readiness.activityCount} Activities
          </div>
          <Button
            size="sm"
            disabled={true}
            className="gap-2 bg-slate-200 text-slate-400 cursor-not-allowed shadow-none flex-shrink-0"
            title="Complete required actions above to enable submission"
          >
            <Send className="w-4 h-4" />
            Submit for Approval
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

