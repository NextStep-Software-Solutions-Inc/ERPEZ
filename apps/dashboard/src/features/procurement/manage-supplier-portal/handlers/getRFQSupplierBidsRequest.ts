import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { RFQSupplierBidResponse } from '../types'

export const getRFQSupplierBidsRequest: QueryBlueprintFromTemplate<
  '/rfqs/:rfqId/bids',
  APIResponse<RFQSupplierBidResponse[]>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/rfqs/:rfqId/bids',
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RFQSupplierBidResponse[]>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
