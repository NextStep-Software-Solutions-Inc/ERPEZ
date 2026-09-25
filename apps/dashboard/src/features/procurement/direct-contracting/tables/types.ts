import type { DirectContracting } from '../types'

export type { DirectContracting }

export const COLUMN_LABELS: Record<string, string> = {
  dcNumber: 'Request Details & Title',
  supplier: 'Exclusive Supplier',
  totalABC: 'Total ABC Amount',
  deadline: 'Submission Deadline',
  status: 'Procurement Status',
}

export interface TableActionHandlers {
  onCopyDCNumber?: (dcNumber: string) => void
  onViewProposal?: (entry: DirectContracting) => void
  onEdit: (id: string) => void
  onPromptSubmit: (id: string) => void
  onPromptConvertToDraft?: (id: string) => void
  onPromptDelete: (id: string) => void
}
