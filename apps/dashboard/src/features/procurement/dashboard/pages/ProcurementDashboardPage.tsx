import { useState } from 'react'
import { BarChart3, FileSpreadsheet, LayoutDashboard, ShoppingCart } from 'lucide-react'

// Hooks
import {
  useProcurementBottleneck,
  useProcurementContractRisk,
  useProcurementDashboardAnalytics,
  useProcurementDashboardSummary,
  useProcurementHealthScorecard
} from '../hooks/useProcurementDashboard'

// Overview Components
import { GlobalFilterBar } from '../components/GlobalFilterBar'
import { AlertBanner } from '../components/AlertBanner'
import { KPIStripV2 } from '../components/KPIStripV2'
import { ProcurementFunnelV2 } from '../components/ProcurementFunnelV2'
import { ProcurementHealthScorecard } from '../components/ProcurementHealthScorecard'
import { PrConsolidationAndTatTracker } from '../components/PrConsolidationAndTatTracker'
import { BottleneckDetectionPanel } from '../components/BottleneckDetectionPanel'
import { BacBiddingContractsAnalytics } from '../components/BacBiddingContractsAnalytics'
import { ContractRiskPanel } from '../components/ContractRiskPanel'
import { TaskQueue } from '../components/TaskQueue'

// Analytics & Reports Components
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { ReportsDashboard } from '../components/ReportsDashboard'

import type { DashboardFiltersV2 } from '../types/dashboardV2'
import type { AobQueueItem, ContractItem, PoFulfillmentData, ProcurementTask, RfqStatusItem, TatDataPoint } from '../types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'

const defaultTatData: Array<TatDataPoint> = [
  { stage: 'Planning & Budgeting', avgDays: 4.8, threshold: 7, stalledWeight: 10 },
  { stage: 'Procurement Management', avgDays: 6.2, threshold: 7, stalledWeight: 25 },
  { stage: 'General Services', avgDays: 8.5, threshold: 7, stalledWeight: 40 },
  { stage: 'Information Technology', avgDays: 5.1, threshold: 7, stalledWeight: 15 },
  { stage: 'Administrative Services', avgDays: 7.2, threshold: 7, stalledWeight: 10 },
]

export default function ProcurementDashboardPage() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useState<DashboardFiltersV2>({
    fiscalYear: currentYear,
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview')

  // Overview Queries (React Query)
  const summaryQuery = useProcurementDashboardSummary(filters)
  const scorecardQuery = useProcurementHealthScorecard(filters)
  const bottleneckQuery = useProcurementBottleneck(filters)
  const contractRiskQuery = useProcurementContractRisk(filters)

  // Analytics Query (Lazy loaded only when tab is active)
  const analyticsQuery = useProcurementDashboardAnalytics(filters, activeTab === 'analytics')

  const summary = summaryQuery.data
  const scorecard = scorecardQuery.data
  const bottleneck = bottleneckQuery.data
  const contractRisk = contractRiskQuery.data
  const analytics = analyticsQuery.data

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
    endDate: c.endDate,
  }))

  const tasks: Array<ProcurementTask> = [
    {
      id: 'task-1',
      type: 'CONSOLIDATE_PR',
      title: 'Consolidate Pending PRs for March',
      description: `${summary?.consolidation.inProgress || 0} purchase requests pending consolidation for BAC utilization`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      actionLabel: 'Review & Consolidate',
      secondaryActionLabel: 'View Details',
      actionRoute: '/v2/purchase-requests-pr',
      metadata: {
        type: 'CONSOLIDATE_PR',
        consolidatedPrId: 'cpr-001',
        totalPRs: summary?.consolidation.total || 0,
        consolidatedCount: summary?.consolidation.consolidated || 0,
        pendingCount: summary?.consolidation.inProgress || 0,
        progressPercent: summary?.consolidatedPRsRate || 0,
      },
    },
    {
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
        aobId: 'aob-001',
        rfqNumber: `RFQ-${currentYear}-001`,
        totalEvaluations: 4,
        technicalEvaluation: 2,
        financialEvaluation: 2,
      },
    },
    {
      id: 'task-3',
      type: 'APPROVE_NOA',
      title: 'Sign Notice of Award (NOA)',
      description: `${summary?.pendingBACResolutions || 0} approved BAC resolutions ready for NOA issuance`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      actionLabel: 'Issue NOA',
      secondaryActionLabel: 'View Resolution',
      actionRoute: '/v2/bidding-master-calendar-v2',
      metadata: {
        type: 'APPROVE_NOA',
        noaId: 'noa-001',
        supplierName: 'Apex Tech Solutions Inc.',
        bidAmount: (summary?.totalPRAmount || 100000) * 0.9,
        performanceScore: 4.8,
        previousContracts: 6,
        onTimeDeliveryRate: 98,
      },
    },
    {
      id: 'task-4',
      type: 'ISSUE_NTP',
      title: 'Issue Notice to Proceed (NTP)',
      description: `${summary?.pendingNTPCount || 0} executed contracts awaiting statutory Notice to Proceed`,
      priority: 'high',
      status: 'pending',
      dueDate: new Date().toISOString(),
      actionLabel: 'Issue NTP',
      secondaryActionLabel: 'View Contract',
      actionRoute: '/v2/manage-ntp',
      metadata: {
        type: 'ISSUE_NTP',
        ntpId: 'ntp-001',
        contractNo: `CTR-${currentYear}-001`,
        contractAmount: summary?.totalPOValue || 250000,
        timelinePercent: 15,
        mobilizationDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        pendingDays: 3,
      },
    },
  ]

  return (
    <PageContainerDashtail
      title="Procurement Dashboard"
      titleIcon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
      description="Executive procurement intelligence platform — Real-time analytics, compliance scorecard, bottleneck surveillance, and reports"
      headerSize="default"
      containerClassName="p-6 bg-slate-50/50 dark:bg-background min-h-screen"
    >
      <div className="space-y-6">
        {/* Global Multi-Axis Filter Bar */}
        <GlobalFilterBar filters={filters} onChange={setFilters} />

        {/* Tabbed Navigation: Overview · Analytics · Reports */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="h-11 bg-muted/80 p-1 mb-6 inline-flex rounded-xl">
            <TabsTrigger value="overview" className="text-xs font-semibold gap-2 h-9 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <LayoutDashboard className="w-4 h-4" />
              Overview &amp; Operations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-semibold gap-2 h-9 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <BarChart3 className="w-4 h-4" />
              Advanced Analytics (11 Charts &amp; YoY)
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs font-semibold gap-2 h-9 px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              Reports &amp; Data Tables (9 Modules)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW & OPERATIONS */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
            {/* 1. Alert Banner (5 Alert Types) */}
            <AlertBanner summary={summary} />

            {/* 2. Expanded KPI Strip (13 Cards with YoY Deltas) */}
            <KPIStripV2 summary={summary} isLoading={summaryQuery.isLoading} />

            {/* 3. Procurement Pipeline Lifecycle Funnel + Direct Methods Lane */}
            <ProcurementFunnelV2 summary={summary} />

            {/* 4. Procurement Health & Compliance Scorecard (12 Metric Tiles) */}
            <ProcurementHealthScorecard data={scorecard} isLoading={scorecardQuery.isLoading} />

            {/* 5. PR Consolidation & Division Turnaround Time (TAT) Tracker */}
            <PrConsolidationAndTatTracker
              consolidation={summary?.consolidation || null}
              tatData={defaultTatData}
              fiscalYear={filters.fiscalYear}
              isLoading={summaryQuery.isLoading}
            />

            {/* 6. Bottleneck Detection & Aging Pipeline Checkpoints Panel */}
            <BottleneckDetectionPanel data={bottleneck} isLoading={bottleneckQuery.isLoading} />

            {/* 7. BAC, Bidding & Contracts Analytics (3-column layout) */}
            <BacBiddingContractsAnalytics
              rfqList={rfqStatusList}
              aobItems={aobQueueItems}
              poFulfillment={poFulfillment}
              contracts={contractsList}
              isLoading={summaryQuery.isLoading}
            />

            {/* 8. Contract Risk & Expiration Timeline Horizon */}
            <ContractRiskPanel data={contractRisk} isLoading={contractRiskQuery.isLoading} />

            {/* 9. Smart Task Queue */}
            <TaskQueue tasks={tasks} isLoading={summaryQuery.isLoading} />
          </TabsContent>

          {/* TAB 2: ADVANCED ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
            <AnalyticsDashboard data={analytics} isLoading={analyticsQuery.isLoading} />
          </TabsContent>

          {/* TAB 3: REPORTS & DATA TABLES */}
          <TabsContent value="reports" className="space-y-6 focus-visible:outline-none">
            <ReportsDashboard filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainerDashtail>
  )
}
