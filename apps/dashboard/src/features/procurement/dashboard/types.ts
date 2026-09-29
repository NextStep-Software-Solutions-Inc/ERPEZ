/**
 * Procurement Dashboard - Type Definitions
 *
 * Type system for the Procurement Dashboard module.
 * Covers the full procurement lifecycle: PR → RFQ/Bidding → BAC → NOA → PO → NTP
 */

// ============================================================================
// Role & Filter Types
// ============================================================================

export type ProcurementUserRole =
  | 'PROCUREMENT_ADMIN'
  | 'BAC_SECRETARIAT'
  | 'REQUESTING_OFFICE_USER'

export interface DashboardFilters {
  fiscalYear: number
  departmentId: string | null
}

export interface Department {
  id: string
  name: string
  code: string
}

// ============================================================================
// KPI Summary
// ============================================================================

export interface ProcurementKPISummary {
  totalActivePRs: number
  consolidatedPRsRate: number         // percentage 0–100
  activeRFQs: number
  pendingBACResolutions: number
  totalPOValue: number                // PHP amount
  activeContracts: number
  // Month-over-month changes
  prChangeFromLastMonth: number
  consolidationChangeFromLastMonth: number
  rfqChangeFromLastMonth: number
  bacChangeFromLastMonth: number
  poValueChangeFromLastMonth: number  // percentage change
  contractChangeFromLastMonth: number
}

// ============================================================================
// Alert Banner
// ============================================================================

export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertType = 'overdue_pr' | 'rfq_closing' | 'pending_ntp'

export interface AlertItem {
  id: string
  type: AlertType
  count: number
  label: string
  sublabel: string
  severity: AlertSeverity
  route: string
}

// ============================================================================
// Procurement Funnel
// ============================================================================

export interface FunnelSubItem {
  label: string
  count: number
  isStalled: boolean
}

export interface FunnelStage {
  id: string
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  totalCount: number
  subItems: Array<FunnelSubItem>
}

// ============================================================================
// TAT (Turnaround Time) Chart
// ============================================================================

export interface TatDataPoint {
  stage: string
  avgDays: number
  threshold: number
  /** 0-100 weight representing this division's contribution to total stalled PRs */
  stalledWeight?: number
}

// ============================================================================
// PR Consolidation Progress
// ============================================================================

export interface ConsolidationProgress {
  total: number
  consolidated: number
  inProgress: number
  pending: number
  percent: number
  stalledPRs: number
}

// ============================================================================
// AOB Queue — individual items
// ============================================================================

export type AobEvalType = 'technical' | 'financial'

export interface AobQueueItem {
  id: string
  aobNumber: string
  description: string
  evalType: AobEvalType
}

// ============================================================================
// RFQ Status List
// ============================================================================

export type RfqStatusType = 'draft' | 'issued' | 'closed' | 'overdue'

export interface RfqStatusItem {
  id: string
  rfqNumber: string
  description: string
  supplierCount: number
  closingDate: string    // ISO date string
  daysRemaining: number  // negative = overdue
  progressPercent: number
  status: RfqStatusType
}

// ============================================================================
// AOB Queue
// ============================================================================

export interface AobQueueData {
  technicalEvaluation: number
  financialEvaluation: number
  total: number
}

// ============================================================================
// PO Fulfillment Donut
// ============================================================================

export interface PoFulfillmentSegment {
  name: string
  value: number
  color: string
  [key: string]: unknown
}

export interface PoUacsItem {
  label: string
  value: number
  color: string
}

export interface PoFulfillmentData {
  poCount: number
  segments: Array<PoFulfillmentSegment>
  totalPOValue: number
  avgDeliveryDays: number
  overdueCount: number
  uacsBreakdown: Array<PoUacsItem>
}

// ============================================================================
// Contract Lifecycle
// ============================================================================

export type ContractStatus =
  | 'awaiting_ntp'
  | 'ntp_issued'
  | 'ongoing'
  | 'for_renewal'

export interface ContractItem {
  id: string
  contractNo: string
  title: string
  contractorName: string
  procurementMode: string
  amount: number
  progressPercent: number
  status: ContractStatus
  endDate: string
}

// ============================================================================
// Smart Task Cards
// ============================================================================

export type ProcTaskType =
  | 'CONSOLIDATE_PR'
  | 'EVALUATE_AOB'
  | 'APPROVE_NOA'
  | 'ISSUE_NTP'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

// --- Metadata per task type ---

export interface ConsolidatePRMetadata {
  type: 'CONSOLIDATE_PR'
  consolidatedPrId: string
  totalPRs: number
  consolidatedCount: number
  pendingCount: number
  progressPercent: number
}

export interface EvaluateAOBMetadata {
  type: 'EVALUATE_AOB'
  aobId: string
  rfqNumber: string
  totalEvaluations: number
  technicalEvaluation: number
  financialEvaluation: number
}

export interface ApproveNOAMetadata {
  type: 'APPROVE_NOA'
  noaId: string
  supplierName: string
  bidAmount: number
  performanceScore: number   // 0–5 stars
  previousContracts: number
  onTimeDeliveryRate: number // percentage
}

export interface IssueNTPMetadata {
  type: 'ISSUE_NTP'
  ntpId: string
  contractNo: string
  contractAmount: number
  timelinePercent: number  // how far into the project timeline
  mobilizationDate: string // ISO
  pendingDays: number
}

export type ProcTaskMetadata =
  | ConsolidatePRMetadata
  | EvaluateAOBMetadata
  | ApproveNOAMetadata
  | IssueNTPMetadata

export interface ProcurementTask {
  id: string
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  type: ProcTaskType
  status: TaskStatus
  actionLabel: string
  secondaryActionLabel: string
  actionRoute: string
  metadata: ProcTaskMetadata
}

// ============================================================================
// Zustand Store Interface
// ============================================================================

export interface ProcurementDashboardState {
  filters: DashboardFilters
  kpiSummary: ProcurementKPISummary | null
  alerts: Array<AlertItem>
  funnelData: Array<FunnelStage>
  tatData: Array<TatDataPoint>
  consolidationProgress: ConsolidationProgress | null
  rfqStatusList: Array<RfqStatusItem>
  aobQueueItems: Array<AobQueueItem>
  poFulfillment: PoFulfillmentData | null
  contracts: Array<ContractItem>
  tasks: Array<ProcurementTask>
  departments: Array<Department>
  isLoading: boolean
}

export interface ProcurementDashboardStore extends ProcurementDashboardState {
  setFilters: (filters: Partial<DashboardFilters>) => void
  loadMockData: () => void
  refreshData: () => void
}
