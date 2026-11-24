/**
 * GET /contracts
 * Paginated list of contracts with optional Sieve filters, status, and search.
 */

import type {
  APIResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { ContractListItem } from '../types'

const endpoint = '/contracts' as const

export interface GetContractsParams extends QueryParams {
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
  Status?: string
  status?: string
}

export interface ContractsPaginatedData {
  items: ContractListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export const getContractsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ContractsPaginatedData>,
  GetContractsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<Record<string, unknown>>>(finalUrl, { signal })
    const res = response.data

    // The backend returns APIResponse<PaginatedList<ContractListDto>>
    // PaginatedList has: Items, TotalCount, PageNumber, PageSize, TotalPages
    const rawData = res?.data ?? res
    const items: ContractListItem[] = Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
          ? rawData
          : []

    const paginatedData: ContractsPaginatedData = {
      items,
      totalCount: Number(rawData?.totalCount ?? rawData?.totalRows ?? items.length),
      pageNumber: Number(rawData?.pageNumber ?? 1),
      pageSize: Number(rawData?.pageSize ?? items.length),
      totalPages: Number(rawData?.totalPages ?? rawData?.totalPageNumber ?? 1),
    }

    return {
      ...res,
      data: paginatedData,
    } as APIResponse<ContractsPaginatedData>
  },
}
