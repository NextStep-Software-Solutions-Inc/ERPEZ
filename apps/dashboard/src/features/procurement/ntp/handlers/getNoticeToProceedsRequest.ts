/**
 * GET /notice-to-proceed
 * Paginated list of Notice to Proceed records with Sieve filters, search, and status.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type {
  GetNoticeToProceedsParams,
  NoticeToProceedListItem,
  NoticeToProceedPaginatedData,
} from '../types/ntpTypes'

const endpoint = '/notice-to-proceed' as const

export const getNoticeToProceedsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<NoticeToProceedPaginatedData>,
  GetNoticeToProceedsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Record<string, unknown>>>(finalUrl, { signal })
    const res = response.data

    const rawData = res?.data ?? res
    const items: NoticeToProceedListItem[] = Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
          ? rawData
          : []

    const paginatedData: NoticeToProceedPaginatedData = {
      items,
      totalCount: Number(rawData?.totalCount ?? rawData?.totalRows ?? items.length),
      pageNumber: Number(rawData?.pageNumber ?? 1),
      pageSize: Number(rawData?.pageSize ?? items.length),
      totalPages: Number(rawData?.totalPages ?? rawData?.totalPageNumber ?? 1),
    }

    return {
      ...res,
      data: paginatedData,
    } as APIResponse<NoticeToProceedPaginatedData>
  },
}
