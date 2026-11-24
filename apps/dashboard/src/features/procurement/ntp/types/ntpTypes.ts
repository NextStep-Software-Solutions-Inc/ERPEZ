/**
 * Notice to Proceed (NTP) Types & Interfaces
 * RA 12009 (New Government Procurement Act - NGPA) & GPPB Standard Form Aligned
 */

import type { QueryParams } from 'erpez-shared-lib'

// ============================================
// STATUS ENUMS & TYPES
// ============================================

export enum NTPStatus {
  DRAFT = 'Draft',
  ISSUED = 'Issued',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
}

export type NoticeToProceedStatus = 'Draft' | 'Issued' | 'Received' | 'Cancelled'

export enum NTPSourceType {
  CONTRACT = 'Contract',
}

// ============================================
// LINE ITEM & SUPPLIER
// ============================================

export interface NTPLineItem {
  id?: string
  itemId?: string
  itemCode?: string
  description: string
  quantity: number
  unitOfMeasurement?: string
  unit?: string
  unitPrice: number
  totalPrice: number
  specs?: string
  deliveryPeriod?: string
}

export interface Supplier {
  id: string
  supplierId?: string
  supplierName: string
  contactPerson?: string
  address?: string
  email?: string
  phoneNumber?: string
}

// ============================================
// DTO INTERFACES (MATCHING BACKEND)
// ============================================

export interface NoticeToProceedListItem {
  id: string
  contractId: string
  ntpNumber: string
  contractNumber?: string | null
  supplierName?: string | null
  projectTitle?: string | null
  ntpDate: string
  effectivityDate?: string | null
  commencementDate?: string | null
  status: NoticeToProceedStatus
  receivedDate?: string | null
  receivedBy?: string | null
  philGepsPostingDate?: string | null
  isPhilGepsPosted: boolean
  hasGeneratedDocument: boolean
  createdAt: string
}

export interface NoticeToProceedDetail {
  id: string
  contractId: string
  ntpNumber: string
  ntpDate: string
  effectivityDate?: string | null
  commencementDate?: string | null
  implementationPeriodDays?: number | null
  implementationPeriodText?: string | null
  placeOfDelivery?: string | null

  // Snapshots
  contractNumberSnapshot?: string | null
  awardedAmountSnapshot?: number | null
  supplierNameSnapshot?: string | null
  supplierAddressSnapshot?: string | null
  projectTitleSnapshot?: string | null
  contractApprovedDateSnapshot?: string | null

  // Status & Lifecycle
  status: NoticeToProceedStatus
  issuedDate?: string | null
  issuedBy?: string | null
  receivedDate?: string | null
  receivedBy?: string | null
  conformeName?: string | null
  conformeDesignation?: string | null
  conformeDate?: string | null
  cancellationReason?: string | null
  cancelledDate?: string | null
  cancelledBy?: string | null

  // PhilGEPS
  philGepsPostingDate?: string | null
  philGepsReferenceNumber?: string | null
  isPhilGepsPosted: boolean

  // Narrative
  description?: string | null
  remarks?: string | null

  // Upstream Contract & Project metadata
  contractNumber?: string | null
  contractStatus?: string | null
  contractAmount?: number | null
  procurementProjectId?: string | null
  projectTitle?: string | null
  projectReferenceNumber?: string | null
  procurementMode?: string | null
  supplierId?: string | null
  supplierName?: string | null
  supplierAddress?: string | null
  lineItems: NTPLineItem[]

  // Document metadata
  hasGeneratedDocument: boolean
  generatedDocumentId?: string | null

  // Audit
  createdAt: string
  createdBy?: string | null
  lastModifiedAt?: string | null
  lastModifiedBy?: string | null
}

export interface AvailableContractForNoticeToProceed {
  id?: string
  contractId?: string
  contractNumber: string
  supplierId?: string | null
  supplierName?: string | null
  procurementProjectId?: string | null
  projectTitle?: string | null
  projectReferenceNumber?: string | null
  awardedAmount?: number
  totalAmount?: number
  contractApprovedDate?: string | null
  contractApprovedAt?: string | null
  status: string | number
}

export interface NoticeToProceedSummary {
  totalCount: number
  draftCount: number
  issuedCount: number
  receivedCount: number
  cancelledCount: number
  pendingIssuanceCount: number
  philGepsPostedCount: number
}

// Backward-compatibility aliases
export type NTP = NoticeToProceedDetail
export type ApprovedContractForNTP = AvailableContractForNoticeToProceed
export interface ApprovedPOForNTP {
  id: string
  poNumber: string
  date: string
  supplier: Supplier
  amount: number
  itemCount: number
  status: string
}

// ============================================
// API PAYLOAD TYPES
// ============================================

export interface CreateNoticeToProceedRequest {
  contractId: string
  ntpNumber?: string
  ntpDate: string
  effectivityDate?: string
  commencementDate?: string
  implementationPeriodDays?: number
  implementationPeriodText?: string
  placeOfDelivery?: string
  description?: string
  remarks?: string
}

export interface UpdateNoticeToProceedRequest {
  ntpNumber?: string
  ntpDate: string
  effectivityDate?: string
  commencementDate?: string
  implementationPeriodDays?: number
  implementationPeriodText?: string
  placeOfDelivery?: string
  description?: string
  remarks?: string
}

export interface IssueNoticeToProceedRequest {
  issuedDate?: string
  remarks?: string
}

export interface RecordNoticeToProceedReceiptRequest {
  receivedAt: string
  receivedByName: string
  receivedDate?: string
  conformeName?: string
  conformeDesignation?: string
  conformeDate?: string
  remarks?: string
  signedDocumentFileId?: string
  signedDocumentFileName?: string
}

export interface CancelNoticeToProceedRequest {
  reason: string
}

export interface CreateNTPPayload {
  contractId: string
  ntpNumber?: string
  ntpDate: string
  effectivityDate?: string
  commencementDate?: string
  implementationPeriodDays?: number
  implementationPeriodText?: string
  placeOfDelivery?: string
  description?: string
  remarks?: string
  sourceType?: 'PO' | 'Contract'
  sourceDocumentId?: string
}

// ============================================
// QUERY PARAMS & PAGINATION
// ============================================

export interface GetNoticeToProceedsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  pageNumber?: number
  pageSize?: number
  Filters?: string
  filters?: string
  Sorts?: string
  sorts?: string
  Search?: string
  search?: string
  Status?: string
  status?: string
}

export interface NoticeToProceedPaginatedData {
  items: NoticeToProceedListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// ============================================
// UI FORM VALUES & PROPS
// ============================================

export interface CreateNTPFormValues {
  contractId: string
  ntpNumber?: string
  ntpDate: string
  effectivityDate?: string
  commencementDate?: string
  implementationPeriodDays?: number
  implementationPeriodText?: string
  placeOfDelivery?: string
  description?: string
  remarks?: string
  sourceType?: 'PO' | 'Contract'
  sourceDocumentId?: string
}

export interface IssueNTPFormValues {
  issuedDate?: string
  remarks?: string
}

export interface RecordNTPReceiptFormValues {
  receivedDate: string
  conformeName: string
  conformeDesignation: string
  conformeDate: string
  remarks?: string
}

export interface CancelNTPFormValues {
  reason: string
}

export interface NTPTableRow extends NoticeToProceedListItem {
  actionMenu?: boolean
}
