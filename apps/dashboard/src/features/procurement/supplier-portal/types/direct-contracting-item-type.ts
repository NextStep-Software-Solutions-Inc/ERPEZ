// ─── Direct Contracting Item Types ────────────────────────────────────────────
// Shared type definitions for the Direct Contracting supplier-portal feature.
// - `DirectContractingItem` is used for `getAll` list requests, tables, and stores.
// - `DirectContractingItemDetails` is used for `getById` detail requests and detail views.

import type { DirectContractingStatusEnum } from '@/features/procurement/direct-contracting/types/direct-contracting-types'

export type DAStatus =
  | 'pending_receipt'
  | 'for_review'
  | 'for-review'
  | 'submitted-to-supplier'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'submitted'
  | DirectContractingStatusEnum
  | string

export type QuotationItemBid = {
  /** Canonical CPR / PPMP item ID used when submitting proposals to backend */
  cprItemId?: string
  /** prItemId is optional for the fallback single-item DA quoting flow where
   *  we use 'single' as the key. */
  prItemId?: string
  itemName: string
  qty: number
  unit: string
  unitBid?: number
  bidUnitPrice: number
  bidTotalAmount: number
  model?: string
  bidModel?: string
  brand?: string
  bidBrand?: string
  color?: string
  bidColor?: string
  brochureFileUrl?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
}

export type DirectContractingLineItem = {
  id: string
  cprItemId?: string
  sourceItemId: string
  itemName: string
  description?: string
  unit: string
  quantity: number
  unitABC: number
  totalABC: number
  office: string
  prNumber?: string
  papCode?: string
  category?: string
  sourceType: string
}

export type DirectContractingProposalItemDetails = {
  id: string
  proposalId: string
  cprItemId: string
  cprItemName: string
  quantity?: number
  unitABC: number
  totalABC: number
  unitBid: number
  totalBid: number
  brand?: string
  model?: string
  color?: string
  brochureFileUrl?: string
}

export type DirectContractingProposalDetails = {
  id: string
  directContractingId: string
  supplierId: string
  supplierName: string
  exclusivityDocumentUrl: string
  proposalRemarks?: string
  totalProposalAmount: number
  submittedAt: string
  proposalItems: Array<DirectContractingProposalItemDetails>
}

/**
 * `DirectContractingItem`
 * Used for `getAll` list queries, table rows, and store entries.
 * Preserves all original DA item attributes while including Direct Contracting list attributes.
 */
export type DirectContractingItem = {
  id: string
  daNumber: string
  dcNumber?: string
  name?: string
  dcName?: string
  prNumber: string
  bacProjectId?: string
  bacProjectTitle?: string
  bacProjectABC?: number
  bacProjectStatus?: string
  bacResolutionId?: string
  bacResolutionNumber?: string
  itemName: string
  supplierOrStore: string
  exclusiveSupplierId?: string
  exclusiveSupplierName?: string
  exclusiveSupplierEmail?: string
  exclusiveSupplierContact?: string
  exclusiveSupplierPhilGEPS?: string
  supplierId?: string
  supplierName?: string
  purchaseSource: 'Local Market' | 'Online' | 'Direct Store' | 'Accredited Supplier' | string
  quantity: number
  totalItems?: number
  unit: string
  actualPurchaseAmount: number
  totalAmount: number
  totalABC?: number
  office?: string
  category?: string
  modeOfProcurement?: 'Direct Contracting' | string
  receiptAttachment?: string
  receiptFileName?: string
  purchaseDate: string
  createdAt?: string
  createdBy?: string
  createdByUserId?: string
  reviewedByUserId?: string
  submissionDeadline?: string
  deadline?: string
  status: DAStatus
  remarks?: string
  reviewRemarks?: string
  reason?: string
  approvedBy?: string
  approvedAt?: string
  approvedAttachment?: {
    fileId: string
  } | null
  proposalAttachment?: string
  removedFromDashboard?: boolean
  // Quotation fields
  quotationStatus?: 'draft' | 'submitted'
  quotationSubmittedAt?: string
  /** Per-item bids from the linked Consolidated PR */
  quotationItems?: Array<QuotationItemBid>
  // Legacy single-item bid fields (kept for backward compat)
  bidUnitPrice?: number
  bidTotalAmount?: number
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
  // DA Requirements (Direct Contracting / Sole Distributorship)
  exclusivityProofFileName?: string
  exclusivityProofUrl?: string
  soleDistCertFileName?: string
  soleDistCertUrl?: string
  proposalNotes?: string
  proposalUnitPrice?: number
  proposalAmount?: number
  daRequirementsStatus?: 'draft' | 'submitted'
  daRequirementsSubmittedAt?: string
  // Approval document uploaded by the dashboard when approving an entry
  approvalDocumentFileName?: string
  approvalDocumentUrl?: string
  // Embedded proposal & line items summary when available in list payload
  proposal?: DirectContractingProposalDetails | null
  items?: Array<DirectContractingLineItem>
}

/**
 * `DirectContractingItemDetails`
 * Used for `getById` detail queries and detail views (`/api/supplier/direct-contracting/:id` & `/direct-contracting/:id`).
 * Includes all `DirectContractingItem` attributes along with full BAC Project, Supplier, Proposal, and Line Item details.
 */
export type DirectContractingItemDetails = DirectContractingItem & {
  dcNumber: string
  name: string
  dcName?: string
  bacProjectId: string
  bacProjectTitle: string
  bacProjectABC?: number
  bacProjectStatus?: string
  exclusiveSupplierId: string
  exclusiveSupplierName: string
  exclusiveSupplierEmail?: string
  exclusiveSupplierContact?: string
  exclusiveSupplierPhilGEPS?: string
  submissionDeadline?: string
  deadline?: string
  totalABC: number
  reviewRemarks?: string
  createdByUserId?: string
  reviewedByUserId?: string
  createdAt?: string
  createdBy?: string
  approvedAttachment?: {
    fileId: string
  } | null
  proposal?: DirectContractingProposalDetails | null
  items?: Array<DirectContractingLineItem>
}
