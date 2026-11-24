/**
 * Get RFQ List Request Handler
 * Fetches list of RFQs from backend for linking to AOB
 */

import type { QueryBlueprintFromTemplate, PaginationResponse } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/rfqs'

export interface GetRFQListParams {
  pageNumber?: number
  pageSize?: number
  filters?: string
  sorts?: string
  status?: string
}

export interface RFQListItem {
  id: string
  rfqNumber: string
  description?: string
  tracingNumber?: string
  modeOfProcurementName?: string
  deadline?: string
  deliveryPeriod?: string
  status?: string
}

export const getRFQListRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<RFQListItem>,
  GetRFQListParams
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<RFQListItem>>(finalUrl, { signal })
    return response.data
  },
}
