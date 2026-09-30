import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileCheck,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users
} from 'lucide-react'
import type { ProcurementHealthScorecard as ScorecardType } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardInfoTooltip } from './CardInfoTooltip'

interface ProcurementHealthScorecardProps {
  data?: ScorecardType
  isLoading?: boolean
  viewMode?: 'standard' | 'apcpi'
  onViewModeChange?: (mode: 'standard' | 'apcpi') => void
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

export function ProcurementHealthScorecard({
  data,
  isLoading,
  viewMode: controlledViewMode,
  onViewModeChange
}: ProcurementHealthScorecardProps) {
  const [internalViewMode, setInternalViewMode] = useState<'standard' | 'apcpi'>('standard')
  const currentViewMode = controlledViewMode ?? internalViewMode

  const handleViewChange = (mode: 'standard' | 'apcpi') => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    } else {
      setInternalViewMode(mode)
    }
  }

  if (isLoading) {
    return <div className="h-48 bg-muted/40 animate-pulse rounded-xl mb-6" />
  }

  const apcpiLevelLabels = [
    '',
    'Level 1: Low Compliance',
    'Level 2: Moderate Compliance',
    'Level 3: Substantial Compliance',
    'Level 4: High / Full Compliance',
  ]

  if (!data) {
    return (
      <Card className="border border-border shadow-xs mb-6">
        <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
                <span>{currentViewMode === 'standard' ? 'PROCUREMENT HEALTH & COMPLIANCE SCORECARD' : 'GPPB APCPI STATUTORY COMPLIANCE ASSESSMENT'}</span>
                <CardInfoTooltip infoKey="panel-health-scorecard" />
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              {currentViewMode === 'standard'
                ? '12 regulatory and performance indicators monitored against GPPB, RA 12009, and internal agency targets'
                : 'Statutory Agency Procurement Compliance and Performance Indicators (APCPI) across the 4 official GPPB pillars'}
            </CardDescription>
          </div>

          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50 self-start sm:self-auto">
            <Button
              type="button"
              variant={currentViewMode === 'standard' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('standard')}
              className="text-xs h-7 px-3 font-medium"
            >
              Health Scorecard (12)
            </Button>
            <Button
              type="button"
              variant={currentViewMode === 'apcpi' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('apcpi')}
              className="text-xs h-7 px-3 font-medium gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              GPPB APCPI (4 Pillars)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="font-semibold text-foreground text-sm">Scorecard Data Pending</p>
          <p className="mt-1 text-muted-foreground">No statutory or operational health metrics recorded for the selected filter parameters.</p>
        </CardContent>
      </Card>
    )
  }

  const d = data

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

  const apcpiLevel = d.apcpiOverallComplianceLevel || (d.healthScore >= 85 ? 4 : d.healthScore >= 70 ? 3 : d.healthScore > 0 ? 2 : 1)

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
              <span>{currentViewMode === 'standard' ? 'PROCUREMENT HEALTH & COMPLIANCE SCORECARD' : 'GPPB APCPI STATUTORY COMPLIANCE ASSESSMENT'}</span>
              <CardInfoTooltip infoKey="panel-health-scorecard" />
            </CardTitle>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {currentViewMode === 'standard' ? `Score: ${d.healthScore}/100` : apcpiLevelLabels[apcpiLevel]}
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            {currentViewMode === 'standard'
              ? '12 regulatory and performance indicators monitored against GPPB, RA 12009, and internal agency targets'
              : 'Statutory Agency Procurement Compliance and Performance Indicators (APCPI) across the 4 official GPPB pillars'}
          </CardDescription>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50 self-start sm:self-auto">
          <Button
            type="button"
            variant={currentViewMode === 'standard' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('standard')}
            className="text-xs h-7 px-3 font-medium"
          >
            Health Scorecard (12)
          </Button>
          <Button
            type="button"
            variant={currentViewMode === 'apcpi' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('apcpi')}
            className="text-xs h-7 px-3 font-medium gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            GPPB APCPI (4 Pillars)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {currentViewMode === 'standard' ? (
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
        ) : (
          /* GPPB APCPI 4 Statutory Pillars Assessment */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PILLAR I */}
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Pillar I</h4>
                    <p className="text-[11px] text-muted-foreground">Legislative &amp; Regulatory Framework</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Competitive Bidding Rate</span>
                    <span className="font-bold text-foreground">{d.apcpiCompetitiveBiddingRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Alternative Modes Ratio</span>
                    <span className="font-medium text-foreground">{d.apcpiAlternativeModesRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Threshold Adherence</span>
                    <span className="font-bold text-emerald-600">{d.apcpiThresholdComplianceRate ?? 0}%</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
                  Rating: <span className="font-semibold text-emerald-600">{(d.apcpiCompetitiveBiddingRate ?? 0) >= 50 ? 'Compliant' : 'Monitored'}</span> (Balanced mode mix within RA 9184 ceilings)
                </div>
              </div>

              {/* PILLAR II */}
              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-50/20 dark:bg-purple-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Pillar II</h4>
                    <p className="text-[11px] text-muted-foreground">Agency Institutional Architecture</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">APP / PPMP Adherence</span>
                    <span className="font-bold text-foreground">{d.apcpiPlanningAdherenceScore ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">BAC Secretariat Efficiency</span>
                    <span className="font-bold text-foreground">{d.apcpiBacSecretariatEfficiencyScore ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Internal Audit Coordination</span>
                    <span className="font-medium text-emerald-600">Active</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
                  Rating: <span className="font-semibold text-purple-600">{(d.apcpiBacSecretariatEfficiencyScore ?? 0) >= 80 ? 'Substantial' : 'Developing'}</span> (Full BAC &amp; TWG operational coverage)
                </div>
              </div>

              {/* PILLAR III */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Pillar III</h4>
                    <p className="text-[11px] text-muted-foreground">Operations &amp; Market Interface</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg Bidders per Opportunity</span>
                    <span className="font-bold text-foreground">{d.apcpiAverageBiddersPerProject ?? 0} bids</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Opportunity Posting Rate</span>
                    <span className="font-bold text-foreground">{d.apcpiOpportunityPostingRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Turnaround Efficiency</span>
                    <span className="font-bold text-foreground">{d.apcpiTurnaroundEfficiencyScore ?? 0}%</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
                  Rating: <span className="font-semibold text-emerald-600">{(d.apcpiOpportunityPostingRate ?? 0) >= 90 ? 'High Competitiveness' : 'Moderate'}</span> (Healthy supplier engagement)
                </div>
              </div>

              {/* PILLAR IV */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Pillar IV</h4>
                    <p className="text-[11px] text-muted-foreground">Integrity &amp; Transparency</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dispute Resolution Rate</span>
                    <span className="font-bold text-foreground">{d.apcpiDisputeResolutionRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">COA &amp; NGO Observers Presence</span>
                    <span className="font-bold text-foreground">{d.apcpiObserverAttendanceRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Blacklist Screening Check</span>
                    <span className="font-bold text-emerald-600">100% Enforced</span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
                  Rating: <span className="font-semibold text-amber-600">{(d.apcpiObserverAttendanceRate ?? 0) >= 90 ? 'High Integrity' : 'Standard'}</span> (Zero unresolved bidder protests)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>
                  Official GPPB Annual Compliance Status: <strong className="text-foreground">{apcpiLevelLabels[apcpiLevel]}</strong> (Composite Performance Index: {d.healthScore}/100)
                </span>
              </span>
              <span className="text-[11px] font-mono">GPPB Circular No. 03-2023</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
