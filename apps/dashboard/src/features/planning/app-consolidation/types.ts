/**
 * APP Consolidation Enhancement Types
 * Represents the Annual Procurement Plan workflow with full lineage tracking
 */

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================
export type UserRole = 'BAC_SECRETARIAT' | 'BAC_MEMBER' | 'HOPE' | 'ADMIN'

export interface User {
  id: string
  name: string
  role: UserRole
  office?: string
}

// ============================================================================
// APP STATE MANAGEMENT
// ============================================================================
export type AppStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Locked' | 'Returned'
export type AppType = 'Indicative' | 'Final' | 'Updated'


// ============================================================================
// BID EVALUATION & PROCUREMENT STRATEGY
// ============================================================================
export type BidEvaluationCriteria =
  | 'LCRB' // Lowest Calculated Responsive Bid
  | 'MEARB' // Most Economically Advantageous Responsive Bid
  | 'MARB' // Most Advantageous Responsive Bid / HRRB / SRRB
  | 'LCCRB' // Lowest Comparative or Competitive Responsive Bid

export type ProcurementStrategy =
  | 'LCA'
  | 'Subcontracting'
  | 'MultiYearContracting'
  | 'DesignAndBuild'
  | 'ProcurementAgent'
  | 'FrameworkAgreement'
  | 'PooledProcurement'
  | 'RenewalOfServices'
  | 'WarehousingInventory'
  | 'NotApplicable'
  | 'LCA_LCCA' // Legacy
  | 'SUBCONTRACTING'
  | 'MULTI_YEAR'
  | 'DESIGN_BUILD'
  | 'PROCUREMENT_AGENT'
  | 'FRAMEWORK_AGREEMENT'
  | 'POOLED_PROCUREMENT'
  | 'RENEWAL_SERVICES'
  | 'WAREHOUSING_INVENTORY'
  | 'NA'

export const BID_EVALUATION_CRITERIA_LABELS: Record<BidEvaluationCriteria, string> = {
  LCRB: 'Lowest Calculated Responsive Bid (LCRB)',
  MEARB: 'Most Economically Advantageous Responsive Bid (MEARB)',
  MARB: 'Most Advantageous Responsive Bid (MARB/HRRB/SRRB)',
  LCCRB: 'Lowest Comparative or Competitive Responsive Bid (LCCRB)',
}

export const PROCUREMENT_STRATEGY_LABELS: Record<ProcurementStrategy, string> = {
  LCA: 'Least Cost Analysis (LCA)',
  Subcontracting: 'Subcontracting',
  MultiYearContracting: 'Multi-Year Contracting',
  DesignAndBuild: 'Design and Build',
  ProcurementAgent: 'Engagement of a Procurement Agent',
  FrameworkAgreement: 'Use of Framework Agreement Section',
  PooledProcurement: 'Pooled Procurement Section 17',
  RenewalOfServices: 'Renewal of Regular and Recurring Services',
  WarehousingInventory: 'Warehousing & Inventory',
  NotApplicable: 'Not Applicable (N/A)',
  LCA_LCCA: 'Life Cycle Assessment (LCA) and Life Cycle Cost Analysis (LCCA)',
  SUBCONTRACTING: 'Subcontracting',
  MULTI_YEAR: 'Multi-Year Contracting',
  DESIGN_BUILD: 'Design-and-Build Scheme for Infrastructure Projects',
  PROCUREMENT_AGENT: 'Engagement of a Procurement Agent',
  FRAMEWORK_AGREEMENT: 'Use of Framework Agreement Section',
  POOLED_PROCUREMENT: 'Pooled Procurement Section 17',
  RENEWAL_SERVICES: 'Renewal of Regular and Recurring Services',
  WAREHOUSING_INVENTORY: 'Warehousing and Inventory Activities',
  NA: 'Not Applicable (N/A)',
}

// ============================================================================
// HYBRID SCHEDULE INPUT
// ============================================================================
export type ScheduleValueType =
  | Date
  | 'N/A'
  | 'as the need arises'
  | 'various dates'
  | string // comma-separated months (e.g., "01/2024, 07/2024")

export interface HybridScheduleValue {
  type: 'date' | 'predefined_string' | 'month_range' | 'text'
  value: ScheduleValueType
  displayText: string // Formatted display (e.g., "Jan 2024, Jul 2024" or "as the need arises")
}

// ============================================================================
// PPMP DATA STRUCTURES
// ============================================================================
export interface PPMPItem {
  id: string
  code: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  modeOfProcurement: string
  fundSource?: string // e.g., "General Fund", "SEF"
  itemCategory?: string // e.g., "Goods", "Services", "Infrastructure"
  office?: string // Office or Department
  allotmentClass: 'CO' | 'MOOE'
  scheduleId?: string
  scheduledDate?: string
  ppmpVersion?: number // Track which PPMP version this comes from
  remarks?: string // Remarks pulled from PPMP
}

// PPMP Version (for Supplemental APP Selection UI)
export interface PPMPVersion {
  id: string
  ppmpId: string
  version: string
  label: string
  description: string
  items: PPMPItem[]
}

// Delta Item (for Supplemental APP)
export interface DeltaItem extends PPMPItem {
  originalQuantity: number // Quantity in original PPMP
  amendedQuantity: number // Quantity in amended PPMP
  deltaQuantity: number // amended - original (the supplement)
  isNewItem: boolean // True if not in original PPMP
}

export interface PPMPData {
  id: string
  fiscalYear: number
  procuringEntity: string
  ppmpVersion: number
  baselineVersion?: number // For tracking amendment against original
  items: PPMPItem[]
  createdAt: string
  updatedAt: string
  isAmendment?: boolean // True if this is an amended version of another PPMP
  amendmentOf?: string // ID of the PPMP this amends
}

// APP Aggregation
export interface AggregatedItem {
  unit: string
  items: PPMPItem[]
  totalQuantity: number
  totalAmount: number
}

export interface APPAggregationResult {
  items: AggregatedItem[]
  totalAmount: number
}

// BAC (Budget Alignment Checklist) Data
export interface BACSchedule {
  id: string
  period: string // Q1, Q2, Q3, Q4, Monthly, etc.
  scheduledDate: string
  quantity: number
}

/**
 * BACMilestones - Enhanced with Hybrid Schedule Support
 * Each milestone can be:
 * - Specific date (YYYY-MM-DD)
 * - Predefined string ("N/A", "as the need arises", "various dates")
 * - Comma-separated months ("01/2024, 07/2024")
 * - Free-text input
 */
export interface BACMilestones {
  advertisementDate: ScheduleValueType // Advertisement/Posting of IB/REI
  submissionDate: ScheduleValueType // Submission/Opening of Bids
  noticeOfAwardDate: ScheduleValueType // Notice of Award
  contractSigningDate: ScheduleValueType // Contract Signing
}

export interface BACLineItem {
  id: string
  ppmpItemId?: string
  code?: string // Item code for reference (e.g., "ITEM-001", from delta extraction)
  description: string // Item name/title (e.g., "Office Chairs", "Laptops")
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  modeOfProcurement?: string
  allotmentClass?: 'CO' | 'MOOE'
  office?: string
  fundSource?: string // Funding source for this line item (e.g., 'General Fund', 'DBM', 'LGU')
  catalogItemId?: string // Reference to catalog item for lineage
  schedules: BACSchedule[]
  milestones?: BACMilestones
  remarks?: string
  eligibleForEPA: boolean
  epaRemarks?: string

  // Bid Evaluation & Procurement Strategy (Government Planning Process Enhancement)
  bidEvaluationCriteria?: BidEvaluationCriteria // One of: LCRB, MEARB, MARB/HRRB/SRRB, LCCRB
  mearbSustainabilityIndicators?: string // For MEARB: Sustainability indicators in technical specifications
  procurementStrategies?: ProcurementStrategy[] // Multiple strategies can be selected

  /**
   * Data Lineage: Track which PPMPs contributed to this consolidated item
   * Format: { ppmpId: { itemId, quantity, totalAmount, office } }
   */
  originatingPPMPs?: Record<string, { itemId: string; quantity: number; totalAmount: number; office?: string }>
  unsavedChanges?: boolean // Track if this item has unsaved edits
  lastModifiedBy?: string
  lastModifiedAt?: string
}

export type ProjectChecklistEnvelope = 'Envelope 1' | 'Envelope 2'

export interface ProjectChecklistRequirement {
  id: string
  name: string
  envelope: ProjectChecklistEnvelope
  enabled: boolean
  source: 'profile' | 'custom'
  note?: string
}

export interface ProjectChecklist {
  profileId: string
  profileName: string
  profileDescription: string
  projectCategory: 'Goods' | 'Infrastructure' | 'Consulting' | string
  procurementMode: string
  requirements: ProjectChecklistRequirement[]
  confirmed: boolean
  confirmedAt?: string
  confirmedBy?: string
}

export interface BACWorkspace {
  id: string
  appId: string
  lineItems: BACLineItem[]
  sourceFunds: string[]
  totalBudget: number
  modeOfProcurements: string[]
  projectChecklist?: ProjectChecklist
}

// Signatory
export interface Signatory {
  id: string
  name: string
  position: string
  department: string
  signatureDate?: string
}

export interface SignatoryBlock {
  preparedBy?: Signatory[]
  reviewedBy?: Signatory[]
  approvedBy?: Signatory[]
  certifiedBy?: Signatory[]
}

import type { APPPPMPRelationFromAPI, APPItemFromAPI } from './handlers/getAPPDetailRequest'

// APP Master Record - Enhanced with Full Workflow
export interface AppMaster {
  id: string
  ppmpIds: string[] // Multiple PPMPs can be consolidated into one APP
  appPpmps?: APPPPMPRelationFromAPI[] // Consolidated PPMPs array from the backend API
  fiscalYear: number
  fiscalYearId?: string
  ppmpVersions?: Record<string, number> // Track which PPMP versions were used (ppmpId -> version)
  appName: string // e.g., "Indicative APP 2024"
  appCode: string // e.g., "APP-2024-001"
  appNumber: string
  appType: AppType // 'Indicative' | 'Final' | 'Updated'
  batch?: string
  quarter?: string
  versionNumber?: number | null
  versionDate?: string | null
  sourceAppId?: string | null
  status: AppStatus // 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Locked'
  aggregationResults: APPAggregationResult
  bac: BACWorkspace
  signatories: SignatoryBlock
  createdAt: string
  updatedAt: string
  createdBy: string
  lockedAt?: string // Timestamp when APP was locked as Final
  lockedBy?: string // User who locked the APP
  submittedAt?: string // When submitted for approval
  submittedBy?: string
  approvedAt?: string // When approved by HoPE
  approvedBy?: string
  rejectionReason?: string // Reason if rejected
  rejectedAt?: string
  rejectedBy?: string
  description?: string
  remarks?: string
  isFinal?: string | boolean
  submittedDate?: string | null
  approvedDate?: string | null
  APPItems?: APPItemFromAPI[]
}

// Supplemental APP
export interface SupplementalAPP extends AppMaster {
  originalAppId: string
  originalPPMPVersions?: Record<string, number> // PPMP versions used in original APP
  amendedPPMPVersions?: Record<string, number> // New amended PPMP versions
  supplementalNumber: number // Sequential: 1, 2, 3, etc.
  supplementalName: string // e.g., "Supplemental Annual Procurement Plan No. 1 for FY 2024"
  deltaItems: DeltaItem[] // Items with delta calculation
  reason: string
  createdFromAmendedPPMPIds?: string[] // References to amended PPMPs that triggered this supplement

  // Supplemental Metadata (Task 3.2)
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' // Applicable quarter for the supplemental
  referenceMemoNo?: string // Optional reference or memo number (e.g., "Memo No. 2024-001")
  approvalDocument?: {
    name: string // Original filename
    path: string // Server path or storage key
    uploadedAt: string // ISO timestamp
    mimeType?: string // File MIME type
  }
}

// Form Types
export interface CreateAPPFormValues {
  ppmpIds?: string[] // Multiple PPMPs can be selected
  fiscalYear: number
  appName: string
  appCode: string
  appType: AppType
  batch?: string
  quarter?: string
  fiscalYearId?: string
  sourceAppId?: string
}

export interface BACFormValues {
  lineItems: BACLineItem[]
  sourceFunds: string[]
  modeOfProcurements: string[]
  projectChecklist?: ProjectChecklist
}

export interface SignatoryFormValues {
  preparedBy: Signatory
  reviewedBy: Signatory
  approvedBy: Signatory
  certifiedBy: Signatory
}

export interface AppApprovalFormValues {
  action: 'approve' | 'reject'
  remarks?: string
  setAsFinal?: boolean
}

// ============================================================================
// AGGREGATED ITEMS WITH LINEAGE
// ============================================================================
export interface ConsolidatedLineItem extends BACLineItem {
  /**
   * Complete lineage tracing: Which original PPMPs contributed to this item
   * Critical for regulatory compliance (RA 9184)
   */
  lineageDetails: Array<{
    ppmpId: string
    ppmpNumber: string
    office: string
    quantity: number
    unitCost: number
    totalAmount: number
    percentage: number // % of total (for visual breakdown)
  }>
}

// ============================================================================
// APP ITEM DETAIL (GET /app-items/{id})
// ============================================================================
export interface PPMPItemDetailFromAPI {
  id: string
  papCode?: string
  name: string
  description: string
  unit: string
  unitPrice: number
  quantity?: number
  totalAmount?: number
}

export interface ProcurementModeDetailFromAPI {
  id: string
  name: string
  description?: string
}

export interface FundSourceDetailFromAPI {
  id: string
  name: string
  code?: string
}

export interface OfficeDetailFromAPI {
  id: string
  name: string
  code?: string
}

export interface APPItemDetail {
  id: string
  appId: string
  ppmpItemId: string
  ppmpItemName: string
  procurementModeId: string
  procurementModeName: string
  fundSourceId: string
  fundSourceName: string
  officeId: string
  officeName: string
  papCode?: string
  remarks?: string
  isEarlyProcurementActivity: boolean
  isOutsourced: boolean
  bidEvaluationCriteria?: string
  procurementStrategies?: string[]
  createdAt?: string
  createdBy?: string
  updatedAt?: string | null
  updatedBy?: string | null
  APP?: {
    id: string
    appNumber: string
    name: string
  }
  PPMPItem?: PPMPItemDetailFromAPI
  ProcurementMode?: ProcurementModeDetailFromAPI
  FundSource?: FundSourceDetailFromAPI
  Office?: OfficeDetailFromAPI
  Schedules?: any[]
}
