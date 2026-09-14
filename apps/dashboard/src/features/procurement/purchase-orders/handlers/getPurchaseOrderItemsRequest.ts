/**
 * GET /purchase-orders/:id/items
 * Retrieve paginated line items for a Purchase Order.
 */

import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { PurchaseOrderLineItem } from '../types'

const endpoint = '/purchase-orders/:id/items' as const

export interface GetPurchaseOrderItemsParams extends QueryParams {
  pageSize?: number
  pageNumber?: number
}

export const getPurchaseOrderItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<PurchaseOrderLineItem>,
  GetPurchaseOrderItemsParams,
  QueryKey,
  { id: string }
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<any>(finalUrl, { signal })
    const res = response.data

    const items: PurchaseOrderLineItem[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
          ? res.items
          : []

    return {
      data: items,
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
