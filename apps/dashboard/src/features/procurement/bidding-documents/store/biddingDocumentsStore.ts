import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BiddingDocumentRecord } from '../types'

interface BiddingDocumentsState {
  documents: BiddingDocumentRecord[]
  selectedBacResolutionId: string | null
}

interface BiddingDocumentsActions {
  setDocuments: (documents: BiddingDocumentRecord[]) => void
  selectDocument: (bacResolutionId: string) => void
  updateDocument: (
    bacResolutionId: string,
    patch: Partial<BiddingDocumentRecord>,
  ) => void
}

export type BiddingDocumentsStore = BiddingDocumentsState &
  BiddingDocumentsActions

export const useBiddingDocumentsStore = create<BiddingDocumentsStore>()(
  persist(
    (set) => ({
      documents: [],
      selectedBacResolutionId: null,

      setDocuments: (documents) => set({ documents }),
      selectDocument: (bacResolutionId) =>
        set({ selectedBacResolutionId: bacResolutionId }),
      updateDocument: (bacResolutionId, patch) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.bacResolutionId === bacResolutionId
              ? { ...doc, ...patch }
              : doc,
          ),
        })),
    }),
    {
      name: 'erpez-bidding-documents-store',
    },
  ),
)
