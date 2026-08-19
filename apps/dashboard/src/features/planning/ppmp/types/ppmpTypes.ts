import { FiscalYear } from '../../fiscal-year-and-policies/fiscal-year-management/types/types'

export enum PPMPState {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  AMENDING = 'amending',
  SUPERSEDED = 'superseded',
  CONSOLIDATED = 'consolidated',
  REJECTED = 'rejected',
}

/**
 * Keycloak-mapped approval roles for the 3-tier approval workflow
 */
export enum ApprovalRole {
  BUDGET_OFFICER = 'budget_officer',
  BAC_SECRETARIAT = 'bac_secretariat',
  HOPE = 'hope',
}

/**
 * Ordered approval chain — earlier index = earlier stage
 */
export const APPROVAL_CHAIN: ApprovalRole[] = [
  ApprovalRole.BUDGET_OFFICER,
  ApprovalRole.BAC_SECRETARIAT,
  ApprovalRole.HOPE,
]

/**
 * Mode of Procurement options
 */
export type ModeOfProcurement =
  | 'NP-53.5' // Agency-to-Agency (CSE items)
  | 'NP-53.9' // Small Value Procurement (Non-CSE < threshold)
  | 'Public Bidding' // Competitive Bidding (Non-CSE >= threshold)
  | 'NP-53.1' // Two-Failed Biddings
  | 'Shopping' // Shopping
  | 'By Administration'

export type PreProcurementConferenceValue = 'yes' | 'no' | 'N/A'

/**
 * Catalog item type — allows filtering in the picker modal
 */
export type CatalogType = 'cse' | 'non-cse'

/**
 * Mode of Procurement for non-procurable costs (optional per cost category)
 */
export type NonProcurableMoP =
  | 'request-for-quote'
  | 'direct-purchase'
  | 'in-house'

export type SupportingDocumentCategory =
  | 'quotation'
  | 'specification'
  | 'certification'
  | 'photo'
  | 'other'

export interface PPMPAttachment {
  id: string
  fileName: string
  category: SupportingDocumentCategory
  mimeType: string
  fileSize: number
  previewUrl?: string | null
  uploadedAt: string
}

/**
 * A single cost category for a non-procurable IoE block
 * Custom rows stay editable; master-sourced rows are locked and derived from the
 * Cost Item Master library.
 * Validation: all monthly cells must have values > 0 before PPMP submission
 */
export interface NonProcurableCost {
  id: string
  costItemName: string // replaces 'categoryName' for consistency with procurable "Item"
  totalCost: number // computed: sum of monthlyAllocations
  monthlyAllocations: MonthlyQuantities
  distributionPattern: 'custom' // custom entry in the current UI
  mop?: NonProcurableMoP | null
  /** Tracks if all monthly cells are filled (>0) */
  isComplete?: boolean
  /** Standard unit cost copied from the master library for display/reference. */
  standardUnitCost?: number | null
  /** True for user-created rows, false when the row came from the master library. */
  isCustom?: boolean
  /** Locks the row in the UI; used for master-sourced rows. */
  isReadOnly?: boolean
  /** Optional planning marker for when the cost row is expected to be delivered/completed. */
  expectedDelivery?: string | null
  /** Optional freeform note for the cost row. */
  remarks?: string | null
  /** Optional supporting documents attached to the row. */
  attachments?: PPMPAttachment[] | null

  // ─── Metadata Fields (Parity with Procurable Items) ────────────────────────────
  /** Optional classification for the cost row (Goods | Infra | Consulting | N/A) */
  projectType?: ProcurementProjectType | null
  /** Quantity and size of the project to be procured. */
  sizeSpecification?: string | null
  /** Whether the cost row requires a pre-procurement conference. */
  preProcurementConference?: PreProcurementConferenceValue | null
  /** MM/YYYY start period for the procurement activity. */
  procurementStart?: string | null
  /** MM/YYYY end period for the procurement activity. */
  procurementEnd?: string | null
  /** Linked Market Scoping Form ID (optional; for RA 12009 compliance tracking) */
  marketScopingId?: string | null
  /** Display reference of the linked MSF (e.g. "MSF-2024-0012-v1"); null when unlinked */
  marketScopingRef?: string | null
  /** Project Cost Estimate from the linked MSF — used for budget validation; null when unlinked */
  marketScopingCostEstimate?: number | null
}

/**
 * Cost Item Master
 * Predefined cost item used to seed non-procurable IoE rows with consistent naming and pricing.
 */
export interface CostItemMaster {
  id: string
  costItemName: string
  category: string
  subcategory?: string | null
  standardUnitCost: number
  unitOfMeasure: string
  description: string
  uacsCode?: string | null
  isActive: boolean
  isCSE?: boolean
  createdDate: Date
  lastModified: Date
}

export interface CreateCostItemInput {
  costItemName: string
  category: string
  subcategory?: string | null
  standardUnitCost: number
  unitOfMeasure: string
  description: string
  uacsCode?: string | null
  isActive?: boolean
  isCSE?: boolean
}

export interface UpdateCostItemInput {
  costItemId: string
  changes: Partial<Omit<CostItemMaster, 'id' | 'createdDate' | 'lastModified'>>
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string
  name: string
  category: string
  unitPrice: number
  unitOfMeasure: string
  catalogType: CatalogType
  defaultMoP: ModeOfProcurement
  itemCode: string
  /** Non-CSE only: whether this is a mixed supply+service item */
  isMixed?: boolean
  /** Non-CSE only: subtype label (e.g. 'Service', 'Goods', 'Works') */
  subtype?: string | null
}

// ─── Budget Hierarchy ─────────────────────────────────────────────────────────

export interface LineItemBudget {
  id: string
  code: string
  name: string
  description: string | null
  totalAllocation: number
  psAllocation: number
  mooeAllocation: number
  coAllocation: number
  fiscalYear: number
}

export interface BudgetActivity {
  id: string
  name: string
  code: string
  libId: string
  description: string | null
}

export interface ItemOfExpenditure {
  id: string
  name: string
  code: string
  activityId: string
  budgetLimit: number
  description: string | null
}

// ─── Monthly Schedule ─────────────────────────────────────────────────────────

export type Month =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec'

export const ALL_MONTHS: Month[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
]

export const MONTH_LABELS: Record<Month, string> = {
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec',
}

export type MonthlyQuantities = Record<Month, number>

export function createEmptyMonthlyQuantities(): MonthlyQuantities {
  return {
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  }
}

// ─── Line Item ────────────────────────────────────────────────────────────────

/**
 * A single procurement item inside an IoE block.
 * unitPrice is locked from the catalog on addition and cannot be changed.
 * estimatedBudget is computed: sum(monthlyQuantities) × unitPrice
 */
export interface PPMPLineItem {
  id: string
  catalogItemId: string
  itemName: string
  unitOfMeasure: string
  unitPrice: number // locked from catalog — immutable
  /** Originating department for consolidated master-office line items */
  originDepartmentId: string | null
  /** Display name of the originating department, when available */
  originDepartmentName: string | null
  monthlyQuantities: MonthlyQuantities
  totalQuantity: number // computed: sum of monthlyQuantities
  estimatedBudget: number // computed: totalQuantity × unitPrice
  suggestedMoP: ModeOfProcurement
  mopOverride: ModeOfProcurement | null
  mopJustification: string // required when mopOverride is set
  ioEBlockId: string
  sortOrder: number
  /** Linked Market Scoping Form ID (required before submission per RA 12009 Sec. 10) */
  /** Linked Market Scoping Form (optional) — null when unlinked */
  marketScopingId?: string | null
  /** Display reference of the linked MSF (e.g. "MSF-2024-0012-v1"); null when unlinked */
  marketScopingRef?: string | null
  /** Project Cost Estimate from the linked MSF — used for budget validation; null when unlinked */
  marketScopingCostEstimate?: number | null
  /** Optional classification for the procurement line item. */
  projectType?: ProcurementProjectType | null
  /** Quantity and size of the project to be procured. */
  sizeSpecification?: string | null
  /** Whether the line item requires a pre-procurement conference. */
  preProcurementConference?: PreProcurementConferenceValue | null
  /** MM/YYYY start period for the procurement activity. */
  procurementStart?: string | null
  /** MM/YYYY end period for the procurement activity. */
  procurementEnd?: string | null
  /** MM/YYYY expected delivery marker for the line item. */
  expectedDelivery?: string | null
  /** Optional freeform note for the line item. */
  remarks?: string | null
  /** Optional supporting documents attached to the line item. */
  attachments?: PPMPAttachment[] | null
}

// ─── IoE Block ────────────────────────────────────────────────────────────────

/**
 * A container representing a specific Item of Expenditure within a PPMP Activity.
 * totalCost is the sum of all nested line items' estimatedBudgets (procurable)
 * or the sum of all costs' totalCost (non-procurable).
 * isOverBudget = totalCost > ioe.budgetLimit
 */
export interface PPMPIoEBlock {
  id: string
  ioEId: string
  ioEName: string
  ioECode: string
  budgetLimit: number
  activityBlockId: string
  items: PPMPLineItem[]
  /** For non-procurable blocks: manual cost categories with monthly breakdown */
  costs?: NonProcurableCost[]
  totalCost: number // computed
  isOverBudget: boolean // computed
  /** Whether catalog items can be added to this block */
  isProcurable: boolean
}

// ─── Activity Block ───────────────────────────────────────────────────────────

export interface PPMPActivityBlock {
  id: string
  activityId: string
  activityName: string
  activityCode: string
  ioEBlocks: PPMPIoEBlock[]
  totalCost: number // computed: sum of all IoE blocks
}

// ─── Approval Event ───────────────────────────────────────────────────────────

export interface ApprovalEvent {
  id: string
  ppmpId: string
  role: ApprovalRole
  action: 'approved' | 'rejected'
  actorId: string
  actorName: string
  notes: string | null
  timestamp: string
}

// ─── Core PPMP Document ───────────────────────────────────────────────────────

export type PPMP = {
  id: string
  documentName?: string
  description?: string
  ppmpNumber?: string
  officeId: string
  officeName?: string
  isMaster?: boolean
  fiscalYearId: string
  fiscalYearName?: string
  fiscalYear?: FiscalYear
  fundSourceId?: string
  fundSourceName?: string
  libId?: string
  libName?: string
  parentId?: string
  version?: number
  totalEstimatedBudget?: number
  status?: PPMPState
  submittedDate?: string
  approvedDate?: string
  consolidatedIntoId?: string
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  ParentPPMP?: PPMP
  PPMPItems?: PPMPItem[]
  PPMPItemAllocations?: PPMPItemAllocation[]
  PPMPActivities?: PPMPActivity[]
  ApprovalEvents?: ApprovalEvent[]
  isMasterOffice?: boolean
  state?: PPMPState
  activityBlocks?: PPMPActivityBlock[]
  approvalHistory?: ApprovalEvent[]
  currentApprovalStage?: ApprovalRole
  parentPpmpId?: string
  amendmentVersion?: number
  rejectionReason?: string
  isFinal?: boolean
  finalizedAt?: string
  finalizedBy?: string
}
export type PPMPDetails = PPMP & {
  ChildPPMPs?: PPMPDetails[]
}

// Payload used by consolidatePPMPsRequest (wraps CreatePPMPConsolidatePaylod shape for compatibility)
export type ConsolidatePPMPsPayload = {
  childPPMPIds?: string[]
  parentOfficeId: string
  fiscalYearId: string
  consolidatedPPMPNumber?: string
}


// ppmp approval history

export type PPMPApprovalHistory = {
  id: string
  ppmpId: string
  role?: string
  action?: string
  actorId?: string
  actorName?: string
  notes?: string
  timestamp: string
}

// ─── PPMP Item record ─────────────────────────────────────────────────────────
export type ProcurementProjectType =
  | 'Goods'
  | 'Infrastructure'
  | 'ConsultingServices'
  | 'GeneralSupportServices'

export type PPMPItem = {
  id: string
  ppmpExpenditureItemId: string
  cseItemId?: string
  nonCSEItemId?: string
  procurementModeId: string
  papCode?: string
  name?: string
  description?: string
  unit?: string
  unitPrice: number
  mopOverride: boolean
  mopJustification?: string
  createdAt: string
  createdBy?: string
  projectType?: ProcurementProjectType
  preProcurementConference?: boolean
  procurementStartDate?: string
  procurementEndDate?: string
  expectedDeliveryStart?: string
  expectedDeliveryEnd?: string
  remarks?: string
  PPMP?: PPMP
  PPMPItemAllocationTotalAmount?: number
  PPMPItemAllocations?: PPMPItemAllocation[]
  cseItemName?: string
  nonCSEItemName?: string
  procurementModeName?: string
  originDepartmentId?: string | null
  originDepartmentName?: string | null
}

export type PPMPItemDetails = PPMPItem & {}

// ─── PPMP Item Allocations ─────────────────────────────────────────────────────────

export type AllocationMonth =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December'

export type PPMPItemAllocation = {
  id: string
  ppmpItemId: string
  allocationMonth: AllocationMonth
  quantity: number
  amount: number
  createdAt: string
  createdBy?: string
  PPMPItem?: PPMPItem
  PPMP?: PPMP
}

export type PPMPItemAllocationDetails = PPMPItemAllocation & {}
// ─── Amendment Record ─────────────────────────────────────────────────────────

export interface PPMPAmendmentRecord {
  originalPpmpId: string
  originalDocumentName: string
  amendmentPpmpId: string
  amendmentVersion: number
  amendmentState: PPMPState
  reason: string
  createdAt: string
  createdBy: string
}

// ─── PPMP Activities ─────────────────────────────────────────────────────────
export type PPMPActivity = {
  id: string
  ppmpId: string
  libActivityId: string
  activityName?: string
  totalItems: number
  totalItemAllocations: number
  totalAllocationQuantity: number
  totalAllocationAmount: number
  createdAt: string
  createdBy?: string
  PPMPExpenditureItems?: PPMPExpenditureItem[]
}

/// ─── PPMP Expenditure Items ─────────────────────────────────────────────────────────

export type PPMPExpenditureItem = {
  id: string
  ppmpActivityId: string
  objectId?: string
  isProcurable: boolean
  totalCost: number
  createdAt: string
  createdBy?: string
  ppmpActivityName?: string
  ppmpItems?: PPMPItem[]
}
export type PPMPExpenditureItemDetails = PPMPExpenditureItem & {}
export type PPMPActivityDetails = PPMPActivity & {}

// ─── Form Payloads ────────────────────────────────────────────────────────────

export interface CreatePPMPMetadata {
  officeId: string
  fiscalYearId: string
  libId: string
  fundSourceId?: string | null
  parentId?: string | null
  ppmpNumber?: string | null
}

export interface AddActivityBlockPayload {
  ppmpId: string
  activityId: string
  ioEId: string
  isProcurable: boolean
}

export interface AddItemsToIoEPayload {
  ppmpId: string
  ioEBlockId: string
  catalogItemIds: string[]
}

export interface UpdateLineItemSchedulePayload {
  ppmpId: string
  itemId: string
  monthlyQuantities: MonthlyQuantities
}

export interface UpdateMoPPayload {
  ppmpId: string
  itemId: string
  mopOverride: ModeOfProcurement
  mopJustification: string
}

export interface UpdateLineItemMetadataPayload {
  ppmpId: string
  itemId: string
  projectType?: ProcurementProjectType | null
  sizeSpecification?: string | null
  preProcurementConference?: PreProcurementConferenceValue | null
  procurementStart?: string | null
  procurementEnd?: string | null
  expectedDelivery?: string | null
  remarks?: string | null
}

export interface AmendPPMPFormValues {
  reason: string
}

// ─── State Transitions ────────────────────────────────────────────────────────

export type PPMPStateTransition = {
  [key in PPMPState]?: PPMPState[]
}

export const VALID_STATE_TRANSITIONS: PPMPStateTransition = {
  [PPMPState.DRAFT]: [PPMPState.PENDING_REVIEW],
  [PPMPState.PENDING_REVIEW]: [
    PPMPState.APPROVED,
    PPMPState.REJECTED,
    PPMPState.DRAFT,
  ],
  [PPMPState.APPROVED]: [PPMPState.AMENDING],
  [PPMPState.AMENDING]: [PPMPState.APPROVED, PPMPState.PENDING_REVIEW],
  [PPMPState.REJECTED]: [PPMPState.DRAFT],
  [PPMPState.SUPERSEDED]: [],
  [PPMPState.CONSOLIDATED]: [],
}

export function isValidStateTransition(
  currentState: PPMPState,
  nextState: PPMPState,
): boolean {
  const allowedTransitions = VALID_STATE_TRANSITIONS[currentState]
  return allowedTransitions?.includes(nextState) ?? false
}

// -- ppmp/by-office/officeId
export type PPMPByOffice = PPMPDetails & {}

// -- ppmp/by-fiscal-year/fiscalYearId
export type PPMPByFiscalYear = PPMPDetails & {}
