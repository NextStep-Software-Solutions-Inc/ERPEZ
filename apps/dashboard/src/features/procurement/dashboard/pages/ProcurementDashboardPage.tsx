import { useState } from 'react'
import {
  BarChart3,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Workflow,
} from 'lucide-react'

// Hooks
import {
  useProcurementBottleneck,
  useProcurementBudgetBurn,
  useProcurementContractRisk,
  useProcurementDashboardAnalytics,
  useProcurementDashboardSummary,
  useProcurementHealthScorecard
} from '../hooks/useProcurementDashboard'

// Overview Components
import { GlobalFilterBar } from '../components/GlobalFilterBar'
import { AlertBanner } from '../components/AlertBanner'
import { KPIStripV2 } from '../components/KPIStripV2'
import { AppBudgetBurnGauge } from '../components/AppBudgetBurnGauge'
import { ProcurementFunnelV2 } from '../components/ProcurementFunnelV2'
import { ProcurementHealthScorecard } from '../components/ProcurementHealthScorecard'
import { PrConsolidationAndTatTracker } from '../components/PrConsolidationAndTatTracker'
import { BottleneckDetectionPanel } from '../components/BottleneckDetectionPanel'
import { BacBiddingContractsAnalytics } from '../components/BacBiddingContractsAnalytics'
import { ContractRiskPanel } from '../components/ContractRiskPanel'
import { TaskQueue } from '../components/TaskQueue'
import { ProcurementAuditActivityRail } from '../components/ProcurementAuditActivityRail'
import { GppbStatutoryCompliancePanel } from '../components/GppbStatutoryCompliancePanel'

// Analytics & Reports Components
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { ReportsDashboard } from '../components/ReportsDashboard'

import type { DashboardFiltersV2 } from '../types/dashboardV2'
import type { AobQueueItem, ContractItem, PoFulfillmentData, ProcurementTask, RfqStatusItem, TatDataPoint } from '../types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'

export default function ProcurementDashboardPage() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useState<DashboardFiltersV2>({
    fiscalYear: currentYear,
  })
  const [selectedOfficeName, setSelectedOfficeName] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview')
  const [overviewSubTab, setOverviewSubTab] = useState<'summary' | 'operations' | 'risk'>('summary')
  const [scorecardViewMode, setScorecardViewMode] = useState<'standard' | 'apcpi'>('standard')

  // Overview Queries (React Query)
  const summaryQuery = useProcurementDashboardSummary(filters)
  const scorecardQuery = useProcurementHealthScorecard(filters)
  const bottleneckQuery = useProcurementBottleneck(filters)
  const contractRiskQuery = useProcurementContractRisk(filters)
  const budgetBurnQuery = useProcurementBudgetBurn({ fiscalYear: filters.fiscalYear, officeId: filters.officeId })

  // Analytics Query (Lazy loaded only when tab is active)
  const analyticsQuery = useProcurementDashboardAnalytics(filters, activeTab === 'analytics')

  const summary = summaryQuery.data
  const scorecard = scorecardQuery.data
  const bottleneck = bottleneckQuery.data
  const contractRisk = contractRiskQuery.data
  const budgetBurn = budgetBurnQuery.data
  const analytics = analyticsQuery.data

  // Interactive Cross-Filtering Handlers
  const handleSelectOffice = (officeName: string, officeId?: string) => {
    if (selectedOfficeName === officeName) {
      setSelectedOfficeName(undefined)
      setFilters((prev) => ({ ...prev, officeId: undefined }))
    } else {
      setSelectedOfficeName(officeName)
      setFilters((prev) => ({ ...prev, officeId }))
    }
  }

  const handleSelectMode = (modeName: string) => {
    if (filters.procurementMode === modeName) {
      setFilters((prev) => ({ ...prev, procurementMode: undefined }))
    } else {
      setFilters((prev) => ({ ...prev, procurementMode: modeName }))
    }
  }

  const handleJumpToReports = () => {
    setActiveTab('reports')
  }

  // Synthesize task and BAC analytics items from live contract risk & summary
  const rfqStatusList: Array<RfqStatusItem> = (summary?.bidding.subItems || []).map((sub, i) => ({
    id: `rfq-${i}`,
    rfqNumber: `RFQ-${currentYear}-00${i + 1}`,
    description: sub.label,
    supplierCount: 3,
    closingDate: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    daysRemaining: i + 1,
    progressPercent: 65,
    status: 'issued',
  }))

  const aobQueueItems: Array<AobQueueItem> = [
    { id: 'aob-1', aobNumber: `AOB-${currentYear}-001`, description: 'IT Infrastructure & Servers', evalType: 'technical' },
    { id: 'aob-2', aobNumber: `AOB-${currentYear}-002`, description: 'Office Supplies & Materials', evalType: 'financial' },
  ]

  const poFulfillment: PoFulfillmentData = {
    totalPOValue: summary?.totalPOValue || 0,
    poCount: summary?.totalPOCount || 0,
    avgDeliveryDays: 12.5,
    overdueCount: summary?.overdueItemsCount || 0,
    segments: [
      { name: 'Issued', value: summary?.totalPOCount || 0, color: '#3b82f6' },
      { name: 'Accepted', value: Math.round((summary?.totalPOCount || 0) * 0.75), color: '#8b5cf6' },
      { name: 'Delivered', value: Math.round((summary?.totalPOCount || 0) * 0.5), color: '#10b981' },
    ],
    uacsBreakdown: [
      { label: 'Goods & Supplies', value: (summary?.totalPOValue || 0) * 0.45, color: '#3b82f6' },
      { label: 'Equipment & Machinery', value: (summary?.totalPOValue || 0) * 0.35, color: '#8b5cf6' },
      { label: 'Consulting & Services', value: (summary?.totalPOValue || 0) * 0.20, color: '#10b981' },
    ],
  }

  const contractsList: Array<ContractItem> = (contractRisk?.expiringContracts || []).map((c) => ({
    id: c.id,
    contractNo: c.contractNumber,
    title: c.title,
    contractorName: c.supplierName,
    procurementMode: 'Public Bidding',
    amount: c.totalAmount,
    status: c.daysUntilExpiry <= 30 ? 'for_renewal' : 'ongoing',
    progressPercent: 75,
    endDate: c.endDate || new Date().toISOString(),
  }))

  const liveTatData: Array<TatDataPoint> = (analytics?.tatBenchmark || []).map((b) => ({
    stage: b.stage,
    avgDays: b.currentYearDays,
    threshold: b.targetDays,
    stalledWeight: 0,
  }))

  const funnelTrendData = (analytics?.monthlyPRCount || []).map((m) => ({
    month: m.month,
    requests: m.draft + m.submitted + m.approved,
    bidding: m.submitted,
    award: m.approved,
    ordering: Math.round(m.approved * 0.8),
  }))

  const tasks: Array<ProcurementTask> = []

  if (summary?.consolidation && summary.consolidation.inProgress > 0) {
    tasks.push({
      id: 'task-1',
      type: 'CONSOLIDATE_PR',
      title: 'Consolidate Pending PRs',
      description: `${summary.consolidation.inProgress} purchase requests pending consolidation for BAC utilization`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      actionLabel: 'Review & Consolidate',
      secondaryActionLabel: 'View Details',
      actionRoute: '/v2/purchase-requests-pr',
      metadata: {
        type: 'CONSOLIDATE_PR',
        consolidatedPrId: 'cpr-active',
        totalPRs: summary.consolidation.total,
        consolidatedCount: summary.consolidation.consolidated,
        pendingCount: summary.consolidation.inProgress,
        progressPercent: summary.consolidatedPRsRate || 0,
      },
    })
  }

  if (summary?.bidding && summary.bidding.totalCount > 0) {
    tasks.push({
      id: 'task-2',
      type: 'EVALUATE_AOB',
      title: 'Evaluate Abstract of Bids (AOB)',
      description: 'Abstract of Bids comparative matrix requires BAC technical evaluation',
      priority: 'medium',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      actionLabel: 'Open Evaluation Matrix',
      secondaryActionLabel: 'View Bids',
      actionRoute: '/v2/abstract-of-bids-aob',
      metadata: {
        type: 'EVALUATE_AOB',
        aobId: 'aob-active',
        rfqNumber: `RFQ-${currentYear}`,
        totalEvaluations: summary.bidding.totalCount,
        technicalEvaluation: Math.ceil(summary.bidding.totalCount / 2),
        financialEvaluation: Math.floor(summary.bidding.totalCount / 2),
      },
    })
  }

  if ((summary?.pendingBACResolutions ?? 0) > 0) {
    tasks.push({
      id: 'task-3',
      type: 'APPROVE_NOA',
      title: 'Sign Notice of Award (NOA)',
      description: `${summary?.pendingBACResolutions} approved BAC resolutions ready for NOA issuance`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      actionLabel: 'Issue NOA',
      secondaryActionLabel: 'View Resolution',
      actionRoute: '/v2/bidding-master-calendar-v2',
      metadata: {
        type: 'APPROVE_NOA',
        noaId: 'noa-active',
        supplierName: 'Awarded Supplier',
        bidAmount: summary?.totalNOAAmount || 0,
        performanceScore: 4.8,
        previousContracts: 1,
        onTimeDeliveryRate: 100,
      },
    })
  }

  if ((summary?.pendingNTPCount ?? 0) > 0) {
    tasks.push({
      id: 'task-4',
      type: 'ISSUE_NTP',
      title: 'Issue Notice to Proceed (NTP)',
      description: `${summary?.pendingNTPCount} executed contracts awaiting statutory Notice to Proceed`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date().toISOString(),
      actionLabel: 'Issue NTP',
      secondaryActionLabel: 'View Contract',
      actionRoute: '/v2/manage-ntp',
      metadata: {
        type: 'ISSUE_NTP',
        ntpId: 'ntp-active',
        contractNo: `CTR-${currentYear}`,
        contractAmount: summary?.totalPOValue || 0,
        timelinePercent: 0,
        mobilizationDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        pendingDays: 1,
      },
    })
  }

  return (
    <PageContainerDashtail
      title="Procurement Dashboard"
      titleIcon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
      description="Executive procurement intelligence platform — Real-time analytics, compliance scorecard, bottleneck surveillance, and reports"
      headerSize="default"
      containerClassName="p-6 bg-slate-50/50 dark:bg-background min-h-screen"
    >
      <div className="space-y-6">
        {/* Global Multi-Axis Filter Bar with Active Selection Pills */}
        <GlobalFilterBar
          filters={filters}
          onChange={setFilters}
          onJumpToReports={handleJumpToReports}
          activeOfficeName={selectedOfficeName}
        />

        {/* Tabbed Navigation: Single Combined Row for Main Tabs & Sub-Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Left: Main Tabs */}
            <TabsList className="h-9 bg-muted/80 p-0.5 inline-flex rounded-xl">
              <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs font-semibold gap-1.5 h-8 px-3.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Right: Sub-Tabs for Overview */}
            {activeTab === "overview" && (
              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("summary")}
                  className={`flex items-center gap-1.5 text-xs font-semibold h-7.5 px-3 rounded-md transition-all ${
                    overviewSubTab === "summary"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("operations")}
                  className={`flex items-center gap-1.5 text-xs font-semibold h-7.5 px-3 rounded-md transition-all ${
                    overviewSubTab === "operations"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 text-indigo-500" />
                  Operations
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewSubTab("risk")}
                  className={`flex items-center gap-1.5 text-xs font-semibold h-7.5 px-3 rounded-md transition-all ${
                    overviewSubTab === "risk"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Risk & Compliance
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: OVERVIEW & OPERATIONS */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
            {overviewSubTab === "summary" && (
              <div className="space-y-6">
                {/* 1. Alert Banner (5 Alert Types) */}
                <AlertBanner summary={summary} />

                {/* 2. Expanded KPI Strip (13 Cards with YoY Deltas) */}
                <KPIStripV2 summary={summary} isLoading={summaryQuery.isLoading} />

                {/* 3. APP & PPMP Budget Burn Utilization Gauge */}
                <AppBudgetBurnGauge
                  data={budgetBurn}
                  isLoading={budgetBurnQuery.isLoading}
                  onFilterUnprogrammed={handleJumpToReports}
                />

                {/* 4. Procurement Pipeline Lifecycle Funnel + Direct Methods Lane */}
                <ProcurementFunnelV2 summary={summary} trendData={funnelTrendData} />
              </div>
            )}

            {overviewSubTab === "operations" && (
              <div className="space-y-6">
                {/* 5. Procurement Health & Compliance Scorecard (12 Metric Tiles + GPPB APCPI 4 Pillars) */}
                <ProcurementHealthScorecard
                  data={scorecard}
                  isLoading={scorecardQuery.isLoading}
                  viewMode={scorecardViewMode}
                  onViewModeChange={setScorecardViewMode}
                />

                {scorecardViewMode === 'standard' ? (
                  <>
                    {/* 6. PR Consolidation & Division Turnaround Time (TAT) Tracker */}
                    <PrConsolidationAndTatTracker
                      consolidation={summary?.consolidation || null}
                      tatData={liveTatData}
                      fiscalYear={filters.fiscalYear}
                      isLoading={summaryQuery.isLoading}
                    />

                    {/* 7. Bottleneck Detection & Aging Pipeline Checkpoints Panel */}
                    <BottleneckDetectionPanel data={bottleneck} isLoading={bottleneckQuery.isLoading} />

                    {/* 8. Smart Task Queue */}
                    <TaskQueue tasks={tasks} isLoading={summaryQuery.isLoading} />
                  </>
                ) : (
                  /* GPPB Statutory Compliance & Observer Audit Panel (Dedicated compliance view, distinct from operational TAT) */
                  <GppbStatutoryCompliancePanel
                    scorecard={scorecard}
                    summary={summary}
                    isLoading={scorecardQuery.isLoading}
                  />
                )}
              </div>
            )}

            {overviewSubTab === "risk" && (
              <div className="space-y-6">
                {/* 8. BAC, Bidding & Contracts Analytics (3-column layout) */}
                <BacBiddingContractsAnalytics
                  rfqList={rfqStatusList}
                  aobItems={aobQueueItems}
                  poFulfillment={poFulfillment}
                  contracts={contractsList}
                  isLoading={summaryQuery.isLoading}
                />

                {/* 9. Contract Risk & Expiration Timeline Horizon */}
                <ContractRiskPanel data={contractRisk} isLoading={contractRiskQuery.isLoading} />
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ADVANCED ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
            <AnalyticsDashboard
              data={analytics}
              isLoading={analyticsQuery.isLoading}
              selectedOffice={selectedOfficeName}
              onSelectOffice={handleSelectOffice}
              selectedMode={filters.procurementMode}
              onSelectMode={handleSelectMode}
            />
          </TabsContent>

          {/* TAB 3: REPORTS & DATA TABLES */}
          <TabsContent value="reports" className="space-y-6 focus-visible:outline-none">
            <ReportsDashboard filters={filters} />
          </TabsContent>
        </Tabs>

        {/* Live Collapsible Audit Log Rail */}
        <ProcurementAuditActivityRail
          onSelectDocument={() => {
            setActiveTab('reports')
          }}
        />
      </div>
    </PageContainerDashtail>
  )
}
