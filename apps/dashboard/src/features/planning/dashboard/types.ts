/**
 * Planning Dashboard Overview - Type Definitions
 * 
 * Type system for the Planning Dashboard module following ERPEZ architecture patterns.
 * Includes dashboard metrics, chart data structures, Smart Task Card types, and filters.
 */

// ============================================================================
// User Role Types
// ============================================================================

export type { UserRole } from '@/types/dashboard'

// ============================================================================
// Dashboard Summary & KPI Metrics
// ============================================================================

/**
 * Main dashboard summary with top-level Planning KPIs and counts
 */
export interface DashboardSummary {
  /** Total number of KPIs encoded for the selected fiscal year */
  totalKPIsEncoded: number
  /** Number of KPIs encoded this month */
  encodedThisMonth: number
  /** Month-over-month change in KPIs */
  kpiChangeFromLastMonth: number

  /** Total OPCRs for the fiscal year */
  totalOPCRs: number
  /** Submitted OPCR count */
  submittedOPCRs: number
  /** Pending OPCR count */
  pendingOPCRs: number
  /** Percentage of OPCRs submitted (0-100) */
  opcrSubmittedPercent: number

  /** Total budget planned / approved ceiling in Philippine Pesos */
  budgetPlanned: number
  /** Total budget programmed in Philippine Pesos */
  budgetUtilized: number
  /** Programming percentage (0-100+) */
  budgetUtilizationPercent: number

  /** Total number of PPMPs */
  totalPPMPs: number
  /** Number of consolidated PPMPs */
  consolidatedPPMPs: number
  /** Number of in progress PPMPs */
  inProgressPPMPs: number
  /** Number of pending PPMPs */
  pendingPPMPs: number
  /** PPMP consolidation progress percentage (0-100) */
  ppmpConsolidationPercent: number
}

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * OPCR Planned Target Baseline vs Actual Accomplishment Data Point (Q1..Q4)
 */
export interface OPCRChartDataPoint {
  month: string
  planned: number
  actual: number
  variance?: number
  hasData?: boolean
  hasAccomplishmentReported?: boolean
}

export type OPCRChartData = OPCRChartDataPoint[]

/**
 * Department Budget Distribution (Programmed Budget vs Approved Ceiling)
 */
export interface DepartmentBudgetDistributionItem {
  department: string
  departmentId: string
  programmedAmount: number
  ceilingAmount: number
  programmingPercentage: number
  hasCeilingAllocated: boolean
  status: string
  quarterlyProgrammed: number[]
}

/**
 * Backend API Dashboard Overview Response
 */
export interface DashboardOverviewApiResponse {
  kpiStats: {
    totalKPIsEncoded: number
    encodedThisMonth: number
    monthOverMonthChange: number
  }
  opcrStats: {
    totalOPCRs: number
    submittedCount: number
    pendingCount: number
    submittedPercentage: number
  }
  budgetStats: {
    plannedAmount: number
    utilizedAmount: number
    utilizationPercentage: number
    currency: string
  }
  ppmpStats: {
    totalPPMPs: number
    consolidatedCount: number
    inProgressCount: number
    pendingItemsCount: number
    consolidatedPercentage: number
  }
  opcrCommitments: Array<{
    month: string
    plannedAmount: number
    actualAmount: number
    variance: number
    hasData?: boolean
    hasAccomplishmentReported?: boolean
  }>
  departmentBudgetDistribution: DepartmentBudgetDistributionItem[]
  expenseClassAllocation?: UACSObligationData
  appProcurementReadiness?: AppProcurementReadinessData
  kpiClassification?: KPIClassificationData
}

/**
 * PPMP/APP Consolidation Donut/Progress Chart Data
 */
export interface PPMPConsolidationSegment {
  status: 'Consolidated' | 'In Progress' | 'Pending'
  count: number
  color: string
}

export type PPMPConsolidationData = PPMPConsolidationSegment[]

// ============================================================================
// Expense Class Programmed vs Allotment Chart Types
// ============================================================================

export interface UACSObjectClassRow {
  code: string
  label: string
  programmedAmount: number
  allotmentAmount: number
  obligationPercent: number
  allotmentLabel: string
  status: string
  color: string
}

export interface UACSBarChartDataPoint {
  department: string
  departmentId?: string
  obligated: number
  allotment: number
}

export interface UACSObligationData {
  quarter: string
  year: number
  totalProgrammed: number
  totalAllotment: number
  overallProgrammingPercentage: number
  rows: UACSObjectClassRow[]
  barChartData: UACSBarChartDataPoint[]
}

// ============================================================================
// APP Procurement Readiness Types
// ============================================================================

export interface ProcurementReadinessStage {
  stageKey: string
  label: string
  completedCount: number
  totalCount: number
  percent: number
  color: string
  status: 'complete' | 'in-progress' | 'action-needed'
  actionLabel?: string
}

export interface ProcurementModeReadiness {
  mode: string
  modeId?: string
  count: number
  totalAmount: number
  percent: number
  color: string
}

export interface AppProcurementReadinessData {
  overallStatus: 'on-track' | 'warning' | 'critical' | 'below-target' | 'at-risk'
  totalItems: number
  modeAssignedCount: number
  fullyEncodedCount: number
  scheduledCount: number
  missingScheduleCount: number
  epaCount: number
  totalEstimatedBudget: number
  stages: ProcurementReadinessStage[]
  byMode: ProcurementModeReadiness[]
}

// ============================================================================
// KPI Classification Types
// ============================================================================

export interface KPIClassificationDivision {
  name: string
  officeId?: string
  count: number
  sharePercentage: number
}

export interface KPIClassificationItem {
  type: 'strategic' | 'core' | 'support'
  label: string
  count: number
  percent: number
  description: string
  color: string
  activeCount: number
  divisions: KPIClassificationDivision[]
}

export interface KPIClassificationData {
  total: number
  fiscalYear: number
  items: KPIClassificationItem[]
}

// ============================================================================
// Actionable Attention Required Types
// ============================================================================

export interface AttentionItem {
  id: string
  title: string
  description: string
  count: number
  severity: 'warning' | 'critical' | 'info'
  category: 'BUDGET' | 'OPCR' | 'PPMP' | 'APP'
  actionText?: string
}

// ============================================================================
// Dashboard Filters
// ============================================================================

export interface DashboardFilters {
  fiscalYear: number
  departmentId: string | null
}

export interface FiscalYearOption {
  id: string
  year: number
  status?: string
}

export interface Department {
  id: string
  name: string
  code: string
}

// ============================================================================
// Smart Task Card Types
// ============================================================================

export type TaskType = 'OPCR' | 'WFP' | 'BUDGET' | 'STRATEGY' | 'PROCUREMENT'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

export interface SmartTaskCard {
  id: string
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  type: TaskType
  status: TaskStatus
  actionLabel: string
  metadata?: any
}
