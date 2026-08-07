/**
 * Planning Dashboard Overview - Type Definitions
 * 
 * Type system for the Planning Dashboard module following ERPEZ architecture patterns.
 * Includes dashboard metrics, chart data structures, Smart Task Card types, and filters.
 */

// ============================================================================
// User Role Types
// ============================================================================

// Re-exported from shared location to preserve backward compatibility.
// Import directly from '@/types/dashboard' in new code.
export type { UserRole } from '@/types/dashboard'

// ============================================================================
// Dashboard Summary & KPI Metrics
// ============================================================================

/**
 * Main dashboard summary with top-level KPIs
 */
export interface DashboardSummary {
  /** Total number of KPIs encoded in the system */
  totalKPIsEncoded: number
  /** Percentage of OPCRs submitted (0-100) */
  opcrSubmittedPercent: number
  /** Total budget utilized in Philippine Pesos */
  budgetUtilized: number
  /** PPMP consolidation progress percentage (0-100) */
  ppmpConsolidationPercent: number
  /** Month-over-month change in KPIs */
  kpiChangeFromLastMonth: number
  /** Month-over-month change in OPCR percentage */
  opcrChangeFromLastMonth: number
  /** Month-over-month change in budget */
  budgetChangeFromLastMonth: number
  /** Month-over-month change in PPMP consolidation */
  ppmpChangeFromLastMonth: number
}

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * OPCR Planned vs Actual Line Chart Data
 */
export interface OPCRChartDataPoint {
  month: string
  planned: number
  actual: number
}

export type OPCRChartData = OPCRChartDataPoint[]

/**
 * MFO Reference Status Bar Chart Data
 */
export interface MFOStatusData {
  category: string
  completed: number
  ongoing: number
  pending: number
}

/**
 * Budget Utilization Heatmap Data
 */
export interface BudgetHeatmapCell {
  department: string
  month: string
  utilizationPercent: number
}

export type BudgetHeatmapData = BudgetHeatmapCell[]

/**
 * KPI Library Health Donut Chart Data
 */
export interface KPIHealthSegment {
  status: 'Active' | 'Validated' | 'Pending' | 'Inactive'
  count: number
  color: string
}

export type KPIHealthData = KPIHealthSegment[]

/**
 * PPMP/APP Consolidation Donut Chart Data
 */
export interface PPMPConsolidationSegment {
  status: 'Consolidated' | 'In Progress' | 'Pending'
  count: number
  color: string
}

export type PPMPConsolidationData = PPMPConsolidationSegment[]

// ============================================================================
// Smart Task Card Types
// ============================================================================

/**
 * Task type enum for Smart Task Card widget routing
 */
export type TaskType = 'OPCR' | 'WFP' | 'BUDGET' | 'STRATEGY' | 'PROCUREMENT'

/**
 * Task priority levels
 */
export type TaskPriority = 'high' | 'medium' | 'low'

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

/**
 * Base Smart Task Card structure
 */
export interface SmartTaskCard {
  /** Unique task identifier */
  id: string
  /** Task title (brief, action-oriented) */
  title: string
  /** Detailed task description */
  description: string
  /** Due date in ISO format */
  dueDate: string
  /** Task priority level */
  priority: TaskPriority
  /** Task type (determines which widget to render) */
  type: TaskType
  /** Status of the task */
  status: TaskStatus
  /** Primary action button label */
  actionLabel: string
  /** Type-specific metadata for widget rendering */
  metadata: OPCRTaskMetadata | WFPTaskMetadata | BudgetTaskMetadata | StrategyTaskMetadata | ProcurementTaskMetadata
}

/**
 * OPCR Task Metadata (for OpcrMiniChart widget)
 */
export interface OPCRTaskMetadata {
  type: 'OPCR'
  /** Commitment ID */
  commitmentId: string
  /** Planned completion rate (0-100) */
  plannedCompletion: number
  /** Actual completion rate (0-100) */
  actualCompletion: number
  /** Mini chart data points (last 3 months) */
  chartData: Array<{ month: string; planned: number; actual: number }>
}

/**
 * WFP Task Metadata (for WfpBudgetBar widget)
 */
export interface WFPTaskMetadata {
  type: 'WFP'
  /** Project ID */
  projectId: string
  /** Total budget allocated */
  totalBudget: number
  /** Budget utilized so far */
  utilizedBudget: number
  /** Remaining budget */
  remainingBudget: number
  /** Utilization percentage (0-100) */
  utilizationPercent: number
}

/**
 * Budget Task Metadata (for BudgetProgress widget)
 */
export interface BudgetTaskMetadata {
  type: 'BUDGET'
  /** UACS code */
  uacsCode: string
  /** UACS description */
  uacsDescription: string
  /** Utilization percentage (0-100) */
  utilizationPercent: number
  /** Amount utilized */
  utilizedAmount: number
  /** Total allocated amount */
  allocatedAmount: number
}

/**
 * Strategy Task Metadata (for MfoStatusChips widget)
 */
export interface StrategyTaskMetadata {
  type: 'STRATEGY'
  /** MFO ID */
  mfoId: string
  /** MFO reference name */
  mfoName: string
  /** Overall status */
  status: 'completed' | 'ongoing' | 'delayed'
  /** Completed outputs count */
  completedCount: number
  /** Ongoing outputs count */
  ongoingCount: number
  /** Delayed outputs count */
  delayedCount: number
}

/**
 * Procurement Task Metadata (for PpmpProgress widget)
 */
export interface ProcurementTaskMetadata {
  type: 'PROCUREMENT'
  /** PPMP ID */
  ppmpId: string
  /** PPMP title */
  ppmpTitle: string
  /** Consolidation progress percentage (0-100) */
  progressPercent: number
  /** Total items */
  totalItems: number
  /** Consolidated items */
  consolidatedItems: number
}

// ============================================================================
// UACS Obligation vs Allotment Chart Types
// ============================================================================

/**
 * UACS Object Class row (progress bar per classification)
 */
export interface UACSObjectClassRow {
  /** Short code e.g. "PS" */
  code: string
  /** Full label e.g. "Personnel Svc." */
  label: string
  /** Obligation percentage (0-100) */
  obligationPercent: number
  /** Allotment amount formatted string (e.g. "₱28M") */
  allotmentLabel: string
  /** Bar color for this row */
  color: string
}

/**
 * Department comparison data point for the stacked bar chart below
 */
export interface UACSBarChartDataPoint {
  department: string
  obligated: number
  allotment: number
}

/**
 * Full UACS Obligation data structure
 */
export interface UACSObligationData {
  quarter: string
  year: number
  rows: UACSObjectClassRow[]
  barChartData: UACSBarChartDataPoint[]
}

// ============================================================================
// APP Procurement Readiness Types
// ============================================================================

/**
 * Single stage in APP Procurement Readiness
 */
export interface ProcurementReadinessStage {
  label: string
  percent: number
  color: string
}

/**
 * Procurement mode readiness row
 */
export interface ProcurementModeReadiness {
  mode: string
  percent: number
  color: string
}

/**
 * Full APP Procurement Readiness data structure
 */
export interface AppProcurementReadinessData {
  overallStatus: 'on-track' | 'below-target' | 'at-risk'
  stages: ProcurementReadinessStage[]
  byMode: ProcurementModeReadiness[]
}

// ============================================================================
// GAA Utilization Types
// ============================================================================

export interface GAAUtilizationData {
  percent: number
  utilized: number
  total: number
  /** e.g. 'M', 'B' */
  unit: string
}

// ============================================================================
// KPI Classification Types
// ============================================================================

export interface KPIClassificationDivision {
  name: string
  count: number
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
// Dashboard Filters
// ============================================================================

/**
 * Global dashboard filters
 */
export interface DashboardFilters {
  /** Selected fiscal year */
  fiscalYear: number
  /** Selected department ID (null = all departments) */
  departmentId: string | null
}

/**
 * Department/Organization entity
 */
export interface Department {
  id: string
  name: string
  code: string
}

// ============================================================================
// Store State Shape
// ============================================================================

/**
 * Complete dashboard state structure for Zustand store
 */
export interface DashboardState {
  // Filters
  filters: DashboardFilters
  
  // Summary data
  summary: DashboardSummary | null
  
  // Chart data
  opcrChartData: OPCRChartData
  mfoStatusData: MFOStatusData[]
  budgetHeatmapData: BudgetHeatmapData
  kpiHealthData: KPIHealthData
  ppmpConsolidationData: PPMPConsolidationData
  uacsObligationData: UACSObligationData | null
  appProcurementReadinessData: AppProcurementReadinessData | null
  gaaUtilizationData: GAAUtilizationData | null
  kpiClassificationData: KPIClassificationData | null
  
  // Task queue
  tasks: SmartTaskCard[]
  
  // Departments list
  departments: Department[]
  
  // Loading state
  isLoading: boolean
  
  // Actions
  setFilters: (filters: Partial<DashboardFilters>) => void
  loadMockData: () => void
  refreshData: () => void
}
