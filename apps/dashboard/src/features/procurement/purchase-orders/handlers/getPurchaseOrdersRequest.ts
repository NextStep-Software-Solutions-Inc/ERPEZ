/**
 * GET /purchase-orders
 * Paginated list of purchase orders with optional Sieve filters and search.
 */

import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseOrder } from '../types'

const endpoint = '/purchase-orders' as const

export interface GetPurchaseOrdersParams extends QueryParams {
  PageNumber?: number
  PageSize?: number
  pageNumber?: number
  pageSize?: number
  Filters?: string
  filters?: string
  Sorts?: string
  sorts?: string
  Search?: string
  search?: string
}

export type PurchaseOrdersResponse = PaginationResponse<PurchaseOrder> & {
  items: PurchaseOrder[]
}

export const getPurchaseOrdersRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PurchaseOrdersResponse,
  GetPurchaseOrdersParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<any>(finalUrl, { signal })
    const res = response.data

    const items: PurchaseOrder[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
          ? res.items
          : []

    return {
      data: items,
      items,
      succeeded: res?.succeeded ?? true,
      message: res?.message ?? '',
      pageNumber: res?.pageNumber ?? 1,
      pageSize: res?.pageSize ?? items.length,
      totalRows: res?.totalCount ?? items.length,
      totalPageNumber: res?.totalPages ?? 1,
      loadMore: false,
      errors: res?.errors ?? null,
    }
  },
}
