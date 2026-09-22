import type { DirectContracting as BaseDirectContracting } from '../store/directContractingStore'

export type DirectContractingRecord = BaseDirectContracting & {
  name?: string
  bacProjectId?: string
  bacProjectTitle?: string
  exclusiveSupplierId?: string
  exclusiveSupplierName?: string
  exclusiveSupplierEmail?: string
  exclusiveSupplierContact?: string
  exclusiveSupplierPhilGEPS?: string
  submissionDeadline?: string
}

export const COLUMN_LABELS: Record<string, string> = {
  dcNumber: 'Request Details & Title',
  supplier: 'Exclusive Supplier',
  totalABC: 'Total ABC Amount',
  deadline: 'Submission Deadline',
  status: 'Procurement Status',
}

export interface TableActionHandlers {
  onCopyDCNumber: (dcNumber: string) => void
  onViewProposal: (entry: DirectContractingRecord) => void
  onEdit: (id: string) => void
  onPromptSubmit: (id: string) => void
  onPromptDelete: (id: string) => void
}
