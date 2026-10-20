import { AlertCircle, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { CardInfoTooltip } from './CardInfoTooltip'
import type { ProcurementDashboardSummary } from '../types/dashboardV2'

interface AlertBannerProps {
  summary?: ProcurementDashboardSummary
}

export function AlertBanner({ summary }: AlertBannerProps) {
  if (!summary) return null

  const alerts = [
    {
      id: 'overdue-prs',
      title: 'Overdue PRs',
      count: summary.overduePRCount,
      description: 'Submitted PRs awaiting action > 7 days',
      severity: 'critical',
      show: summary.overduePRCount > 0,
      icon: AlertCircle,
    },
    {
      id: 'rfqs-closing',
      title: 'RFQs Closing Soon',
      count: summary.rfqsClosingIn3Days,
      description: 'Quotation deadline in ≤ 3 days or overdue',
      severity: 'warning',
      show: summary.rfqsClosingIn3Days > 0,
      icon: Clock,
    },
    {
      id: 'pending-ntps',
      title: 'Pending NTP Issuance',
      count: summary.pendingNTPCount,
      description: 'Executed contracts awaiting Notice to Proceed',
      severity: 'info',
      show: summary.pendingNTPCount > 0,
      icon: AlertTriangle,
    },
    {
      id: 'stalled-procurements',
      title: 'Stalled Procurements',
      count: summary.stalledProcurementCount,
      description: 'Items with zero movement for 14+ days',
      severity: 'warning',
      show: summary.stalledProcurementCount > 0,
      icon: AlertCircle,
    },
    {
      id: 'budget-near-limit',
      title: 'Budget Threshold Warning',
      count: summary.budgetUtilizationRate,
      description: `Budget absorption currently at ${summary.budgetUtilizationRate}% (>90% threshold)`,
      severity: 'critical',
      show: summary.budgetNearLimit,
      icon: TrendingUp,
    },
  ].filter((a) => a.show)

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-3.5 flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <span className="font-semibold text-sm inline-flex items-center gap-1.5">
            <span>All Procurement Operations On Track</span>
            <CardInfoTooltip infoKey="panel-alert-banner" iconClassName="w-3 h-3" />
          </span>
          <span className="text-xs text-muted-foreground ml-2">No overdue PRs, closing RFQs, or pending NTP bottlenecks detected.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
      {alerts.map((alert) => {
        const Icon = alert.icon
        const isCritical = alert.severity === 'critical'
        const isWarning = alert.severity === 'warning'

        const colorClasses = isCritical
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          : isWarning
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'

        const badgeClasses = isCritical
          ? 'bg-rose-500 text-white'
          : isWarning
          ? 'bg-amber-500 text-white'
          : 'bg-blue-500 text-white'

        return (
          <div
            key={alert.id}
            className={`border rounded-xl p-3.5 flex flex-col justify-between shadow-xs transition-all ${colorClasses}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-xs">{alert.title}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClasses}`}>
                {typeof alert.count === 'number' && alert.id === 'budget-near-limit' ? `${alert.count}%` : alert.count}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{alert.description}</p>
          </div>
        )
      })}
    </div>
  )
}
