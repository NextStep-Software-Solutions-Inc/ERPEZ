/**
 * GET /purchase-requests
 * Paginated list of purchase requests.
 * Supports Sieve-style filter strings e.g. "status==Submitted", "prType==NonCSE"
 */

import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
  PaginationResponse,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseRequestListItem } from '../types/apiTypes'

const endpoint = '/purchase-requests' as const

export interface GetPurchaseRequestsParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  /** Sieve filter string. Example: "status==Submitted", "prType==NonCSE|prType==OutOfStock" */
  Filters?: string
  /** Sieve sort string. Example: "-requestedDate" */
  Sorts?: string
}

export const getPurchaseRequestsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PurchaseRequestListItem>,
  GetPurchaseRequestsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl }) => {
    const response = await api.get<PaginationResponse<PurchaseRequestListItem>>(finalUrl)
    return response.data
  },
}
