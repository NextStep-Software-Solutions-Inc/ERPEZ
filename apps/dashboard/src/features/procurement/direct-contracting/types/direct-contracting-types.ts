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

export type DirectContracting = {
  id: string
  dcNumber: string
  name: string
  dcName?: string // Frontend convenience alias for name
  bacProjectId: string
  bacProjectTitle: string
  bacProjectABC: number
  bacProjectStatus: string
  exclusiveSupplierId: string
  exclusiveSupplierName: string
  supplierName?: string // Frontend convenience alias for exclusiveSupplierName
  exclusiveSupplierEmail: string
  exclusiveSupplierContact: string
  exclusiveSupplierPhilGEPS: string
  submissionDeadline: string
  deadline?: string // Frontend convenience alias for submissionDeadline
  status: DirectContractingStatusEnum
  totalABC: number
  reviewRemarks?: string
  createdByUserId?: string
  reviewedByUserId?: string
  createdAt: string
  createdBy: string
  approvedAttachment?: {
    fileId: string
  }
  // directContractingProposal?: DirectContractingProposal
  proposal?: DirectContractingProposal
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