import type { DirectContracting } from '@/features/procurement/direct-contracting/types'

export type { DirectContracting }

export const COLUMN_LABELS: Record<string, string> = {
  select: 'Select',
  dcNumber: 'DC Reference Number',
  prNumber: 'PR & BAC Project',
  dcName: 'Item Description',
  totalABC: 'Total Budget (ABC) / Proposal',
  deadline: 'Submission Deadline',
  status: 'Quotation Status',
  actions: 'Actions',
}

export interface SupplierTableActionHandlers {
  onViewDetails: (id: string) => void
  onOpenQuotation?: (item: DirectContracting) => void
  onCopyDCNumber?: (dcNumber: string) => void
}
