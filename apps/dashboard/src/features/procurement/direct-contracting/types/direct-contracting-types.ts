import type { QuotationItemBid } from '@/features/procurement/supplier-portal/types/daItemTypes'

/**
 * Direct Contracting Types
 * Matches the backend DirectContractingResponse schema with frontend-friendly conventions.
 */

/**
 * Aligned with backend DirectContractingStatusEnum (ERPEZ.Domain.Enums.DirectContractingStatusEnum)
 */
export enum DirectContractingStatusEnum {
  DRAFT = 'DRAFT',
  FOR_REVIEW = 'FOR_REVIEW',
  SUBMITTED_TO_SUPPLIER = 'SUBMITTED_TO_SUPPLIER',
  PENDING_FOR_APPROVAL = 'PENDING_FOR_APPROVAL',
  APPROVED = 'APPROVED',
  RETURNED = 'RETURNED',
}

/**
 * Aligned with backend ReviewAction (ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal.ReviewAction)
 */
export enum ReviewAction {
  Approved = 'Approved',
  Returned = 'Returned',
}

export const DIRECT_CONTRACTING_STATUS_LABELS: Record<DirectContractingStatusEnum, string> = {
  [DirectContractingStatusEnum.DRAFT]: 'Draft',
  [DirectContractingStatusEnum.FOR_REVIEW]: 'For Review',
  [DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER]: 'Submitted to Supplier',
  [DirectContractingStatusEnum.PENDING_FOR_APPROVAL]: 'Pending for Approval',
  [DirectContractingStatusEnum.APPROVED]: 'Approved',
  [DirectContractingStatusEnum.RETURNED]: 'Returned',
}

export type ProofFile = {
  id: string
  name: string
  url?: string
  fileType?: 'image' | 'pdf' | 'document'
  uploadedAt?: string
}

export interface BackendDirectContractingItem {
  id: string
  dcNumber: string
  name: string
  bacProjectId: string
  bacProjectTitle?: string
  resolutionNumber?: string
  resolutionType?: string
  exclusiveSupplierId: string
  exclusiveSupplierName?: string
  submissionDeadline?: string
  totalABC: number
  status: string
  createdAt?: string
  reviewRemarks?: string
  proposalAmount?: number
  bidTotalAmount?: number
  bidUnitPrice?: number
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidBrochureFileName?: string
  bidBrochureUrl?: string
}

export type DirectContracting = {
  id: string
  dcNumber: string
  name: string
  dcName?: string // Frontend convenience alias for name
  bacProjectId: string
  bacProjectTitle: string
  bacProjectABC?: number
  bacProjectStatus?: string
  exclusiveSupplierId: string
  exclusiveSupplierName: string
  supplierName?: string // Frontend convenience alias for exclusiveSupplierName
  exclusiveSupplierEmail?: string
  exclusiveSupplierContact?: string
  exclusiveSupplierPhilGEPS?: string
  submissionDeadline?: string
  deadline?: string // Frontend convenience alias for submissionDeadline
  status: DirectContractingStatusEnum | 'draft' | 'submitted' | 'for-review' | 'submitted-to-supplier' | 'approved' | 'rejected' | string
  totalABC: number
  reviewRemarks?: string
  createdByUserId?: string
  reviewedByUserId?: string
  createdAt?: string
  approvedAttachment?: {
    fileId: string
  }
  proposal?: DirectContractingProposal
  items?: DirectContractingItem[]

  // Store & Supplier Portal / Legacy convenience fields
  bacResolutionId?: string
  bacResolutionNumber?: string
  prNumber?: string
  office?: string
  category?: string
  modeOfProcurement?: 'Direct Contracting' | string
  supplierId?: string
  proposalAmount?: number
  remarks?: string
  reason?: string
  totalItems?: number
  unit?: string
  proposalAttachment?: string
  approvedBy?: string
  approvedAt?: string
  approvalDocumentFileName?: string
  approvalDocumentUrl?: string
  removedFromDashboard?: boolean
  exclusivityProofFileName?: string
  exclusivityProofUrl?: string
  soleDistCertFileName?: string
  soleDistCertUrl?: string
  proposalNotes?: string
  quotationStatus?: 'draft' | 'submitted'
  quotationSubmittedAt?: string
  quotationItems?: QuotationItemBid[]
  bidTotalAmount?: number
  bidUnitPrice?: number
  proposalUnitPrice?: number
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidBrochureFileName?: string
  bidBrochureUrl?: string
  daRequirementsStatus?: 'draft' | 'submitted'
  daRequirementsSubmittedAt?: string
  createdBy?: string
}

export type DirectContractingItem = {
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


export type DirectContractingProposal = {
  id: string
  directContractingId: string
  supplierId: string
  supplierName: string
  exclusivityDocumentUrl: string
  proposalRemarks?: string
  totalProposalAmount: number
  submittedAt: string
  proposalItems: {
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
  }[]
}

export type DirectContractingSummary = {
  total: number
  draft: number
  forReview: number
  submittedToSupplier: number
  pendingForApproval: number
  approved: number
  returned: number
}