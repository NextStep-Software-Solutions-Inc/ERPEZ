/**
 * NTP Types & Interfaces
 * Comprehensive type definitions for Notice to Proceed feature
 * Includes entities, payloads, responses, and form values
 */

// ============================================
// STATUS ENUMS
// ============================================

export enum NTPStatus {
  DRAFT = 'Draft',
  FOR_APPROVAL = 'For Approval',
  APPROVED = 'Approved',
  RETURNED = 'Returned',
}

export enum NTPSourceType {
  PO = 'PO',
  CONTRACT = 'Contract',
}

export enum ReturnReason {
  DOCUMENTATION_ERROR = 'Documentation Error',
  MISSING_INFORMATION = 'Missing Information',
  INCORRECT_SUPPLIER = 'Incorrect Supplier Details',
  AMOUNT_MISMATCH = 'Amount Mismatch',
  OTHER = 'Other',
}

// ============================================
// SUPPLIER INTERFACE
// ============================================

export interface Supplier {
  id: string
  supplierId: string
  supplierName: string
  contactPerson?: string
  address?: string
  email?: string
  phoneNumber?: string
}

// ============================================
// LINE ITEM FROM SOURCE DOCUMENT
// ============================================

export interface NTPLineItem {
  id: string
  itemCode: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  specs?: string // Product specifications
}

// ============================================
// SOURCE DOCUMENT REFERENCES
// ============================================

export interface PurchaseOrderReference {
  id: string
  poNumber: string
  poDate: string
  amount: number
  supplier: Supplier
  items: NTPLineItem[]
  status: string
}

export interface ContractReference {
  id: string
  contractNumber: string
  contractDate: string
  amount: number
  supplier: Supplier
  items: NTPLineItem[]
  status: string
}

// ============================================
// CORE NTP ENTITY
// ============================================

export interface NTP {
  id: string
  ntpNumber: string
  description?: string
  date: string // NTP issuance date
  status: NTPStatus
  sourceType: NTPSourceType // 'PO' or 'Contract'
  sourceDocumentId: string // FK to PO or Contract
  supplierName: string // Auto-filled from source doc
  supplierId?: string // Optional supplier ID
  totalAmount: number // Auto-filled from source doc
  itemsCount: number // Number of line items from source
  lineItems: NTPLineItem[] // Locked line items from source document
  // Audit Fields
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  // Submission Fields
  submittedBy?: string
  submittedAt?: string
  // Approval Fields
  approvedBy?: string
  approvedAt?: string
  signedDocumentUrl?: string // URL to uploaded signed NTP
  signedDocumentName?: string // Filename of signed document
  // Return Fields
  returnedBy?: string
  returnedAt?: string
  returnReason?: ReturnReason
  returnRemarks?: string
}

// ============================================
// API PAYLOAD TYPES
// ============================================

export interface CreateNTPPayload {
  ntpNumber: string
  description?: string
  date: string
  sourceType: NTPSourceType
  sourceDocumentId: string
}

export interface SubmitNTPPayload {
  ntpId: string
  submittedAt?: string
  submittedBy?: string
}

export interface ApproveNTPPayload {
  ntpId: string
  signedDocument: File // PDF file
  approvedBy: string
  approvalRemarks?: string
  approvedAt?: string
}

export interface ReturnNTPPayload {
  ntpId: string
  reason: ReturnReason
  remarks: string
  returnedBy?: string
  returnedAt?: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface NTPListResponse {
  data: NTP[]
  meta?: {
    pageNumber: number
    pageSize: number
    total: number
  }
}

export interface NTPDetailResponse {
  data: NTP
}

export interface CreateNTPResponse {
  data: NTP
  message?: string
}

// ============================================
// UI FORM VALUES
// ============================================

export interface CreateNTPFormValues {
  ntpNumber: string
  description?: string
  date: string
  sourceType: 'PO' | 'Contract'
  sourceDocumentId: string
}

export interface ApproveNTPFormValues {
  signedDocument?: File
  approvedBy: string
  approvalRemarks?: string
}

export interface ReturnNTPFormValues {
  returnReason: ReturnReason
  returnRemarks: string
}

// ============================================
// SELECTION & LINKING
// ============================================

export interface SourceDocumentSelection {
  type: NTPSourceType
  documentId: string
  documentNumber: string
  supplier: Supplier
  amount: number
  items: NTPLineItem[]
}

// ============================================
// PO/CONTRACT LIST FOR SELECTION
// ============================================

export interface ApprovedPOForNTP {
  id: string
  poNumber: string
  date: string
  supplier: Supplier
  amount: number
  itemCount: number
  status: string
}

export interface ApprovedContractForNTP {
  id: string
  contractNumber: string
  date: string
  supplier: Supplier
  amount: number
  itemCount: number
  status: string
}

// ============================================
// UI STATE & COMPONENT PROPS
// ============================================

export interface NTPListFilters {
  status?: NTPStatus[]
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
  sourceType?: NTPSourceType
}

export interface NTPContextType {
  selectedNTP: NTP | null
  setSelectedNTP: (ntp: NTP | null) => void
}

// ============================================
// DIALOG PROPS
// ============================================

export interface CreateNTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (ntp: NTP) => void
}

export interface ApproveNTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NTP
  onApprove?: (payload: ApproveNTPPayload) => Promise<void>
}

export interface ReturnNTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ntp: NTP
  onReturn?: (payload: ReturnNTPPayload) => Promise<void>
}

export interface LinkSourceDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: SourceDocumentSelection) => void
}

// ============================================
// TABLE & COLUMN TYPES
// ============================================

export interface NTPTableRow extends NTP {
  actionMenu?: boolean
}

export interface NTPLinkedItemsTableProps {
  items: NTPLineItem[]
  isReadOnly?: boolean
}

// ============================================
// TRACKING & AUDIT
// ============================================

export interface NTPAuditTrail {
  ntpId: string
  event: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'RETURNED'
  timestamp: string
  actor: string
  details?: Record<string, any>
}

export interface NTPApprovalInfo {
  approvedBy: string
  approvedAt: string
  signedDocumentUrl: string
  signedDocumentName: string
}

// ============================================
// EXPORT TYPES FOR FORM SUBMISSION
// ============================================

export type NTPFormData = CreateNTPFormValues | ApproveNTPFormValues | ReturnNTPFormValues
