/**
 * Get AOB Detail Request Handler
 * Fetches complete AOB details including linked RFQs and awarded winners from backend API
 */

import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { AOBDetail } from '../types/aobTypes'
import api from '@/services/api'

const endpoint = '/aobs/:id' as const

interface RawBackendAOBDetailResponse {
  id: string
  aobNumber: string
  description?: string
  awardCriterion: string
  aobDate: string
  openingDate: string
  status: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  signedDocumentUrl?: string
  remarks?: string
  bacResolutionNumber?: string
  prNumber?: string
  papCode?: string
  approverName?: string
  approverTitle?: string
  rfqs?: Array<{
    id: string
    rfqNumber: string
    tracingNumber?: string
    totalAmount?: number
    status?: string
    date?: string
    deadline?: string
  }>
  awardedItems?: Array<{
    id: string
    rfqItemId: string
    itemName: string
    winningSupplierId: string
    winningSupplierName: string
    awardedUnitPrice: number
    awardedQuantity: number
    totalAwardedAmount: number
    score?: number
    awardReason?: string
    purchaseOrderId?: string
  }>
}

export const getAOBDetailRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  AOBDetail,
  undefined
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{ data: RawBackendAOBDetailResponse }>(finalUrl, { signal })
    const d = response.data.data

    const rawRfqs = d.rfqs || (d as any).rfQs || []

    const aobDetail: AOBDetail = {
      id: d.id,
      aobNumber: d.aobNumber,
      description: d.description || '',
      date: d.aobDate || '',
      aobDate: d.aobDate || '',
      openingDate: d.openingDate || '',
      status: d.status,
      awardCriterion: d.awardCriterion,
      rfqNumber: rawRfqs.length > 0 ? rawRfqs.map((r) => r.rfqNumber).join(', ') : '-',
      rfqIds: rawRfqs.map((r) => r.id),
      rfqs: rawRfqs,
      submittedBy: d.submittedBy,
      submittedAt: d.submittedAt,
      approvedBy: d.approvedBy,
      approvedAt: d.approvedAt,
      approverName: d.approverName,
      approverTitle: d.approverTitle,
      signedDocumentUrl: d.signedDocumentUrl,
      remarks: d.remarks,
      bacResolutionNumber: d.bacResolutionNumber,
      prNumber: d.prNumber,
      papCode: d.papCode,
      awardedItems: d.awardedItems || [],
      createdAt: d.aobDate || d.submittedAt || '',
    }

    return aobDetail
  },
}
