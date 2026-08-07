import { create } from 'zustand'
import type { QuotationItemBid } from '@/features/procurement/supplier-portal/types/daItemTypes'
import api from '@/services/api'

export type ProofFile = {
  id: string
  name: string
  url?: string
  fileType?: 'image' | 'pdf' | 'document'
  uploadedAt?: string
}

export type DirectContracting = {
  id: string
  dcNumber: string
  dcName: string
  bacResolutionId?: string
  bacResolutionNumber: string
  prNumber: string
  office: string
  category: string
  modeOfProcurement: 'Direct Contracting'
  totalABC: number
  status: 'draft' | 'submitted' | 'for-review' | 'submitted-to-supplier' | 'approved' | 'rejected'
  supplierId?: string
  supplierName?: string
  proposalAmount?: number
  remarks?: string
  reason?: string
  totalItems?: number
  proposalAttachment?: string
  approvedBy?: string
  approvedAt?: string
  approvalDocumentFileName?: string
  approvalDocumentUrl?: string
  removedFromDashboard?: boolean
  // Document fields (Aligned with Supplier Portal)
  exclusivityProofFileName?: string
  exclusivityProofUrl?: string
  soleDistCertFileName?: string
  soleDistCertUrl?: string
  proposalNotes?: string
  // New fields for RFQ-style quotation consistency
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
  createdAt: string
  deadline: string
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

interface DirectContractingStore {
  entries: DirectContracting[]
  isLoading: boolean
  addEntry: (e: DirectContracting) => void
  updateEntry: (id: string, patch: Partial<DirectContracting>) => void
  removeEntry: (id: string) => void
  fetchEntries: () => Promise<void>
}

export const useDirectContractingStore = create<DirectContractingStore>(
  (set) => ({
    entries: [],
    isLoading: false,
    addEntry: (e) => set((state) => ({ entries: [e, ...state.entries] })),
    updateEntry: (id, patch) =>
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),
    removeEntry: (id) =>
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      })),
    fetchEntries: async () => {
      set({ isLoading: true })
      try {
        const response = await api.get<{ succeeded: boolean; data: BackendDirectContractingItem[] }>('/direct-contracting')
        if (response.data?.succeeded && Array.isArray(response.data.data)) {
          const mapped = response.data.data.map(item => {
            const statusMap: Record<string, DirectContracting['status']> = {
              'approved': 'approved',
              'draft': 'draft',
              'submitted': 'submitted',
              'for-review': 'for-review',
              'for_review': 'for-review',
              'submitted-to-supplier': 'submitted-to-supplier',
              'submitted_to_supplier': 'submitted-to-supplier',
              'pending_for_approval': 'for-review',
              'pending-for-approval': 'for-review',
              'returned': 'rejected',
              'rejected': 'rejected',
            }
            return {
              id: item.id,
              dcNumber: item.dcNumber || '',
              dcName: item.name || '',
              bacResolutionId: item.bacProjectId,
              bacResolutionNumber: item.resolutionNumber || item.bacProjectTitle || '',
              prNumber: item.resolutionNumber || item.bacProjectTitle || '',
              office: item.exclusiveSupplierName || '',
              category: item.resolutionType || 'General',
              modeOfProcurement: 'Direct Contracting' as const,
              totalABC: item.totalABC || 0,
              status: statusMap[(item.status || '').toLowerCase()] || 'draft',
              supplierId: item.exclusiveSupplierId,
              supplierName: item.exclusiveSupplierName,
              createdAt: item.createdAt || new Date().toISOString(),
              deadline: item.submissionDeadline || '',
              remarks: item.reviewRemarks || '',
            }
          })
          set({ entries: mapped })
        }
      } catch (err) {
        console.error(err)
      } finally {
        set({ isLoading: false })
      }
    }
  })
)
