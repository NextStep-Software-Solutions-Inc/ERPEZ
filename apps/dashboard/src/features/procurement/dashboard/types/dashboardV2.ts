export interface DashboardFiltersV2 {
  fiscalYear: number
  officeId?: string
  quarter?: number
  procurementMode?: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

export interface ReportPaginationParams {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
}

// ── Summary & KPIs ────────────────────────────────────────────────────────────

export interface SubItemSummary {
  label: string
  count: number
  isStalled: boolean
}

export interface PipelineStageSummary {
  totalCount: number
  subItems: Array<SubItemSummary>
}

export interface ConsolidationProgressDto {
  total: number
  consolidated: number
  inProgress: number
  pending: number
  percent: number
  stalledPRs: number
}

export interface ProcurementDashboardSummary {
  totalActivePRs: number
  totalPRAmount: number
  consolidatedPRsRate: number
  activeRFQs: number
  pendingBACResolutions: number
  totalNOACount: number
  totalNOAAmount: number
  totalPOCount: number
  totalPOValue: number
  activeContracts: number
  directContractingCount: number
  directContractingAmount: number
  directAcquisitionCount: number
  directAcquisitionAmount: number
  overdueItemsCount: number
  avgProcurementTatDays: number
  savingsRate: number
  budgetUtilizationRate: number

  prChangeYoY: number | null
  consolidationChangeYoY: number | null
  rfqChangeYoY: number | null
  bacChangeYoY: number | null
  poValueChangeYoY: number | null
  contractChangeYoY: number | null
  savingsRateChangeYoY: number | null

  requests: PipelineStageSummary
  bidding: PipelineStageSummary
  award: PipelineStageSummary
  ordering: PipelineStageSummary
  directMethods: PipelineStageSummary

  consolidation: ConsolidationProgressDto

  overduePRCount: number
  rfqsClosingIn3Days: number
  pendingNTPCount: number
  stalledProcurementCount: number
  budgetNearLimit: boolean
}

// ── Health Scorecard ──────────────────────────────────────────────────────────

export interface ProcurementHealthScorecard {
  healthScore: number
  budgetUtilizationPct: number
  savingsRatePct: number
  bidFailureRatePct: number
  contractCompletionRatePct: number
  appCoveragePct: number
  avgBidCountPerRFQ: number
  reopeningRatePct: number
  avgBacResolutionTatDays: number
  avgNoaIssuanceTatDays: number
  contractExecutionRatePct: number
  supplierConcentrationPct: number

  // GPPB APCPI Pillars
  apcpiCompetitiveBiddingRate?: number
  apcpiAlternativeModesRate?: number
  apcpiThresholdComplianceRate?: number
  apcpiBacSecretariatEfficiencyScore?: number
  apcpiPlanningAdherenceScore?: number
  apcpiAverageBiddersPerProject?: number
  apcpiOpportunityPostingRate?: number
  apcpiTurnaroundEfficiencyScore?: number
  apcpiDisputeResolutionRate?: number
  apcpiObserverAttendanceRate?: number
  apcpiOverallComplianceLevel?: number
}

// ── Budget Burn & APP Tracking ────────────────────────────────────────────────

export interface BudgetBurnAnalytics {
  approvedAppBudget: number
  totalCommittedContracts: number
  totalPendingCommitments: number
  unencumberedBalance: number
  budgetBurnPercentage: number
  unprogrammedPRCount: number
  unprogrammedPRTotalAmount: number
  budgetOverrunPRCount: number
}

// ── Vendor Performance & Risk ─────────────────────────────────────────────────

export interface SupplierDeliveryItem {
  contractId: string
  contractNumber: string
  title: string
  amount: number
  status: string
  completionDate?: string
  wasDelayed: boolean
  delayDays: number
}

export interface SupplierPerformanceDetail {
  supplierId: string
  supplierName: string
  businessPermitNo: string
  philGEPSNumber?: string
  isBlocked: boolean
  isGppbBlacklisted: boolean
  onTimeDeliveryRate: number
  qualityAcceptanceRate: number
  totalContractsAwarded: number
  totalAwardedAmount: number
  liquidatedDamagesIncidentsCount: number
  totalLiquidatedDamagesAmount: number
  recentDeliveries: Array<SupplierDeliveryItem>
}

// ── Audit Log Trail ───────────────────────────────────────────────────────────

export interface ProcurementAuditLogItem {
  id: string
  actorName: string
  role: string
  action: string
  entityName: string
  documentNumber: string
  timestamp: string
  notes?: string
}

// ── Bottleneck Detection ──────────────────────────────────────────────────────

export interface StageBottleneck {
  stage: string
  stalledCount: number
  avgStalledDays: number
  thresholdDays: number
  isWorstBottleneck: boolean
}

export interface StalledItem {
  documentNo: string
  description: string
  officeName: string
  ageDays: number
  stage: string
}

export interface ProcurementBottleneck {
  stages: Array<StageBottleneck>
  topStalledItems: Array<StalledItem>
}

// ── Contract Risk ─────────────────────────────────────────────────────────────

export interface ExpiringContract {
  id: string
  contractNumber: string
  title: string
  supplierName: string
  endDate?: string
  totalAmount: number
  status: string
  daysUntilExpiry: number
}

export interface ProcurementContractRisk {
  totalValueAtRisk30Days: number
  totalValueAtRisk60Days: number
  totalValueAtRisk90Days: number
  expiringContracts: Array<ExpiringContract>
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface MonthlyPRCountPoint {
  month: string
  draft: number
  submitted: number
  approved: number
}

export interface MonthlyPOValuePoint {
  month: string
  value: number
}

export interface ProcurementModeShare {
  modeName: string
  count: number
  amount: number
  percentage: number
}

export interface OfficeSpendingItem {
  officeId?: string
  officeName: string
  amount: number
  prCount: number
}

export interface ContractStatusShare {
  status: string
  count: number
  percentage: number
}

export interface SupplierConcentration {
  supplierId?: string
  supplierName: string
  totalAwarded: number
  contractCount: number
  percentage: number
}

export interface MonthlyOverdueTrend {
  month: string
  overduePRs: number
  overdueRFQs: number
  overdueNTPs: number
}

export interface TatBenchmarkItem {
  stage: string
  currentYearDays: number
  priorYearDays: number
  targetDays: number
}

export interface AbcVsAwardedItem {
  projectTitle: string
  abc: number
  awardedAmount: number
}

export interface QuarterlyKpiPoint {
  quarter: string
  prCount: number
  poCount: number
  contractCount: number
  poValue: number
}

export interface QuarterlyModeShiftPoint {
  quarter: string
  biddingCount: number
  shoppingCount: number
  directCount: number
  otherCount: number
}

export interface YearOverYearSummary {
  currentYear: number
  priorYear: number
  currentYearPRCount: number
  priorYearPRCount: number
  currentYearPOValue: number
  priorYearPOValue: number
  currentYearContractCount: number
  priorYearContractCount: number
  currentYearSavingsRate: number
  priorYearSavingsRate: number
}

export interface ProcurementDashboardAnalytics {
  monthlyPRCount: Array<MonthlyPRCountPoint>
  monthlyPOValue: Array<MonthlyPOValuePoint>
  modeDistribution: Array<ProcurementModeShare>
  topSpendingOffices: Array<OfficeSpendingItem>
  contractStatusDist: Array<ContractStatusShare>
  topSuppliers: Array<SupplierConcentration>
  overdueTrend: Array<MonthlyOverdueTrend>
  tatBenchmark: Array<TatBenchmarkItem>
  abcVsAwarded: Array<AbcVsAwardedItem>
  quarterlyKpiComparison: Array<QuarterlyKpiPoint>
  modeShiftByQuarter: Array<QuarterlyModeShiftPoint>
  yearOverYear: YearOverYearSummary
}

// ── Report Items ──────────────────────────────────────────────────────────────

export interface PRReportItem {
  id: string
  prNumber: string
  officeName: string
  purpose: string
  prType: string
  totalAmount: number
  status: string
  requestedDate: string
}

export interface ConsolidatedPRReportItem {
  id: string
  cprNumber: string
  description: string
  totalAmount: number
  prsCount: number
  status: string
  consolidationDate: string
}

export interface RFQReportItem {
  id: string
  rfqNumber: string
  description: string
  modeName: string
  deadline?: string
  status: string
  totalAmount: number
  suppliersCount: number
}

export interface NOAReportItem {
  id: string
  noaNumber: string
  description: string
  supplierName: string
  awardedAmount: number
  status: string
  noaDate: string
}

export interface NTPReportItem {
  id: string
  ntpNumber: string
  contractNumber: string
  supplierName: string
  status: string
  ntpDate: string
  effectivityDate?: string
  deliveryCompletionDeadline?: string
}

export interface POReportItem {
  id: string
  poNumber: string
  supplierName: string
  totalAmount: number
  status: string
  date: string
  deliveryTerm?: string
}

export interface ContractReportItem {
  id: string
  contractNumber: string
  description: string
  supplierName: string
  totalAmount: number
  status: string
  contractDate: string
  contractApprovedAt?: string
}

export interface DirectContractingReportItem {
  id: string
  dcNumber: string
  name: string
  supplierName: string
  totalABC: number
  status: string
  submissionDeadline: string
}

export interface DirectAcquisitionReportItem {
  id: string
  daNumber: string
  remarks: string
  totalABC: number
  status: string
  createdAt: string
}
