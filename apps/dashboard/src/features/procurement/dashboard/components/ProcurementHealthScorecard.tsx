import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import type { ProcurementHealthScorecard as ScorecardType } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProcurementHealthScorecardProps {
  data?: ScorecardType
  isLoading?: boolean
}

type MetricStatus = 'good' | 'warning' | 'critical'

interface MetricTileProps {
  label: string
  value: string
  target: string
  status: MetricStatus
  description: string
}

function StatusBadge({ status }: { status: MetricStatus }) {
  if (status === 'good') {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
        <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Good
      </Badge>
    )
  }
  if (status === 'warning') {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">
        <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Warning
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] px-1.5 py-0">
      <AlertCircle className="w-2.5 h-2.5 mr-1" /> Critical
    </Badge>
  )
}

function MetricTile({ label, value, target, status, description }: MetricTileProps) {
  return (
    <div className="border border-border/70 rounded-xl p-3 bg-card/60 flex flex-col justify-between hover:bg-muted/20 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[11px] font-semibold text-foreground line-clamp-1">{label}</span>
          <StatusBadge status={status} />
        </div>
        <div className="text-lg font-black tracking-tight">{value}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Target: {target}</span>
        <span className="line-clamp-1 italic max-w-[120px] text-right">{description}</span>
      </div>
    </div>
  )
}

export function ProcurementHealthScorecard({ data, isLoading }: ProcurementHealthScorecardProps) {
  if (isLoading) {
    return <div className="h-48 bg-muted/40 animate-pulse rounded-xl mb-6" />
  }

  const d = data || {
    healthScore: 85,
    budgetUtilizationPct: 68.4,
    savingsRatePct: 7.2,
    bidFailureRatePct: 4.5,
    contractCompletionRatePct: 92.1,
    appCoveragePct: 96.0,
    avgBidCountPerRFQ: 3.4,
    reopeningRatePct: 3.1,
    avgBacResolutionTatDays: 3.5,
    avgNoaIssuanceTatDays: 4.2,
    contractExecutionRatePct: 94.0,
    supplierConcentrationPct: 32.5,
  }

  const getScoreStatus = (val: number): MetricStatus => val >= 80 ? 'good' : val >= 60 ? 'warning' : 'critical'
  const getBudgetStatus = (val: number): MetricStatus => val > 90 ? 'critical' : val >= 60 ? 'good' : 'warning'
  const getSavingsStatus = (val: number): MetricStatus => val >= 5 ? 'good' : 'warning'
  const getBidFailureStatus = (val: number): MetricStatus => val <= 10 ? 'good' : val <= 20 ? 'warning' : 'critical'
  const getCompletionStatus = (val: number): MetricStatus => val >= 85 ? 'good' : val >= 75 ? 'warning' : 'critical'
  const getAppCoverageStatus = (val: number): MetricStatus => val >= 90 ? 'good' : val >= 80 ? 'warning' : 'critical'
  const getBidCountStatus = (val: number): MetricStatus => val >= 3 ? 'good' : val >= 2 ? 'warning' : 'critical'
  const getReopeningStatus = (val: number): MetricStatus => val <= 5 ? 'good' : val <= 15 ? 'warning' : 'critical'
  const getBacTatStatus = (val: number): MetricStatus => val <= 5 ? 'good' : 'warning'
  const getNoaTatStatus = (val: number): MetricStatus => val <= 10 ? 'good' : 'warning'
  const getExecutionStatus = (val: number): MetricStatus => val >= 90 ? 'good' : 'warning'
  const getSupplierConcStatus = (val: number): MetricStatus => val <= 40 ? 'good' : val <= 60 ? 'warning' : 'critical'

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>PROCUREMENT HEALTH & COMPLIANCE SCORECARD</span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              Overall Score: {d.healthScore}/100
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            12 regulatory and performance indicators monitored against GPPB, RA 12009, and internal agency targets
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <MetricTile
            label="1. Health Score"
            value={`${d.healthScore}/100`}
            target="≥ 80"
            status={getScoreStatus(d.healthScore)}
            description="Composite metric"
          />
          <MetricTile
            label="2. Budget Absorption"
            value={`${d.budgetUtilizationPct}%`}
            target="70% – 90%"
            status={getBudgetStatus(d.budgetUtilizationPct)}
            description="PO / APP Budget"
          />
          <MetricTile
            label="3. Savings Rate"
            value={`${d.savingsRatePct}%`}
            target="≥ 5%"
            status={getSavingsStatus(d.savingsRatePct)}
            description="ABC vs Awarded"
          />
          <MetricTile
            label="4. Bid Failure Rate"
            value={`${d.bidFailureRatePct}%`}
            target="≤ 10%"
            status={getBidFailureStatus(d.bidFailureRatePct)}
            description="Failed RFQs"
          />
          <MetricTile
            label="5. Contract Completion"
            value={`${d.contractCompletionRatePct}%`}
            target="≥ 85%"
            status={getCompletionStatus(d.contractCompletionRatePct)}
            description="NTP / Executed"
          />
          <MetricTile
            label="6. APP Coverage"
            value={`${d.appCoveragePct}%`}
            target="≥ 90%"
            status={getAppCoverageStatus(d.appCoveragePct)}
            description="Planned items"
          />
          <MetricTile
            label="7. Avg Bid Count / RFQ"
            value={`${d.avgBidCountPerRFQ}`}
            target="≥ 3 bids"
            status={getBidCountStatus(d.avgBidCountPerRFQ)}
            description="Bidding market"
          />
          <MetricTile
            label="8. Reopening / Return Rate"
            value={`${d.reopeningRatePct}%`}
            target="≤ 5%"
            status={getReopeningStatus(d.reopeningRatePct)}
            description="Returned PRs"
          />
          <MetricTile
            label="9. BAC Res. TAT"
            value={`${d.avgBacResolutionTatDays}d`}
            target="≤ 5 days"
            status={getBacTatStatus(d.avgBacResolutionTatDays)}
            description="AOB to Resolution"
          />
          <MetricTile
            label="10. NOA Issuance TAT"
            value={`${d.avgNoaIssuanceTatDays}d`}
            target="≤ 10 days"
            status={getNoaTatStatus(d.avgNoaIssuanceTatDays)}
            description="BAC Res to NOA"
          />
          <MetricTile
            label="11. Execution Rate"
            value={`${d.contractExecutionRatePct}%`}
            target="≥ 90%"
            status={getExecutionStatus(d.contractExecutionRatePct)}
            description="NOA to Contract"
          />
          <MetricTile
            label="12. Supplier Concentration"
            value={`${d.supplierConcentrationPct}%`}
            target="≤ 40%"
            status={getSupplierConcStatus(d.supplierConcentrationPct)}
            description="Top 3 winners"
          />
        </div>
      </CardContent>
    </Card>
  )
}
