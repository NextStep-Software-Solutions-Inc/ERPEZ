/**
 * APR (Agency Purchase Request) Types & Interfaces
 * 
 * Defines all data structures for APR functionality aligned with PS-DBM Form 002
 */

/**
 * APR Status Enum
 */
export enum APRStatus {
  DRAFT = 'DRAFT',
  FOR_APPROVAL = 'FOR_APPROVAL',
  RETURNED = 'RETURNED',
  APPROVED = 'APPROVED',
  PARTIALLY_AVAILABLE = 'PARTIALLY_AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * Mode of Delivery Options (Form 002)
 */
export enum ModeOfDelivery {
  FAST_LANE = 'FAST_LANE',
  SCHEDULED_PICKUP = 'SCHEDULED_PICKUP',
  DOOR_TO_DOOR = 'DOOR_TO_DOOR',
}

/**
 * Insufficient Funds Handling Options
 */
export enum InsufficientFundsAction {
  REDUCE_QUANTITY = 'REDUCE_QUANTITY',
  BILL_US = 'BILL_US',
  CHARGE_TO_DEPOSIT = 'CHARGE_TO_DEPOSIT',
}

/**
 * Attachment Types for Non-Common Items
 */
export interface AttachmentOptions {
  observationReportRequired: boolean
  collectiveBarterAgreementRequired: boolean
  completeSpecsRequired: boolean
}

/**
 * Consolidated CSE Item from PPMP/APP
 * Links to APP (Annual Procurement Plan) via appLineItemId
 * Tracks variance from approved APP allocation
 */
export interface ConsolidatedAPRItem {
  id: string
  itemCode: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  office: string
  fundSource: string // General Fund, SEF, etc.
  ppmpId: string
  appId: string
  itemCategory: string // Goods, Services, Infrastructure
  allotmentClass: 'CO' | 'MOOE'
  sourceFiscalYear: number
  sourceCategory: string // From Categories filter
  sourceMonth: string // From Months filter
  // APP References (SPMS Compliance)
  appLineItemId: string // ✅ Link to specific APP BAC line item
  appBACId?: string // BAC document reference
  appApprovedQuantity: number // Original approved quantity in APP
  appApprovedBudget: number // Original approved budget in APP
  // Variance Tracking (Budget Alignment)
  quantityVariance: number // Current quantity - APP approved quantity
  quantityVariancePercent: number // (quantityVariance / appApprovedQuantity) * 100
  budgetVariance: number // Current budget - APP approved budget
  budgetVariancePercent: number // (budgetVariance / appApprovedBudget) * 100
  // Procurement Milestones from BAC
  bacMilestones?: APRMilestones // Copied from APP BAC at time of APR creation
  // PSDBM Catalog Integration (for Draft APR items)
  psdbmMatches?: Array<{
    itemCode: string
    description: string
    unitPrice: number
    unit: string
    availability: string
  }> // Available catalog items matching this APR item category
}

/**
 * APR Header & Terms Configuration
 */
export interface APRHeader {
  aprNumber?: string
  agencyControlNumber: string
  agencyAccountCode: string
  description: string
  requestDate: string
  fiscalYear: number
  procuringEntity: string
  requestingEntity: string
}

/**
 * Procurement Milestones (BAC)
 */
export interface APRMilestones {
  advertisementDate?: string // Advertisement/Posting of IB/REI
  submissionDate?: string // Submission/Opening of Bids
  noticeOfAwardDate?: string // Notice of Award
  contractSigningDate?: string // Contract Signing
}

/**
 * APR Terms & Conditions
 */
export interface APRTerms {
  modeOfDelivery: ModeOfDelivery
  insufficientFundsAction: InsufficientFundsAction
  attachments: AttachmentOptions
  milestones?: APRMilestones
  remarks?: string
}

/**
 * APR Master Record
 * Linked to APP (Annual Procurement Plan) for SPMS compliance
 * Traces all items back to approved procurement plan
 */
export interface APRMaster {
  id: string
  aprNumber: string
  agencyControlNumber: string
  agencyAccountCode: string
  description: string
  requestDate: string
  fiscalYear: number
  status: APRStatus
  procuringEntity: string
  requestingEntity: string
  requestedBy: string
  requestedByPosition: string
  header: APRHeader
  terms: APRTerms
  consolidatedItems: ConsolidatedAPRItem[]
  totalItemsCount: number
  totalAmount: number
  createdBy: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  returnedAt?: string
  returnedBy?: string
  returnRemarks?: string
  signedDocumentUrl?: string // URL to physically signed APR file
  // APP Integration (SPMS Compliance)
  sourceAPPId: string // ✅ Which APP does this APR derive from?
  appStatus: 'DRAFT' | 'CONSOLIDATING' | 'CONSOLIDATED' | 'APPROVED' | 'REJECTED' // Status of source APP
  appApprovedBudget: number // Total approved budget in source APP
  appApprovedItemsCount: number // Total approved items in source APP
  // Variance & Validation
  totalBudgetVariance: number // Sum of all item budget variances
  totalBudgetVariancePercent: number // (totalBudgetVariance / appApprovedBudget) * 100
  appValidationStatus: 'NOT_VALIDATED' | 'VALID' | 'VARIANCE_THRESHOLD_EXCEEDED' // Validation result
  appValidationMessage?: string // Reason if validation failed
}

/**
 * APR Creation Payload
 * Now requires source APP selection for SPMS compliance
 * 
 * Pre-converted consolidatedItems avoid needing to lookup APP data in production
 */
export interface CreateAPRPayload {
  header: APRHeader
  terms: APRTerms
  sourceAPPId: string // ✅ REQUIRED: Which APP is this APR derived from?
  selectedAppLineItemIds?: string[] // Which specific APP items to include (for backward compatibility)
  consolidatedItems?: ConsolidatedAPRItem[] // ✅ Pre-converted APR items from APP (preferred)
}

/**
 * APP Reference for APR Traceability
 * Maintains audit trail linking APR back to source APP
 */
export interface APRAppReference {
  appId: string
  appNumber: string
  appStatus: string
  appApprovedBudget: number
  consolidatedAt: string
  approvedAt?: string
  approvedBy?: string
}

/**
 * APR Validation Context
 * Used to validate APR against source APP
 */
export interface APRValidationContext {
  aprId: string
  sourceAPPId: string
  appStatus: string // Must be APPROVED
  budgetThresholdPercent: number // e.g., 10% variance allowed
  quantityThresholdPercent: number // e.g., 10% variance allowed
  validationErrors: string[]
  isValid: boolean
}

/**
 * APR Item Consolidation Filter
 */
export interface APRConsolidationFilter {
  fiscalYear?: number
  categories: string[]
  months: string[]
  funds: string[]
}

/**
 * APP Line Item Selection State for APR Creation
 * Manages selection of APP items when creating new APR
 */
export interface APRConsolidationState {
  sourceAPPId: string // Selected APP document ID
  selectedAppLineItemIds: string[] // Selected line items from APP BAC
  selectedItems: ConsolidatedAPRItem[] // Prepared items for APR
  filter: APRConsolidationFilter // Filtering options for item selection
  isLoading: boolean // Loading state during APP fetch
}

/**
 * APR Submission for Review
 */
export interface SubmitAPRPayload {
  aprId: string
  submittedAt: string
}

/**
 * APR Return (with remarks)
 */
export interface ReturnAPRPayload {
  aprId: string
  remarks: string
  returnedAt: string
}

/**
 * APR Approval (with signed document)
 */
export interface ApproveAPRPayload {
  aprId: string
  signedDocumentFile: File
  approvedAt: string
}

/**
 * Stock Availability Status
 */
export enum StockAvailabilityStatus {
  FULL_AVAILABLE = 'FULL_AVAILABLE',
  PARTIALLY_AVAILABLE = 'PARTIALLY_AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * APR Item Stock Status (for Phase 3)
 */
export interface APRItemStockStatus {
  aprItemId: string
  psdbmItemId: string
  status: StockAvailabilityStatus
  availableQuantity: number
  requestedQuantity: number
  outOfStockQuantity: number
  holdExpiresAt?: string
}

/**
 * Re-export Admin Types
 */
export type { APRStatistics, AdminAPRListResponse, AdminAPRFilters } from './types/adminTypes'


/**
 * Certificate of Non-Availability of Stocks (CNAS)
 */
export interface CNAS {
  id: string
  aprId: string
  aprNumber: string
  generatedAt: string
  outOfStockItems: ConsolidatedAPRItem[]
  status: 'GENERATED' | 'FORWARDED_TO_PR'
}

/**
 * APR List Response with Pagination
 */
export interface APRListResponse {
  data: APRMaster[]
  total: number
  page: number
  pageSize: number
}
