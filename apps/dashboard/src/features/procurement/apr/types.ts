/**
 * APR (Agency Purchase Request) Types & Interfaces
 * 
 * Defines all data structures for APR functionality aligned with PS-DBM Form 002
 * and backend ERD / API DTO contracts.
 */

/**
 * APR Status Enum aligned with backend StatusEnum
 */
export enum APRStatus {
  Draft = 'Draft',
  DRAFT = 'Draft',
  Submitted = 'Submitted',
  SUBMITTED = 'Submitted',
  ForApproval = 'ForApproval',
  FOR_APPROVAL = 'ForApproval',
  Returned = 'Returned',
  RETURNED = 'Returned',
  Approved = 'Approved',
  APPROVED = 'Approved',
  Active = 'Active',
  ACTIVE = 'Active',
  Archived = 'Archived',
  ARCHIVED = 'Archived',
  Completed = 'Completed',
  COMPLETED = 'Completed',
  Failed = 'Failed',
  FAILED = 'Failed',
  Pending = 'Pending',
  PENDING = 'Pending',
  PartiallyAvailable = 'PartiallyAvailable',
  PARTIALLY_AVAILABLE = 'PartiallyAvailable',
  OutOfStock = 'OutOfStock',
  OUT_OF_STOCK = 'OutOfStock',
}

/**
 * Mode of Delivery Options (Form 002) aligned with backend APRModeOfDelivery
 */
export enum ModeOfDelivery {
  FAST_LANE = 'FastLane',
  SCHEDULED_PICKUP = 'ScheduledPickUp',
  DOOR_TO_DOOR = 'DoorToDoor',
}

/**
 * Insufficient Funds Handling Options aligned with backend APRInsufficientFundsAction
 */
export enum InsufficientFundsAction {
  REDUCE_QUANTITY = 'ReduceQuantity',
  BILL_US = 'BillUs',
  CHARGE_TO_DEPOSIT = 'ChargeToUnutilizedDeposit',
}

/**
 * Attachment Types for Non-Common Items
 */
export interface AttachmentOptions {
  observationReportRequired?: boolean
  collectiveBarterAgreementRequired?: boolean
  completeSpecsRequired?: boolean
}

/**
 * Backend APR List Item DTO (from GET /aprs)
 */
export interface APRListItemDto {
  id: string
  aprNumber: string
  itemCount: number
  totalAmount: number
  requestDate: string
  status: APRStatus | string
  officeName: string
  fiscalYear: number
}

/**
 * Backend Milestone DTO within APR Item
 */
export interface APRItemMilestoneDto {
  id: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  scheduledDate: string
  remarks?: string | null
}

/**
 * Backend APR Item DTO (within GET /aprs/:id)
 */
export interface APRItemDto {
  id: string
  appItemId: string
  ppmpItemId: string
  description: string
  unit: string
  quantityRequested: number
  unitCost: number
  totalCost: number
  fulfilledQuantity?: number
  deficit?: number
  milestones: APRItemMilestoneDto[]
}

/**
 * Backend APR Detail DTO (from GET /aprs/:id)
 */
export interface APRDetailDto {
  id: string
  aprNumber: string
  appId: string
  appNumber: string
  officeId: string
  officeName: string
  fiscalYearId: string
  fiscalYear: number
  totalAmount: number
  status: APRStatus | string
  agencyControlNumber?: string | null
  agencyAccountCode?: string | null
  requestDate: string
  description?: string | null
  modeOfDelivery: ModeOfDelivery | string
  insufficientFundsAction: InsufficientFundsAction | string
  requiresObR: boolean
  requiresCBA: boolean
  requiresCompleteSpecifications: boolean
  additionalRemarks?: string | null
  submittedDate?: string | null
  approvedDate?: string | null
  returnedDate?: string | null
  returnRemarks?: string | null
  approvedBy?: string | null
  returnedBy?: string | null
  linkedPurchaseRequestId?: string | null
  linkedPurchaseRequestNumber?: string | null
  linkedPurchaseRequestStatus?: string | null
  linkedPurchaseRequests?: LinkedPurchaseRequestDto[]
  items: APRItemDto[]
}

export interface LinkedPurchaseRequestDto {
  id: string
  prNumber: string
  status: string
  totalAmount?: number
  createdAt?: string
}

/**
 * Consolidated CSE Item from PPMP/APP
 */
export interface ConsolidatedAPRItem {
  id: string
  itemCode: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  office?: string
  fundSource?: string
  ppmpId?: string
  appId?: string
  itemCategory?: string
  allotmentClass?: 'CO' | 'MOOE'
  sourceFiscalYear?: number
  sourceCategory?: string
  sourceMonth?: string
  // APP References (SPMS Compliance)
  appLineItemId: string
  appItemId?: string
  appBACId?: string
  appApprovedQuantity?: number
  appApprovedBudget?: number
  imageUrl?: string
  // Variance Tracking
  quantityVariance?: number
  quantityVariancePercent?: number
  budgetVariance?: number
  budgetVariancePercent?: number
  // Stock & Availability Tracking
  outOfStockQuantity?: number
  isOutOfStock?: boolean
  deficit?: number
  servedQuantity?: number
  psdbmMatches?: Array<{
    itemCode: string
    description: string
    unitPrice: number
    unit: string
    availability: string
  }>
}

/**
 * APR Header & Terms Configuration
 */
export interface APRHeader {
  aprNumber?: string
  agencyControlNumber?: string
  agencyAccountCode?: string
  description?: string
  requestDate: string
  fiscalYear: number
  procuringEntity?: string
  requestingEntity?: string
}

/**
 * Procurement Milestones (BAC)
 */
export interface APRMilestones {
  advertisementDate?: string
  submissionDate?: string
  noticeOfAwardDate?: string
  contractSigningDate?: string
}

/**
 * APR Terms & Conditions
 */
export interface APRTerms {
  modeOfDelivery: ModeOfDelivery | string
  insufficientFundsAction: InsufficientFundsAction | string
  attachments?: AttachmentOptions
  milestones?: APRMilestones
  remarks?: string
}

/**
 * APR Master Record (UI View Model)
 */
export interface APRMaster {
  id: string
  aprNumber: string
  agencyControlNumber?: string
  agencyAccountCode?: string
  description?: string
  requestDate: string
  fiscalYear: number
  status: APRStatus | string
  officeId?: string
  officeName?: string
  procuringEntity?: string
  requestingEntity?: string
  requestedBy?: string
  requestedByPosition?: string
  header?: APRHeader
  terms?: APRTerms
  consolidatedItems: ConsolidatedAPRItem[]
  totalItemsCount: number
  totalAmount: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  submittedAt?: string | null
  approvedAt?: string | null
  approvedBy?: string | null
  returnedAt?: string | null
  returnedBy?: string | null
  returnRemarks?: string | null
  signedDocumentUrl?: string
  linkedPurchaseRequestId?: string | null
  linkedPurchaseRequestNumber?: string | null
  linkedPurchaseRequestStatus?: string | null
  linkedPurchaseRequests?: LinkedPurchaseRequestDto[]
  sourceAPPId?: string
  appStatus?: string
  appApprovedBudget?: number
  appApprovedItemsCount?: number
  totalBudgetVariance?: number
  totalBudgetVariancePercent?: number
  appValidationStatus?: string
  appValidationMessage?: string
}

/**
 * Backend Create APR Item DTO
 */
export interface CreateAPRItemInputDto {
  appItemId: string
  quantityRequested?: number | null
  unitCost?: number | null
}

/**
 * Backend Create APR Command Payload (POST /aprs)
 */
export interface CreateAPRCommandPayload {
  appId: string
  officeId: string
  fiscalYearId: string
  agencyControlNumber?: string | null
  agencyAccountCode?: string | null
  requestDate: string
  description?: string | null
  modeOfDelivery: ModeOfDelivery | string
  insufficientFundsAction: InsufficientFundsAction | string
  requiresObR: boolean
  requiresCBA: boolean
  requiresCompleteSpecifications: boolean
  additionalRemarks?: string | null
  items: CreateAPRItemInputDto[]
}

/**
 * Frontend Create APR Payload (for form handling)
 */
export interface CreateAPRPayload {
  header: APRHeader
  terms: APRTerms
  sourceAPPId: string
  officeId?: string
  fiscalYearId?: string
  selectedAppLineItemIds?: string[]
  consolidatedItems?: ConsolidatedAPRItem[]
  items?: CreateAPRItemInputDto[]
}

/**
 * Backend Update APR Command Payload (PUT /aprs/:id)
 */
export interface UpdateAPRCommandPayload {
  id: string
  appId?: string | null
  agencyControlNumber?: string | null
  agencyAccountCode?: string | null
  requestDate: string
  description?: string | null
  modeOfDelivery: ModeOfDelivery | string
  insufficientFundsAction: InsufficientFundsAction | string
  requiresObR: boolean
  requiresCBA: boolean
  requiresCompleteSpecifications: boolean
  additionalRemarks?: string | null
  items: Array<{
    appItemId: string
    quantityRequested?: number | null
    unitCost?: number | null
  }>
}

/**
 * Change APR Status Request (PATCH /aprs/:id/status)
 */
export interface ChangeAPRStatusRequest {
  status: APRStatus | string
  remarks?: string | null
}

/**
 * APR Submission for Review
 */
export interface SubmitAPRPayload {
  aprId: string
  submittedAt?: string
}

/**
 * APR Return (with remarks)
 */
export interface ReturnAPRPayload {
  aprId: string
  remarks: string
  returnedAt?: string
}

/**
 * APR Approval (with signed document)
 */
export interface ApproveAPRPayload {
  aprId: string
  signedDocumentFile?: File
  approvedAt?: string
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
 * APR Item Stock Status
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

export interface APRConsolidationState {
  sourceAPPId: string
  selectedAppLineItemIds: string[]
  selectedItems: ConsolidatedAPRItem[]
  filter: {
    categories: string[]
    months: string[]
    funds: string[]
  }
  isLoading: boolean
}

/**
 * APR List Response with Pagination
 */
export interface APRListResponse {
  data: APRListItemDto[]
  total: number
  page: number
  pageSize: number
}

/**
 * Combined form values for Create and Edit APR wizard
 */
export interface APRFormValues {
  agencyControlNumber: string
  agencyAccountCode: string
  description: string
  requestDate: string
  fiscalYear: number
  modeOfDelivery: ModeOfDelivery | string
  insufficientFundsAction: InsufficientFundsAction | string
  attachments: {
    observationReportRequired: boolean
    collectiveBarterAgreementRequired: boolean
    completeSpecsRequired: boolean
  }
  remarks: string
}

