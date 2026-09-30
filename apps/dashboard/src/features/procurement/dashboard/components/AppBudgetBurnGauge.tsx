import { AlertTriangle, CheckCircle2, DollarSign, ShieldAlert, TrendingUp } from 'lucide-react'
import type { BudgetBurnAnalytics } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardInfoTooltip } from './CardInfoTooltip'
import { Badge } from '@/components/ui/badge'

interface AppBudgetBurnGaugeProps {
  data?: BudgetBurnAnalytics | null
  isLoading?: boolean
  onFilterUnprogrammed?: () => void
}

function formatPHP(amount: number) {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AppBudgetBurnGauge({ data, isLoading, onFilterUnprogrammed }: AppBudgetBurnGaugeProps) {
  if (isLoading) {
    return (
      <Card className="border border-border/80 shadow-xs bg-card/60 backdrop-blur-sm animate-pulse">
        <div className="p-5 h-28" />
      </Card>
    )
  }

  const approved = data?.approvedAppBudget || 0
  const committed = data?.totalCommittedContracts || 0
  const pending = data?.totalPendingCommitments || 0
  const unencumbered = data?.unencumberedBalance || 0
  const burnPct = data?.budgetBurnPercentage || (approved > 0 ? Math.round((committed / approved) * 100) : 0)
  const unprogrammedCount = data?.unprogrammedPRCount || 0
  const unprogrammedAmount = data?.unprogrammedPRTotalAmount || 0
  const overrunCount = data?.budgetOverrunPRCount || 0

  const isHealthy = burnPct <= 85
  const isWarning = burnPct > 85 && burnPct <= 95
  const isCritical = burnPct > 95

  return (
    <Card className="border border-border/80 shadow-xs bg-linear-to-r from-card via-card to-muted/20">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                  <span>Annual Procurement Plan (APP) Budget Burn &amp; Utilization</span>
                  <CardInfoTooltip infoKey="panel-app-budget-burn" />
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold px-2 py-0.5 ${
                    isHealthy
                      ? 'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : isWarning
                      ? 'border-amber-500/30 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-rose-500/30 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {isHealthy ? 'On Budget Schedule' : isWarning ? 'Approaching Ceiling' : isCritical ? 'Critical Burn Exceeded' : 'Ceiling Exceeded'}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Statutory expenditure surveillance comparing approved APP/PPMP vs. committed contracts and unencumbered balance
              </CardDescription>
            </div>
          </div>

          {/* Unprogrammed Requisition Warning Pill */}
          {unprogrammedCount > 0 && (
            <div
              onClick={onFilterUnprogrammed}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-500/15 transition-colors self-start md:self-auto"
              title="Click to view unprogrammed requisitions in report tables"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">{unprogrammedCount} Unprogrammed PRs</span> ({formatPHP(unprogrammedAmount)})
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-4">
        {/* Tri-color Stacked Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Overall Budget Burn Rate: <span className="font-bold text-sm">{burnPct}%</span>
            </span>
            <span className="text-muted-foreground text-[11px]">
              Approved Budget Ceiling: <span className="font-bold text-foreground">{formatPHP(approved)}</span>
            </span>
          </div>

          <div className="relative h-3 w-full bg-slate-100 dark:bg-muted rounded-full overflow-hidden flex">
            {/* Committed (Green/Blue) */}
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, burnPct)}%` }}
              title={`Committed Contracts: ${formatPHP(committed)} (${burnPct}%)`}
            />
            {/* Pending Commitments (Amber) */}
            {approved > 0 && pending > 0 && (
              <div
                className="h-full bg-amber-400/80 transition-all duration-500"
                style={{ width: `${Math.min(100 - burnPct, Math.round((pending / approved) * 100))}%` }}
                title={`Pending Procurement: ${formatPHP(pending)}`}
              />
            )}
          </div>
        </div>

        {/* 4 Multi-Dimension Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
            <div className="text-[11px] font-medium text-muted-foreground">Approved APP Budget</div>
            <div className="text-base font-bold text-foreground mt-0.5">{formatPHP(approved)}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              R.A. 9184 baseline
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Committed Contracts</div>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{formatPHP(committed)}</div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400 mt-1">
              {burnPct}% of approved ceiling
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">In Procurement (Pipeline)</div>
            <div className="text-base font-bold text-amber-700 dark:text-amber-300 mt-0.5">{formatPHP(pending)}</div>
            <div className="text-[10px] text-amber-600/80 dark:text-amber-400 mt-1">
              Active RFQs &amp; Evaluations
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20">
            <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300">Unencumbered Balance</div>
            <div className="text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">{formatPHP(unencumbered)}</div>
            <div className="text-[10px] text-blue-600/80 dark:text-blue-400 mt-1">
              Remaining allocable funds
            </div>
          </div>
        </div>

        {/* Warning Callout for Overrun / Unprogrammed */}
        {(unprogrammedCount > 0 || overrunCount > 0) && (
          <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/60 border border-border/80">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-foreground">
                <span className="font-semibold">Statutory Compliance Alert:</span> {unprogrammedCount} requisitions were initiated without prior APP item pairing.
                {overrunCount > 0 && ` ${overrunCount} requisitions exceed standard threshold.`}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground italic shrink-0">
              GPPB Res. No. 07-2022
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
