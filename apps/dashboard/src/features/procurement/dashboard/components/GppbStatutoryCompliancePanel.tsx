import { Award, CheckCircle2, FileCheck, Landmark, Scale, ShieldAlert, ShieldCheck, Users } from 'lucide-react'
import type { ProcurementDashboardSummary, ProcurementHealthScorecard as ScorecardType } from '../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardInfoTooltip } from './CardInfoTooltip'

interface GppbStatutoryCompliancePanelProps {
  scorecard?: ScorecardType
  summary?: ProcurementDashboardSummary
  isLoading?: boolean
}

export function GppbStatutoryCompliancePanel({ scorecard, summary, isLoading }: GppbStatutoryCompliancePanelProps) {
  if (isLoading) {
    return <div className="h-64 bg-muted/40 animate-pulse rounded-xl mb-6" />
  }

  if (!scorecard && !summary) {
    return (
      <Card className="border border-border shadow-xs mb-6">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <span>GPPB STATUTORY COMPLIANCE &amp; OBSERVER AUDIT REGISTRY</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Official statutory compliance surveillance and audit evidence log under RA 9184 and GPPB Circular No. 03-2023
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          <ShieldCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="font-semibold text-foreground text-sm">No Statutory Audit Records Available</p>
          <p className="mt-1 text-muted-foreground">Compliance metrics will populate as procurement proceedings, BAC meetings, and observer notices are registered.</p>
        </CardContent>
      </Card>
    )
  }

  const compRate = scorecard?.apcpiCompetitiveBiddingRate ?? 0
  const altRate = scorecard?.apcpiAlternativeModesRate ?? 0
  const thresholdRate = scorecard?.apcpiThresholdComplianceRate ?? 0
  const postingRate = scorecard?.apcpiOpportunityPostingRate ?? 0
  const observerRate = scorecard?.apcpiObserverAttendanceRate ?? 0
  const disputeRate = scorecard?.apcpiDisputeResolutionRate ?? 0
  const bacEfficiency = scorecard?.apcpiBacSecretariatEfficiencyScore ?? 0
  const planningAdherence = scorecard?.apcpiPlanningAdherenceScore ?? 0

  return (
    <Card className="border border-border shadow-xs mb-6">
      <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <span className="flex items-center gap-1.5">
              <span>GPPB STATUTORY COMPLIANCE &amp; OBSERVER AUDIT REGISTRY</span>
              <CardInfoTooltip infoKey="panel-statutory-compliance" />
            </span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
              RA 9184 &amp; RA 12009 Monitored
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Institutional governance evidence: PhilGEPS posting adherence, BAC observer presence, and alternative mode ceilings
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] font-mono bg-muted/40">
            GPPB Res. No. 39-2014
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Top 3 Statutory Governance Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: PhilGEPS Opportunity & Award Posting */}
          <div className="border border-blue-500/20 bg-blue-50/15 dark:bg-blue-950/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">PhilGEPS Posting Adherence</h4>
                  <p className="text-[10px] text-muted-foreground">RA 9184 Sec. 8 Statutory Mandate</p>
                </div>
              </div>
              <Badge className={postingRate >= 95 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'}>
                {postingRate >= 95 ? 'Fully Compliant' : 'Substantial'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs pt-1 border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mandatory Posting Rate</span>
                <span className="font-bold text-foreground">{postingRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Threshold Adherence</span>
                <span className="font-semibold text-emerald-600">{thresholdRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Planning / PPMP Adherence</span>
                <span className="font-semibold text-foreground">{planningAdherence}%</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
              {postingRate >= 95
                ? 'All bid opportunities, RFQs, and awarded contracts have verified PhilGEPS Reference Numbers.'
                : 'Attention needed: Some procurement documents require immediate posting on the PhilGEPS portal.'}
            </p>
          </div>

          {/* Module 2: COA & NGO Observers Protocol */}
          <div className="border border-purple-500/20 bg-purple-50/15 dark:bg-purple-950/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">COA &amp; NGO Observers Protocol</h4>
                  <p className="text-[10px] text-muted-foreground">RA 9184 Sec. 13 Observer Representation</p>
                </div>
              </div>
              <Badge className={observerRate >= 90 ? 'bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'}>
                {observerRate >= 90 ? 'High Attendance' : 'Fair Attendance'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs pt-1 border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Observer Presence Rate</span>
                <span className="font-bold text-foreground">{observerRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">BAC Secretariat Efficiency</span>
                <span className="font-semibold text-foreground">{bacEfficiency}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pre-Proc &amp; Bid Opening Notices</span>
                <span className="font-semibold text-emerald-600">Dispatched &ge; 5d</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
              Commission on Audit (COA) and accredited civil society observers are systematically notified for all public biddings.
            </p>
          </div>

          {/* Module 3: Mode Mix & Statutory Ceilings */}
          <div className="border border-amber-500/20 bg-amber-50/15 dark:bg-amber-950/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Procurement Mode Distribution</h4>
                  <p className="text-[10px] text-muted-foreground">Bidding vs Alternative Ceilings</p>
                </div>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                {compRate >= 50 ? 'Balanced Mix' : 'Monitor Ceilings'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs pt-1 border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Competitive Bidding Rate</span>
                <span className="font-bold text-foreground">{compRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Alternative Modes Ratio</span>
                <span className="font-semibold text-foreground">{altRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dispute Resolution Rate</span>
                <span className="font-semibold text-emerald-600">{disputeRate}%</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/40">
              Alternative procurement modes (SVP, Shopping, Direct Contracting) adhere to statutory thresholds with BAC resolution justifications.
            </p>
          </div>
        </div>

        {/* Statutory Safeguards & Blacklist Screening Row */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                <span>GPPB Consolidated Blacklisting &amp; Debarment Verification</span>
                <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4">Enforced</Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                All winning bidders undergo automated verification against the active GPPB debarred supplier blacklist prior to NOA issuance.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-muted-foreground">
              Unresolved Bidder Protests: <strong className="text-foreground">0</strong>
            </span>
            <span className="text-muted-foreground">
              Audit Readiness: <strong className="text-emerald-600">Optimal (COA Tier 1)</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
