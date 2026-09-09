import type {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type {
  ProcurementActivityType
} from '../types/procurementActivityTypes'
import api from '@/services/api'

const endpoint = '/procurement-activity-types'

export const getProcurementActivityTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementActivityType>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<{
      data?: ProcurementActivityType[]
      pageNumber?: number
      pageSize?: number
      totalPages?: number
      totalCount?: number
      totalRows?: number
      totalPageNumber?: number
      succeeded?: boolean
      message?: string
      errors?: Record<string, string[]>
      loadMore?: boolean
    }>(finalUrl, { signal })
    const raw = response.data
    return {
      data: raw.data ?? [],
      succeeded: raw.succeeded ?? true,
      message: raw.message ?? '',
      errors: raw.errors ?? {},
      pageSize: raw.pageSize ?? 10,
      pageNumber: raw.pageNumber ?? 1,
      totalPageNumber: raw.totalPageNumber ?? raw.totalPages ?? 1,
      totalRows: raw.totalRows ?? raw.totalCount ?? raw.data?.length ?? 0,
      loadMore: raw.loadMore ?? false,
    }
  },
}
