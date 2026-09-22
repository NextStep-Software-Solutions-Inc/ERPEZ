/**
 * Direct Contracting Types
 * Matches the backend DirectContractingResponse schema with frontend-friendly conventions.
 */

export interface DirectContracting {
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
  status: string
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