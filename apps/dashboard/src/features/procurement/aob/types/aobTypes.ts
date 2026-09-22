/**
 * AOB (Abstract of Bids) Feature Types
 * 
 * Comprehensive type definitions for the AOB feature including:
 * - AOB entity and status tracking
 * - Bid matrix and supplier bids
 * - Award criteria and winner selection
 * - Related RFQ and line item data
 *
 * @see documentations/aob-feature-overview.md for complete feature documentation
 * including data architecture, business logic, and integration patterns.
 */

export enum AOBStatus {
  DRAFT = 'Draft',
  FOR_APPROVAL = 'ForApproval',
  APPROVED = 'Approved',
  RETURNED = 'Returned',
  REJECTED = 'Returned',
  CANCELLED = 'Cancelled',
}

export enum AwardCriterion {
  LCRB = 'LCRB', // Lowest Calculated and Responsive Bid
  MEARB = 'MEARB', // Most Economically Advantageous Responsive Bid
  MARB = 'MARB_HRRB_SRRB', // Most Advantageous Responsive Bid
  MARB_HRRB_SRRB = 'MARB_HRRB_SRRB',
  LCCRB = 'LCCRB', // Lowest Calculated and Responsive Bid for Consulting Services
}

export enum SubmissionType {
  ELECTRONIC = 'Electronic',
  PHYSICAL = 'Physical',
  MANUAL = 'Manual', // Manual entry for physical submissions
}

// ============================================
// MAIN AOB ENTITY
// ============================================

export interface AOB {
  id: string
  aobNumber: string
  description?: string
  date?: string // ISO date
  aobDate?: string // ISO date
  openingDate: string // ISO date
  status: AOBStatus | string
  awardCriterion: AwardCriterion | string

  // RFQ Linking
  rfqId?: string | null
  rfqNumber?: string
  rfqIds?: string[]
  rfqs?: AOBMatrixRFQ[]
  rfqCategories?: string[] // Selected RFQ categories

  // Metadata & Approvals
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  approverName?: string
  approverTitle?: string
  signedDocumentUrl?: string // Signed AOB resolution PDF URL
  remarks?: string
  awardedItems?: AOBAwardedItemResponse[]

  // References
  bacResolutionNumber?: string
  prNumber?: string
  papCode?: string
}

export interface AOBAwardedItemResponse {
  id: string
  rfqItemId: string
  itemName: string
  winningSupplierId: string
  winningSupplierName: string
  awardedUnitPrice: number
  awardedQuantity: number
  totalAwardedAmount: number
  score?: number
  awardReason?: string
  purchaseOrderId?: string
}

// ============================================
// RFQ-RELATED TYPES
// ============================================

export interface RFQItem {
  id: string
  rfqId: string
  itemCode?: string
  description?: string
  itemName?: string
  itemNameSnapshot?: string
  quantity: number
  unit?: string
  unitPriceSnapshot?: number
  approvedBudgetForContract: number // ABC
  category?: string
  fundSource?: string
  isBrochureRequired?: boolean
  greenSpecification?: string
}

export interface AOBMatrixRFQ {
  id: string
  rfqNumber: string
  tracingNumber?: string
  totalAmount?: number
  status?: string
  date?: string
  deadline?: string
}

export interface RFQCategory {
  id: string
  rfqId: string
  categoryCode: string
  categoryName: string
  description?: string
}

// ============================================
// SUPPLIER BID TYPES
// ============================================

export interface Supplier {
  id: string
  supplierId: string
  supplierName: string
  name?: string
  email?: string
  submissionType?: SubmissionType | string
  isResponsive?: boolean // Meets minimum requirements
  remarks?: string
  submittedAt?: string
  deliveryPeriod?: string
  validityPeriodDays?: number
  brochureUrl?: string // Uploaded brochure/technical docs
}

export interface SupplierBid {
  id?: string
  bidItemId?: string
  bidMatrixId?: string
  lineItemId?: string
  rfqItemId?: string
  supplierId: string
  supplierName: string
  itemBid?: number | null // Unit price per item
  unitBid?: number | null // Unit price
  unitPrice?: number | null
  totalBid?: number | null // Calculated: quantity * unitBid
  totalPrice?: number | null
  currency?: string
  brand?: string | null
  model?: string | null
  color?: string | null
  brochureFileId?: string | null
  brochureFileUrl?: string | null
  isResponsive?: boolean
  isOverABC?: boolean
  disqualificationReason?: string | null
  rank?: number
  score?: number
  qualityScore?: number | null // For MEARB/MARB only
  calculatedQualityPriceRatio?: number // For MEARB/MARB only
  remarks?: string | null
  isWinner?: boolean
  winningReason?: string // Why this bid was selected
  offerDocumentUrl?: string // Supplier's specific bid/offer document for this item
}

// ============================================
// BID MATRIX / LINE ITEM TYPES
// ============================================

export interface LineItem {
  id: string
  aobId?: string
  rfqId?: string
  rfqItemId?: string
  itemCode?: string
  description?: string
  itemName?: string
  name?: string
  quantity: number
  unit?: string
  approvedBudgetForContract: number // ABC
  abcUnitPrice?: number
  totalABC?: number
  category?: string
  fundSource?: string
  isBrochureRequired?: boolean
  greenSpecification?: string
  brochureUrl?: string // Item specifications/brochure uploaded
  lineItems?: SupplierBid[] // All bids for this item across suppliers
  bids?: SupplierBid[]
  selectedWinnerId?: string | null // Selected winner supplier ID
  selectedWinnerBid?: SupplierBid | null // The winning bid
  awardCriterion?: string
}

export interface BidMatrix {
  id?: string
  aobId: string
  aobNumber?: string
  description?: string
  awardCriterion?: AwardCriterion | string
  status?: AOBStatus | string
  aobDate?: string
  openingDate?: string
  isBidsOpened?: boolean
  hasMinimumCanvassWarning?: boolean
  remarks?: string
  bacResolutionNumber?: string
  prNumber?: string
  papCode?: string
  approverName?: string
  approverTitle?: string
  linkedRFQs?: AOBMatrixRFQ[]
  suppliers: Supplier[] // All suppliers who submitted bids
  items?: LineItem[]
  lineItems: LineItem[] // All line items with their bids
  bids?: SupplierBid[]
  createdAt?: string
  updatedAt?: string
  isDraft?: boolean
}

// ============================================
// WINNER SELECTION
// ============================================

export interface Winner {
  id?: string
  aobId?: string
  lineItemId?: string
  rfqItemId?: string
  supplierId: string
  winningSupplierId?: string
  supplierName?: string
  winningSupplierName?: string
  bidAmount?: number
  awardedUnitPrice?: number
  awardedQuantity?: number
  totalAwardedAmount?: number
  score?: number
  awardReason?: string
  selectionDate?: string
  selectedBy?: string
}

// ============================================
// BROCHURE / DOCUMENT TYPES
// ============================================

export interface BrochureDocument {
  id: string
  aobId: string
  supplierId: string
  supplierName: string
  documentName: string
  documentUrl: string
  documentType: 'PDF' | 'Image' | 'Document'
  uploadedAt: string
  uploadedBy: string
  fileSize: number // in bytes
}

// ============================================
// APPROVAL & WORKFLOW TYPES
// ============================================

export interface AOBApprovalPayload {
  aobId: string
  approvedBy?: string
  signedDocumentUrl?: string // Signed AOB resolution PDF
  remarks?: string
  remarksBy?: string
  approvalDate?: string
}

export interface AOBReturnPayload {
  aobId: string
  remarks: string
  returnedBy?: string
  returnDate?: string
}

// ============================================
// API REQUEST/RESPONSE PAYLOADS
// ============================================

export interface CreateAOBPayload {
  aobNumber: string
  description?: string
  date?: string
  aobDate?: string
  openingDate: string
  awardCriterion?: AwardCriterion | string
  rfqIds?: string[]
}

export interface UpdateAOBPayload {
  id?: string
  aobNumber?: string
  description?: string
  date?: string
  aobDate?: string
  openingDate?: string
  awardCriterion?: AwardCriterion | string
}

export interface LinkRFQPayload {
  aobId: string
  rfqId?: string
  rfqIds: string[]
  selectedCategories?: string[] // RFQ category IDs to link
}

export interface UpdateBidMatrixPayload {
  aobId: string
  bids: SupplierBidInput[] // Array of updated bids
}

export interface SupplierBidInput {
  lineItemId?: string
  rfqItemId?: string
  supplierId: string
  itemBid?: number | null
  unitBid?: number | null
  unitPrice?: number | null
  brand?: string
  model?: string
  color?: string
  brochureFileUrl?: string
  qualityScore?: number
  remarks?: string
}

export interface AwardItemInputDto {
  rfqItemId: string
  winningSupplierId: string
  awardedUnitPrice: number
  awardedQuantity?: number
  totalAwardedAmount?: number
  score?: number
  awardReason?: string
  purchaseOrderId?: string
}

export interface SelectWinnerPayload {
  aobId: string
  lineItemId?: string
  rfqItemId?: string
  winningSupplierId?: string
  awardedUnitPrice?: number
  awardedQuantity?: number
  totalAwardedAmount?: number
  score?: number
  awardReason?: string
  awardedItems?: AwardItemInputDto[]
}

export interface SubmitAOBPayload {
  aobId: string
  submittedAt?: string
  submittedBy?: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AOBListResponse {
  data: AOB[]
  meta?: {
    pageNumber: number
    pageSize: number
    total: number
  }
}

export interface AOBDetailResponse {
  data: AOBDetail
}

export interface AOBDetail extends AOB {
  bidMatrix?: BidMatrix
  winners?: Winner[]
  documents?: BrochureDocument[]
}

// ============================================
// UI STATE TYPES (for forms and components)
// ============================================

export interface AOBFormValues {
  aobNumber: string
  description?: string
  date: string
  openingDate: string
  awardCriterion?: AwardCriterion
  rfqIds?: string[]
}

export interface AddRFQFormValues {
  rfqId: string
  rfqIds?: string[]
  selectedCategories: string[]
}

export interface BidMatrixFormValues {
  suppliers: Supplier[]
  lineItems: LineItemBidInput[]
}

export interface LineItemBidInput {
  lineItemId: string
  bids: {
    supplierId: string
    supplierName: string
    itemBid?: number | null
    unitBid?: number | null
    qualityScore?: number
    remarks?: string
  }[]
}

export interface ManualBidEntryInput {
  lineItemId: string
  supplierId: string
  supplierName: string
  itemBid?: number
  unitBid?: number
  qualityScore?: number
  remarks?: string
}
