/**
 * GET /purchase-requests/stats
 * Fetch summary metrics (totals, counts) for the PR dashboard widgets.
 * Optionally scoped to a specific office and/or PR type.
 */

import type {
  QueryBlueprintFromTemplate,
  APIResponse,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseRequestStats, PRTypeApi } from '../types/apiTypes'

const endpoint = '/purchase-requests/stats' as const

export interface GetPurchaseRequestStatsParams extends QueryParams {
  officeId?: string
  prType?: PRTypeApi
}

export const getPurchaseRequestStatsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<PurchaseRequestStats>,
  GetPurchaseRequestStatsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<APIResponse<PurchaseRequestStats>>(finalUrl)
    return response.data
  },
}
