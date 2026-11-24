import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { PPMP } from '../types'
import api from '@/services/api'

const endpoint = '/ppmps'

export type PaginatedPPMPResponse = {
  data: PPMP[]
  succeeded: boolean
  message?: string | null
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  totalPageNumber?: number
  totalRows?: number
}

export const getPPMPsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginatedPPMPResponse,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url, queryParams }) => [url, queryParams],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginatedPPMPResponse>(finalUrl, {
      signal,
    })
    return response.data
  },
}
