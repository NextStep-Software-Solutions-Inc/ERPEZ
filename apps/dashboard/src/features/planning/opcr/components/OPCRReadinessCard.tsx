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
      <Card className="border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/45 dark:to-blue-950/25 shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-indigo-100/80 dark:border-indigo-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200/70 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-indigo-950 dark:text-indigo-100">
                  Submitted — Pending Review & Approval
                </CardTitle>
                <p className="text-xs text-indigo-800/90 dark:text-slate-300 mt-0.5 leading-relaxed">
                  This OPCR has been submitted and is currently in the Approval Workflow queue awaiting review and approval by the Planning Office.
                </p>
              </div>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/35 font-semibold px-3 py-1 text-xs shrink-0">
              Pending Approval
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Total Allotted Budget:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrencyPHP(readiness.totalBudget)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Commitment Scope:</span>
              <span className="text-slate-700 dark:text-slate-300">
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
                className="gap-1.5 border-rose-200 dark:border-rose-500/35 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-800 dark:hover:text-rose-200"
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
      <Card className="border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/45 dark:to-teal-950/25 shadow-xs mb-8">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200/70 dark:border-emerald-500/30 rounded-full text-emerald-700 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  OPCR Approved & Finalized
                </h4>
                <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/35 font-semibold text-[11px] px-2.5 py-0.5">
                  Approved
                </Badge>
              </div>
              <p className="text-xs text-emerald-800/90 dark:text-slate-300 mt-1 leading-relaxed">
                This Office Performance Commitment and Review is finalized. Activities and targets are now active for operational monitoring and accomplishment rating.
              </p>
            </div>
          </div>
          <div className="sm:text-right flex-shrink-0 pl-12 sm:pl-4 sm:border-l sm:border-emerald-200/70 dark:sm:border-emerald-500/20">
            <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400/90 font-semibold block">
              Total Approved Budget
            </span>
            <span className="text-base font-bold text-emerald-950 dark:text-emerald-200 tabular-nums mt-0.5 block">
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
      <Card className="border-rose-200 dark:border-rose-500/30 bg-gradient-to-r from-rose-50/80 to-orange-50/40 dark:from-rose-950/45 dark:to-orange-950/25 shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-rose-100/80 dark:border-rose-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-200/70 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-rose-950 dark:text-rose-100">
                  Returned for Revision
                </CardTitle>
                <p className="text-xs text-rose-800/90 dark:text-slate-300 mt-0.5 leading-relaxed">
                  This OPCR was returned during review. Please make the required adjustments to your targets and activities, then resubmit for approval.
                </p>
              </div>
            </div>
            <Badge className="bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/35 font-semibold px-3 py-1 text-xs shrink-0">
              Returned
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {!readiness.isReady ? (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Outstanding Issues ({readiness.errors.length})
              </h5>
              <ul className="space-y-1.5 pl-1">
                {readiness.errors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200/90 font-medium">
                    <span className="text-rose-500 dark:text-rose-400 font-bold">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
      <Card className="border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50/70 to-white dark:from-emerald-950/40 dark:to-slate-900/60 shadow-xs mb-8">
        <CardHeader className="pb-3 border-b border-emerald-100/80 dark:border-emerald-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200/70 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  Ready for Submission
                </CardTitle>
                <p className="text-xs text-emerald-800/90 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Review your assigned KPIs, targets, and activities. When finalized, submit this OPCR to forward it to the Planning Office for review and approval.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/35 font-semibold px-3 py-1 text-xs shrink-0">
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-900 dark:text-emerald-200">
              {readiness.passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
              Total Budget: <span className="font-semibold text-slate-900 dark:text-slate-200 tabular-nums">{formatCurrencyPHP(readiness.totalBudget)}</span>
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
    <Card className="border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-r from-amber-50/60 to-white dark:from-amber-950/40 dark:to-slate-900/60 shadow-xs mb-8">
      <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-500/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200/70 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-100">
                Not Ready for Submission
              </CardTitle>
              <p className="text-xs text-amber-800/90 dark:text-slate-300 mt-0.5 leading-relaxed">
                Complete the items below before submitting this OPCR for approval.
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-amber-300 dark:border-amber-500/35 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 font-semibold px-3 py-1 text-xs shrink-0"
          >
            Draft • Incomplete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Missing Requirements List */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
            Required Actions ({readiness.errors.length})
          </h5>
          <ul className="space-y-1.5 pl-1">
            {readiness.errors.map((err, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-100/90 font-medium"
              >
                <span className="text-amber-500 dark:text-amber-400 font-bold">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Passed Requirements List */}
        {readiness.passedChecks.length > 0 && (
          <div className="pt-2 border-t border-amber-100/80 dark:border-amber-500/20">
            <h5 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Completed Checks ({readiness.passedChecks.length})
            </h5>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              {readiness.passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-amber-100/80 dark:border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Commitment Scope: <span className="font-medium text-slate-700 dark:text-slate-300">{readiness.kpiCount} KPIs • {readiness.activityCount} Activities</span>
          </div>
          <Button
            size="sm"
            disabled={true}
            className="gap-2 bg-muted text-muted-foreground border border-border cursor-not-allowed shadow-none flex-shrink-0"
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

