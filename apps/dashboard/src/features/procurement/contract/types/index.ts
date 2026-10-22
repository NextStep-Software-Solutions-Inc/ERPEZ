/**
 * Contract Feature TypeScript Type Definitions
 * Aligned with RA 12009 / Feb 2025 GPPB IRR backend DTOs and CQRS Commands.
 */

export type ContractStatus =
  | 'draft'
  | 'for-approval'
  | 'approved'
  | 'executed'
  | 'returned'
  | 'cancelled'

export type ContractCategory =
  | 'Consulting'
  | 'Infrastructure'
  | 'Goods and Services'

export interface ContractLineItem {
  id: string
  itemName: string
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  totalAmount: number
  specifications?: string | null
  deliverySchedule?: string | null
  category?: string | null
  fund?: string | null
}

export interface ContractListItem {
  id: string
  contractNumber: string
  contractDate: string
  description: string
  status: string
  noticeOfAwardId: string
  noaNumber: string
  supplierId: string
  supplierName: string
  procurementProjectId: string
  projectTitle: string
  totalAmount: number
  createdAt: string
  approvedAt?: string | null
  approvedByName?: string | null
  executedAt?: string | null
  category?: ContractCategory
}

export interface ContractDetail {
  id: string
  contractNumber: string
  contractDate: string
  description: string
  status: string
  noticeOfAwardId: string
  noaNumber: string
  noaDate: string
  noticeOfAwardType?: string | null
  bacResolutionNumber?: string | null
  supplierId: string
  supplierName: string
  supplierAddress?: string | null
  supplierContactPerson?: string | null
  supplierContactNumber?: string | null
  procurementProjectId: string
  projectTitle: string
  modeOfProcurement?: string | null
  totalAmount: number
  conformeReceivedAt?: string | null
  performanceSecurityPostedAt?: string | null
  contractExecutedMilestoneAt?: string | null
  signedFileUrl?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  approvedByName?: string | null
  approvalRemarks?: string | null
  returnedAt?: string | null
  returnedByName?: string | null
  returnRemarks?: string | null
  executedAt?: string | null
  executedByName?: string | null
  items: ContractLineItem[]
  createdAt: string
  createdByName?: string | null
  category?: ContractCategory
  wfpScope?: string | null
}

export interface ContractSummary {
  total: number
  draft: number
  forApproval: number
  approved: number
  executed: number
  returned: number
  cancelled: number
  totalActiveAmount: number
}

export interface AvailableNoaForContract {
  id: string
  noaNumber: string
  noaDate: string
  supplierId: string
  supplierName: string
  procurementProjectId: string
  projectTitle: string
  totalAmount: number
  modeOfProcurement?: string | null
  noticeOfAwardType?: string | null
  wfpScope?: string | null
}

export interface CreateContractRequest {
  noticeOfAwardId: string
  contractNumber?: string
  contractDate: string
  description: string
}

export interface UpdateContractRequest {
  contractNumber?: string
  contractDate: string
  description: string
}

export interface ApproveContractRequest {
  remarks?: string
}

export interface ReturnContractRequest {
  remarks: string
}
