/**
 * Annual Performance Planning (APP) Module Types
 * 
 * Defines domain models for the 3-step wizard workflow:
 * - Step 1: Fiscal Year Initialization
 * - Step 2: KPI Activation (Hybrid Directive + Participatory)
 * - Step 3: Target Distribution (Matrix-style input)
 * 
 * Source: erpez-swagger.json (API contracts)
 */

import { RatingScaleMatrix } from "@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs"

/**
 * Fiscal Year entity - temporal context for the APP wizard
 */
export interface AppFiscalYear {
  id: string
  year: number
  description?: string
  status: string
  isLocked: boolean
  startDate?: string
  endDate?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * KPI Activation Type - distinguishes between directive (top-down) and shopping (bottom-up)
 */
export type KPIActivationType = 'Mandated' | 'AvailableForShopping'

/**
 * Aggregation Method for KPI calculations
 * - SUM: Annual = Q1 + Q2 + Q3 + Q4 (e.g., No. of Startups)
 * - AVERAGE: Annual = (Q1 + ... + Qn) / n (e.g., Satisfaction Rating)
 * - NON_CUMULATIVE: Annual = Target (e.g., ISO Certification)
 */
export type AggregationMethod = 'SUM' | 'AVERAGE' | 'NON_CUMULATIVE'

/**
 * Activated KPI - represents a KPI selected for a specific FY
 * Includes workflow metadata for hybrid directive/participatory model
 * Contains deep copy snapshot of the KPI definition
 */
export interface ActivatedKPI {
  id: string
  fiscalYearId: string
  kpiId: string
  kpiName: string
  kpiCode?: string
  description?: string
  functionType: 'CoreFunction' | 'StrategicPriority' | 'MandatorySupport'
  activationType: KPIActivationType
  isLocked: boolean
  assignedBy?: string // Planning Officer ID
  assignedAt?: string
  selectedBy?: string[] // Array of Office/DU IDs (for AvailableForShopping)
  mandatoryTargetValue?: number // Pre-set by Planning Officer
  allowOfficeOverride: boolean
  aggregationMethod: AggregationMethod // Default inherited but can be overridden
  ratingMatrix?: RatingScaleMatrix[] // Deep copy of rating matrix from Master Library
  isModified?: boolean // Tracks if this snapshot differs from Master Library
  modificationNotes?: string
  createdAt?: string
  updatedAt?: string
  agencyTargetAnnual?: number | null
  agencyTargetQ1?: number | null
  agencyTargetQ2?: number | null
  agencyTargetQ3?: number | null
  agencyTargetQ4?: number | null
  status?: string
  unitOfMeasure?: string
  measurementUnit?: string
}

/**
 * KPI Target assignment for an Office/Delivery Unit
 * Implements matrix-style target distribution with locking
 */
export interface KPITarget {
  id: string
  fiscalYearId: string
  activatedKPIId: string
  deliveryUnitId: string
  officeId?: string
  targetValue: number
  isLockedByPlanning: boolean
  lockReason?: string
  status: 'Pending' | 'Confirmed' | 'Locked'
  lastModifiedBy?: string
  lastModifiedAt?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * APP Workflow State - tracks step progression with URL parameters
 */
export interface APPWorkflowState {
  step: 1 | 2 | 3
  fiscalYearId: string
  isLocked: boolean
}

/**
 * RBAC Permissions for APP module
 */
export type APPUserRole = 'PlanningOfficer' | 'OfficeHead' | 'DepartmentHead' | 'SystemAdmin'

export interface APPPermissions {
  role: APPUserRole
  canInitializeFY: boolean
  canLockFY: boolean
  canActivateKPIs: boolean
  canSetMandatoryTargets: boolean
  canSelectKPIs: boolean // For AvailableForShopping
  canSetTargets: boolean
  canViewStep1: boolean
  canViewStep2: boolean
  canViewStep3: boolean
}

/**
 * API Response wrapper for APP operations
 */
export interface APPResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Payload for Step 1: Fiscal Year Initialization
 */
export interface CreateAppFiscalYearPayload {
  year: number
  description?: string
  startDate?: string
  endDate?: string
}

/**
 * Payload for Step 2: KPI Activation
 */
export interface ActivateKPIPayload {
  fiscalYearId: string
  kpiIds: Array<{
    kpiId: string
    activationType: KPIActivationType
    mandatoryTargetValue?: number
    allowOfficeOverride?: boolean
  }>
}

/**
 * Payload for Step 3: Target Distribution
 */
export interface SetKPITargetsPayload {
  fiscalYearId: string
  targets: Array<{
    activatedKPIId: string
    deliveryUnitId: string
    targetValue: number
    isLockedByPlanning?: boolean
    lockReason?: string
  }>
}

/**
 * Summary data for each step
 */
export interface AppStep1Summary {
  fiscalYear: AppFiscalYear
  isComplete: boolean
}

export interface AppStep2Summary {
  fiscalYear: AppFiscalYear
  activatedKPIs: ActivatedKPI[]
  mandatedCount: number
  availableForShoppingCount: number
  isComplete: boolean
}

export interface AppStep3Summary {
  fiscalYear: AppFiscalYear
  targets: KPITarget[]
  lockedTargetCount: number
  pendingCount: number
  isComplete: boolean
}
