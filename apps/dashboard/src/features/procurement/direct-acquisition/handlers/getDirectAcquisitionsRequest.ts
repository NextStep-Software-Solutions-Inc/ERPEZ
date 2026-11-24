import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { DirectAcquisition, ProofFile } from '../store/directAcquisitionStore'
import api from '@/services/api'

export interface BackendDirectAcquisitionCPRItem {
  id: string
  prItemId: string
  purchaseRequestId: string
  prNumber: string
  prOffice: string
  itemName: string
  itemDescription?: string
  category: string
  fund?: string
  month?: string
  unit: string
  quantity: number
  unitPrice: number
  totalAmount: number
  procurementMode?: string
  allowPartial: boolean
}

export interface BackendDirectAcquisitionDocument {
  id: string
  directAcquisitionId: string
  directPurchaseEntryId?: string
  fileId: string
  fileName: string
  fileType?: string
  blobUrl?: string
  documentType: string
  uploadedAt: string
}

export interface BackendDirectPurchaseEntry {
  id: string
  directAcquisitionId: string
  supplierId?: string
  supplierName: string
  supplierTIN?: string
  finalAmount: number
  transactionDate: string
  paymentMethod: 'DIRECT_TO_VENDOR' | 'EMPLOYEE_REIMBURSEMENT' | string
  payeeUserId?: string
  payeeName?: string
  remarks?: string
  proofDocuments: BackendDirectAcquisitionDocument[]
}

export interface BackendDirectAcquisitionItem {
  id: string
  daNumber: string
  consolidatedPRId: string
  cprNumber: string
  consolidatedPRDescription?: string
  bacProjectId?: string
  bacResolutionNumber?: string
  office: string
  category: string
  modeOfProcurement: string
  totalABC: number
  status: 'DRAFT' | 'PURCHASE_ENTRY' | 'FOR_DISBURSEMENT' | 'APPROVED' | 'RETURNED' | string
  remarks?: string
  createdByUserId?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  purchaseEntry?: BackendDirectPurchaseEntry | null
  documents: BackendDirectAcquisitionDocument[]
  consolidatedPRItems: BackendDirectAcquisitionCPRItem[]
  selectedItemIds?: string[]
}

export function mapBackendStatusToFrontend(status?: string): DirectAcquisition['status'] {
  const s = (status || '').toUpperCase().trim()
  if (s === 'PURCHASE_ENTRY' || s === 'PURCHASEENTRY') return 'purchase_entry'
  if (s === 'FOR_DISBURSEMENT' || s === 'FORDISBURSEMENT') return 'for_disbursement'
  if (s === 'APPROVED') return 'approved'
  if (s === 'RETURNED') return 'returned'
  return 'draft'
}

export function mapBackendItemToFrontend(item: BackendDirectAcquisitionItem): DirectAcquisition {
  const allDocs = (item.purchaseEntry?.proofDocuments && item.purchaseEntry.proofDocuments.length > 0)
    ? item.purchaseEntry.proofDocuments
    : (item.documents || [])

  const proofFiles: ProofFile[] = allDocs.map((doc) => ({
    id: doc.id || doc.fileId,
    fileId: doc.fileId || doc.id,
    name: doc.fileName || 'Proof Document',
    fileType: (doc.fileType?.toLowerCase().includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image') as ProofFile['fileType'],
    documentType: doc.documentType || 'PROOF_OF_TRANSACTION',
    url: `/files/download/${doc.fileId || doc.id}`,
    uploadedAt: doc.uploadedAt,
  }))

  const rawRemarks = item.remarks || item.purchaseEntry?.remarks || ''
  const cleanRemarks = rawRemarks.startsWith('SELECTED_ITEMS:')
    ? (item.purchaseEntry?.remarks || '')
    : rawRemarks

  const extractedSelectedIds = item.selectedItemIds || (
    rawRemarks.startsWith('SELECTED_ITEMS:')
      ? rawRemarks.substring('SELECTED_ITEMS:'.length).split(',').filter(Boolean)
      : undefined
  )

  return {
    id: item.id,
    daNumber: item.daNumber,
    consolidatedPrId: item.consolidatedPRId,
    prNumber: item.cprNumber || '',
    bacResolutionId: item.bacProjectId,
    bacResolutionNumber: item.bacResolutionNumber,
    office: item.office || 'Procurement Office',
    category: item.category || 'General',
    modeOfProcurement: item.modeOfProcurement || 'Direct Acquisition',
    totalABC: item.totalABC || 0,
    status: mapBackendStatusToFrontend(item.status),
    supplier: item.purchaseEntry?.supplierName,
    finalAmount: item.purchaseEntry?.finalAmount,
    transactionDate: item.purchaseEntry?.transactionDate,
    remarks: cleanRemarks || undefined,
    selectedItemIds: extractedSelectedIds,
    proofFiles,
    paymentMethod: item.purchaseEntry?.paymentMethod === 'EMPLOYEE_REIMBURSEMENT' ? 'employee_reimbursement' : 'direct_vendor',
    payeeName: item.purchaseEntry?.payeeName,
    supplierTin: item.purchaseEntry?.supplierTIN,
    createdBy: item.createdBy,
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

const endpoint = '/direct-acquisitions'

export const getDirectAcquisitionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  DirectAcquisition[]
> = {
  endpoint,
  key: ({ url }) => ['direct-acquisitions', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ succeeded: boolean; data: BackendDirectAcquisitionItem[] }>(finalUrl, { signal })
    const list = response.data?.data || []
    return list.map(mapBackendItemToFrontend)
  },
}
